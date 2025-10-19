<?php

namespace App\Services;

use DateTime;
use Exception;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use ZipArchive;

class SecurityLogService
{
    protected string $logsPath;

    protected string $securityPath;

    protected string $archivedPath;

    public function __construct()
    {
        $this->logsPath = storage_path('logs');
        $this->securityPath = $this->logsPath.'/security';
        $this->archivedPath = $this->securityPath.'/archived';
    }

    /**
     * Get all active (current month) security logs
     */
    public function getActiveLogs(): array
    {
        $logs = [];

        if (! File::exists($this->securityPath)) {
            return $logs;
        }

        $files = File::files($this->securityPath);

        foreach ($files as $file) {
            if ($file->getExtension() === 'log' && str_starts_with($file->getBasename(), 'security-')) {
                $this->parseLogFile($file->getPathname(), $logs);
            }
        }

        // Sort by datetime descending
        usort($logs, fn (array $a, array $b): int => strtotime((string) $b['datetime']) - strtotime((string) $a['datetime']));

        return $logs;
    }

    /**
     * Get archived logs metadata (for download listing)
     */
    public function getArchivedLogs(): array
    {
        $archives = [];

        if (! File::exists($this->archivedPath)) {
            return $archives;
        }

        $files = File::files($this->archivedPath);

        foreach ($files as $file) {
            if (in_array($file->getExtension(), ['zip', 'gz', 'tar.gz'])) {
                $archives[] = [
                    'name' => $file->getBasename(),
                    'filename' => $file->getBasename(),
                    'size' => $file->getSize(),
                    'size_human' => $this->formatBytes($file->getSize()),
                    'created_at' => date('Y-m-d H:i:s', $file->getMTime()),
                    'path' => $file->getRealPath(),
                ];
            }
        }

        // Sort by date descending
        usort($archives, fn (array $a, array $b): int => strtotime($b['created_at']) - strtotime($a['created_at']));

        return $archives;
    }

    /**
     * Get active logs with pagination
     */
    public function getActiveLogsPaginated(int $perPage = 25, int $page = 1): array
    {
        $logs = $this->getActiveLogs();
        $total = count($logs);
        $pages = ceil($total / $perPage);
        $offset = ($page - 1) * $perPage;

        return [
            'data' => array_slice($logs, $offset, $perPage),
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => $pages,
            'has_more_pages' => $page < $pages,
        ];
    }

    /**
     * Parse a single log file
     */
    protected function parseLogFile(string $filePath, array &$logs): void
    {
        if (! File::exists($filePath)) {
            return;
        }

        $contents = File::get($filePath);
        $lines = explode("\n", $contents);

        foreach ($lines as $line) {
            if (trim($line) === '') {
                continue;
            }

            // Laravel log format: [YYYY-MM-DD HH:MM:SS] environment.LEVEL: message
            if (preg_match('/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]\s+(\w+)\.(\w+):\s+(.*)$/', $line, $matches)) {
                $datetime = $matches[1];
                $environment = $matches[2];
                $level = $matches[3];
                $message = $matches[4];

                // Try to parse JSON context if present
                $context = [];
                if (str_contains($message, '{') && preg_match('/\{.*\}$/', $message, $jsonMatch)) {
                    try {
                        $context = json_decode($jsonMatch[0], true);
                        $message = trim(str_replace($jsonMatch[0], '', $message));
                    } catch (Exception) {
                        // Not valid JSON, continue
                    }
                }

                $logs[] = [
                    'id' => md5($datetime.$message),
                    'datetime' => $datetime,
                    'environment' => $environment,
                    'level' => $level,
                    'message' => $message,
                    'context' => $context,
                ];
            }
        }
    }

    /**
     * Archive logs older than current month
     * Called via scheduler daily or manually
     */
    public function archiveOldLogs(): array
    {
        $now = new DateTime;
        $currentMonth = $now->format('Y-m');
        $result = [
            'archived' => [],
            'errors' => [],
        ];

        if (! File::exists($this->securityPath)) {
            return $result;
        }

        // Ensure archived directory exists
        if (! File::exists($this->archivedPath)) {
            File::makeDirectory($this->archivedPath, 0755, true);
        }

        $files = File::files($this->securityPath);

        foreach ($files as $file) {
            if ($file->getExtension() !== 'log') {
                continue;
            }

            // Extract date from filename: security-YYYY-MM-DD.log
            if (preg_match('/security-(\d{4}-\d{2})-\d{2}\.log/', $file->getBasename(), $matches)) {
                $fileMonth = $matches[1];

                if ($fileMonth !== $currentMonth) {
                    try {
                        $this->compressLogFile($file->getRealPath(), $fileMonth, $result);
                        // Delete original after successful compression
                        File::delete($file->getRealPath());
                    } catch (Exception $e) {
                        $result['errors'][] = "Failed to archive {$file->getBasename()}: ".$e->getMessage();
                    }
                }
            }
        }

        return $result;
    }

    /**
     * Compress a single log file or batch by month
     */
    protected function compressLogFile(string $filePath, string $fileMonth, array &$result): void
    {
        $fileName = basename($filePath);
        $archiveName = "security-logs-{$fileMonth}.zip";
        $archivePath = $this->archivedPath.'/'.$archiveName;

        // If archive already exists, append to it
        $zip = new ZipArchive;
        $shouldCreate = true;

        if (file_exists($archivePath) && $zip->open($archivePath) === true) {
            $shouldCreate = false;
        }

        if ($shouldCreate && $zip->open($archivePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new Exception("Cannot create archive: $archivePath");
        }

        // Add file to archive
        $zip->addFile($filePath, $fileName);
        $zip->close();

        $result['archived'][] = [
            'from' => $fileName,
            'to' => $archiveName,
            'size' => filesize($archivePath),
        ];
    }

    /**
     * Extract and parse logs from archive for viewing historical data
     */
    public function getArchivedLogContent(string $archiveFilename, int $perPage = 25, int $page = 1): array
    {
        $archivePath = $this->archivedPath.'/'.$archiveFilename;

        if (! File::exists($archivePath)) {
            return ['error' => 'Archive not found'];
        }

        $logs = [];
        $zip = new ZipArchive;

        if ($zip->open($archivePath) !== true) {
            return ['error' => 'Cannot open archive'];
        }

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $stat = $zip->statIndex($i);
            if ($stat && str_starts_with($stat['name'], 'security-')) {
                $contents = $zip->getFromIndex($i);
                $lines = explode("\n", $contents);

                foreach ($lines as $line) {
                    if (trim($line) === '') {
                        continue;
                    }
                    if (in_array(preg_match('/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]\s+(\w+)\.(\w+):\s+(.*)$/', $line, $matches), [0, false], true)) {
                        continue;
                    }
                    $datetime = $matches[1];
                    $environment = $matches[2];
                    $level = $matches[3];
                    $message = $matches[4];
                    $context = [];
                    if (str_contains($message, '{') && preg_match('/\{.*\}$/', $message, $jsonMatch)) {
                        try {
                            $context = json_decode($jsonMatch[0], true);
                            $message = trim(str_replace($jsonMatch[0], '', $message));
                        } catch (Exception) {
                            // Not valid JSON
                        }
                    }
                    $logs[] = [
                        'id' => md5($datetime.$message),
                        'datetime' => $datetime,
                        'environment' => $environment,
                        'level' => $level,
                        'message' => $message,
                        'context' => $context,
                    ];
                }
            }
        }

        $zip->close();

        // Sort by datetime descending
        usort($logs, fn (array $a, array $b): int => strtotime($b['datetime']) - strtotime($a['datetime']));

        $total = count($logs);
        $pages = ceil($total / $perPage);
        $offset = ($page - 1) * $perPage;

        return [
            'data' => array_slice($logs, $offset, $perPage),
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => $pages,
            'has_more_pages' => $page < $pages,
            'archive_name' => $archiveFilename,
        ];
    }

    /**
     * Format bytes to human readable format
     */
    protected function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision).' '.$units[$i];
    }

    /**
     * Get statistics about security logs
     */
    public function getStatistics(): array
    {
        $activeLogs = $this->getActiveLogs();
        $archivedLogs = $this->getArchivedLogs();

        $levelCount = [];
        $totalSize = 0;

        foreach ($activeLogs as $log) {
            $level = $log['level'];
            $levelCount[$level] = ($levelCount[$level] ?? 0) + 1;
        }

        foreach ($archivedLogs as $archive) {
            $totalSize += $archive['size'];
        }

        return [
            'active_count' => count($activeLogs),
            'archived_count' => count($archivedLogs),
            'archived_size' => $totalSize,
            'archived_size_human' => $this->formatBytes($totalSize),
            'level_distribution' => $levelCount,
        ];
    }
}
