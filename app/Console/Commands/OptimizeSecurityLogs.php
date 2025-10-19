<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class OptimizeSecurityLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'logs:optimize 
                            {--months=2 : Number of months to keep uncompressed}
                            {--max-age=12 : Number of months to keep logs before deletion}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Optimize security logs by compressing old files by month and removing very old logs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $monthsToKeepUncompressed = (int) $this->option('months');
        $maxAgeInMonths = (int) $this->option('max-age');

        $this->info('Starting log optimization process...');
        $this->info("- Keeping logs for the last {$monthsToKeepUncompressed} months uncompressed");
        $this->info("- Removing logs older than {$maxAgeInMonths} months");

        $logDirectory = storage_path('logs');
        $files = File::files($logDirectory);

        // Group files by month
        $filesByMonth = [];
        $now = Carbon::now();
        $cutoffDateForCompression = $now->copy()->subMonths($monthsToKeepUncompressed);
        $cutoffDateForDeletion = $now->copy()->subMonths($maxAgeInMonths);

        foreach ($files as $file) {
            // Only process security log files
            if (! preg_match('/security-(\d{4})-(\d{2})-(\d{2})\.log$/', $file->getFilename(), $matches)) {
                continue;
            }

            $year = (int) $matches[1];
            $month = (int) $matches[2];
            $day = (int) $matches[3];

            $fileDate = Carbon::createFromDate($year, $month, $day);
            $monthKey = "{$year}-{$month}";

            // Skip current month files
            if ($fileDate->year === $now->year && $fileDate->month === $now->month) {
                $this->comment("Skipping current month file: {$file->getFilename()}");

                continue;
            }

            // Check if file should be deleted (older than max age)
            if ($fileDate->lt($cutoffDateForDeletion)) {
                $this->warn("Deleting old log file: {$file->getFilename()}");
                File::delete($file->getPathname());

                continue;
            }

            // Check if file should be compressed (older than compression threshold)
            if ($fileDate->lt($cutoffDateForCompression)) {
                if (! isset($filesByMonth[$monthKey])) {
                    $filesByMonth[$monthKey] = [];
                }
                $filesByMonth[$monthKey][] = $file;
            } else {
                $this->comment("Keeping recent file uncompressed: {$file->getFilename()}");
            }
        }

        // Compress files by month
        foreach ($filesByMonth as $month => $monthFiles) {
            $fileCount = count($monthFiles);
            $this->info("Processing {$month} logs ({$fileCount} files)...");

            // Create temporary directory for this month's files
            $tempDir = storage_path("logs/temp_{$month}");
            if (! File::exists($tempDir)) {
                File::makeDirectory($tempDir, 0755, true);
            }

            // Copy files to temp directory
            foreach ($monthFiles as $file) {
                $filename = $file->getFilename();
                File::copy($file->getPathname(), "{$tempDir}/{$filename}");
            }

            // Create zip archive
            $zipFilename = storage_path("logs/security-{$month}.zip");
            $this->createZipArchive($tempDir, $zipFilename);

            // Verify zip file was created successfully
            if (File::exists($zipFilename)) {
                $this->info("Created archive: security-{$month}.zip");

                // Delete original log files and temp directory
                foreach ($monthFiles as $file) {
                    File::delete($file->getPathname());
                }

                File::deleteDirectory($tempDir);
            } else {
                $this->error("Failed to create archive for {$month}");
                File::deleteDirectory($tempDir);
            }
        }

        $this->info('Log optimization completed successfully!');

        return Command::SUCCESS;
    }

    /**
     * Create a ZIP archive from directory contents
     */
    private function createZipArchive($sourceDir, $destination)
    {
        $zip = new \ZipArchive;

        if ($zip->open($destination, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === true) {
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($sourceDir),
                \RecursiveIteratorIterator::LEAVES_ONLY
            );

            foreach ($files as $name => $file) {
                // Skip directories (they will be added automatically)
                if (! $file->isDir()) {
                    // Get real and relative path for current file
                    $filePath = $file->getRealPath();
                    $relativePath = substr($filePath, strlen($sourceDir) + 1);

                    // Add current file to archive
                    $zip->addFile($filePath, $relativePath);
                }
            }

            // Zip archive will be created only after closing object
            $zip->close();

            return true;
        } else {
            return false;
        }
    }
}
