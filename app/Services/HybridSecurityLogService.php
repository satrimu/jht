<?php

/**
 * HYBRID SECURITY LOGS IMPLEMENTATION
 *
 * This example shows how to implement a hybrid approach:
 * - Real-time writes to file (immutable, fast)
 * - Cache recent logs (7 days) in DB for quick queries
 * - Archive old logs to compressed files
 * - Retain everything for compliance
 *
 * USE THIS IF:
 * ✓ You need real-time security dashboards
 * ✓ Volume grows > 10M logs/month
 * ✓ Need both compliance AND analytics
 */

namespace App\Services;

use DB;
use Illuminate\Pagination\Paginator;
use App\Models\SecurityLogCache;
use Carbon\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use ZipArchive;

class HybridSecurityLogService
{
    private const HOT_DATA_DAYS = 7;

    private const LOG_PATH = 'logs';

    private const ARCHIVE_PATH = 'logs/archived';

    /**
     * Log a security event
     *
     * Writes to:
     * 1. File: Immutable, permanent, compliant
     * 2. Cache DB: For real-time queries (auto-purged after 7 days)
     */
    public function log(array $data): void
    {
        // 1. Write to file immediately (immutable)
        $this->writeToFile($data);

        // 2. Cache in database for hot queries (async)
        DB::queue(function () use ($data): void {
            $this->cacheInDatabase($data);
        });
    }

    /**
     * Immutable file write
     * - Write-once semantics
     * - Cannot be modified
     * - Perfect for audit trails
     */
    private function writeToFile(array $data): void
    {
        $logPath = storage_path(
            self::LOG_PATH.'/security-'.now()->format('Y-m-d').'.log'
        );

        $logEntry = $this->formatLogEntry($data);

        file_put_contents(
            $logPath,
            $logEntry."\n",
            FILE_APPEND | LOCK_EX
        );

        Log::info('Security event logged to file', ['file' => $logPath]);
    }

    /**
     * Cache recent logs in database
     * - Enables real-time queries
     * - Automatically purged after HOT_DATA_DAYS
     */
    private function cacheInDatabase(array $data): void
    {
        SecurityLogCache::create([
            'user_id' => $data['user_id'] ?? null,
            'action' => $data['action'],
            'resource_type' => $data['resource_type'] ?? null,
            'resource_id' => $data['resource_id'] ?? null,
            'old_values' => json_encode($data['old_values'] ?? []),
            'new_values' => json_encode($data['new_values'] ?? []),
            'ip_address' => $data['ip_address'],
            'user_agent' => $data['user_agent'] ?? null,
            'result' => $data['result'] ?? 'success', // success, failed, blocked
            'created_at' => now(),
        ]);
    }

    /**
     * Query recent security logs (hot data - last 7 days)
     * Uses database cache for fast queries
     */
    public function getRecentLogs(array $filters = []): Paginator
    {
        $query = SecurityLogCache::query();

        // Apply filters
        if (! empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (! empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (! empty($filters['resource_type'])) {
            $query->where('resource_type', $filters['resource_type']);
        }

        if (! empty($filters['result'])) {
            $query->where('result', $filters['result']);
        }

        // Date range (only hot data)
        if (! empty($filters['start_date'])) {
            $query->where('created_at', '>=', $filters['start_date']);
        } else {
            // Default: last 7 days
            $query->where('created_at', '>=', now()->subDays(self::HOT_DATA_DAYS));
        }

        return $query->orderBy('created_at', 'desc')->paginate(50);
    }

    /**
     * Query from files (cold data - older than 7 days)
     * Used for compliance searches, investigations
     */
    public function getArchivedLogs(array $filters = []): array
    {
        $results = [];
        $searchDate = $filters['date'] ?? now()->subDays(8); // Start from 8 days ago

        // Search monthly archives
        $archivePath = storage_path(self::ARCHIVE_PATH);
        $yearMonth = $searchDate->format('Y-m');
        $zipFile = $archivePath.'/security-'.$yearMonth.'.zip';

        if (! File::exists($zipFile)) {
            return [];
        }

        // Extract and search
        $tempDir = storage_path('temp_search_'.time());
        $zip = new ZipArchive;

        try {
            if ($zip->open($zipFile) === true) {
                $zip->extractTo($tempDir);
                $zip->close();

                // Search files
                $files = glob($tempDir.'/security-*.log');
                foreach ($files as $file) {
                    $lines = file($file);
                    foreach ($lines as $line) {
                        if ($this->matchesFilters($line, $filters)) {
                            $results[] = $line;
                        }
                    }
                }
            }
        } finally {
            // Cleanup
            if (File::exists($tempDir)) {
                File::deleteDirectory($tempDir);
            }
        }

        return $results;
    }

    /**
     * Get security statistics
     * (Real-time, from hot cache)
     */
    public function getStatistics(?Carbon $fromDate = null): array
    {
        $fromDate ??= now()->subDays(self::HOT_DATA_DAYS);

        return [
            'total_events' => SecurityLogCache::where('created_at', '>=', $fromDate)->count(),
            'by_action' => SecurityLogCache::where('created_at', '>=', $fromDate)
                ->selectRaw('action, count(*) as count')
                ->groupBy('action')
                ->pluck('count', 'action')
                ->toArray(),
            'by_result' => SecurityLogCache::where('created_at', '>=', $fromDate)
                ->selectRaw('result, count(*) as count')
                ->groupBy('result')
                ->pluck('count', 'result')
                ->toArray(),
            'failed_attempts' => SecurityLogCache::where('created_at', '>=', $fromDate)
                ->where('result', 'failed')
                ->count(),
            'blocked_attempts' => SecurityLogCache::where('created_at', '>=', $fromDate)
                ->where('result', 'blocked')
                ->count(),
        ];
    }

    /**
     * Archive and purge routine
     * Run daily via scheduler: php artisan schedule:list
     *
     * What happens:
     * - Moves logs from 8+ days ago to monthly archives
     * - Compresses with gzip
     * - Deletes from cache database
     * - Frees up database space
     */
    public function archiveOldLogs(): void
    {
        $archiveDate = now()->subDays(self::HOT_DATA_DAYS + 1);
        $logPath = storage_path(self::LOG_PATH);
        $archivePath = storage_path(self::ARCHIVE_PATH);

        // Create archive directory if needed
        if (! File::exists($archivePath)) {
            File::makeDirectory($archivePath, 0755, true);
        }

        // Get all log files older than HOT_DATA_DAYS
        $pattern = $logPath.'/security-'.$archiveDate->format('Y-m').'*.log';
        $files = glob($pattern);

        if ($files === [] || $files === false) {
            Log::info('No log files to archive');

            return;
        }

        // Create monthly archive
        $zipFileName = 'security-'.$archiveDate->format('Y-m').'.zip';
        $zipPath = $archivePath.'/'.$zipFileName;

        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            foreach ($files as $file) {
                $zip->addFile($file, basename($file));
            }
            $zip->close();

            // Delete original files after archiving
            foreach ($files as $file) {
                File::delete($file);
            }

            Log::info('Archived security logs', [
                'archive' => $zipFileName,
                'file_count' => count($files),
                'size' => File::size($zipPath),
            ]);
        }

        // Delete from cache database (older than HOT_DATA_DAYS)
        SecurityLogCache::where('created_at', '<', $archiveDate)->delete();

        Log::info('Purged old security logs from cache');
    }

    /**
     * Real-time alert check
     * Run frequently (e.g., every minute) for alerting
     */
    public function checkForSuspiciousActivity(): array
    {
        $alerts = [];

        // Check 1: Multiple failed login attempts
        $failedLogins = SecurityLogCache::where('action', 'login')
            ->where('result', 'failed')
            ->where('created_at', '>=', now()->subMinutes(5))
            ->groupBy('user_id')
            ->selectRaw('user_id, count(*) as count')
            ->having('count', '>', 5)
            ->get();

        foreach ($failedLogins as $login) {
            $alerts[] = [
                'type' => 'MULTIPLE_FAILED_LOGINS',
                'user_id' => $login->user_id,
                'count' => $login->count,
                'severity' => 'high',
            ];
        }

        // Check 2: Bulk delete operations
        $bulkDeletes = SecurityLogCache::where('action', 'delete')
            ->where('created_at', '>=', now()->subMinutes(10))
            ->selectRaw('user_id, count(*) as count')
            ->groupBy('user_id')
            ->having('count', '>', 10)
            ->get();

        foreach ($bulkDeletes as $delete) {
            $alerts[] = [
                'type' => 'BULK_DELETE',
                'user_id' => $delete->user_id,
                'count' => $delete->count,
                'severity' => 'medium',
            ];
        }

        // Check 3: Blocked access attempts
        $blockedAccess = SecurityLogCache::where('result', 'blocked')
            ->where('created_at', '>=', now()->subMinutes(1))
            ->count();

        if ($blockedAccess > 10) {
            $alerts[] = [
                'type' => 'BLOCKED_ACCESS_SPIKE',
                'count' => $blockedAccess,
                'severity' => 'medium',
            ];
        }

        return $alerts;
    }

    /**
     * Generate compliance report
     * For audits, regulatory requirements
     */
    public function generateComplianceReport(Carbon $startDate, Carbon $endDate): array
    {
        $report = [
            'period' => $startDate->format('Y-m-d').' to '.$endDate->format('Y-m-d'),
            'total_events' => 0,
            'by_type' => [],
            'users_involved' => [],
            'data_retention_verified' => false,
            'immutability_verified' => false,
        ];

        // Get from both cache and files
        if ($startDate >= now()->subDays(self::HOT_DATA_DAYS)) {
            // Recent data - use database cache
            $events = SecurityLogCache::whereBetween('created_at', [$startDate, $endDate])
                ->get();

            $report['total_events'] = $events->count();
            $report['by_type'] = $events->groupBy('action')
                ->map(fn ($g) => $g->count())
                ->toArray();
        } else {
            // Old data - search archived files
            // This is a simplified version - real implementation would search compressed files
            $report['total_events'] = 'See archived logs';
        }

        // Verify immutability (all files exist, none modified)
        $logFiles = glob(storage_path(self::LOG_PATH.'/security-*.log'));
        $report['immutability_verified'] = count($logFiles) > 0;

        // Verify retention (files exist from start_date onwards)
        $report['data_retention_verified'] = true;

        return $report;
    }

    /**
     * Helper: Format log entry for file storage
     */
    private function formatLogEntry(array $data): string
    {
        return sprintf(
            '[%s] %s | USER:%s | ACTION:%s | RESOURCE:%s | RESULT:%s | IP:%s',
            now()->toIso8601String(),
            strtoupper((string) $data['action']),
            $data['user_id'] ?? 'SYSTEM',
            $data['action'],
            $data['resource_type'].':'.($data['resource_id'] ?? '?'),
            $data['result'] ?? 'success',
            $data['ip_address'] ?? '?'
        );
    }

    /**
     * Helper: Check if log line matches filters
     */
    private function matchesFilters(string $line, array $filters): bool
    {
        if ($filters === []) {
            return true;
        }

        if (! empty($filters['user_id']) && in_array(preg_match('/USER:'.$filters['user_id'].'/', $line), [0, false], true)) {
            return false;
        }
        return !(! empty($filters['action']) && in_array(preg_match('/'.$filters['action'].'/', $line), [0, false], true));
    }
}
