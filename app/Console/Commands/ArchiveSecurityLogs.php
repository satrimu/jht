<?php

namespace App\Console\Commands;

use App\Services\SecurityLogService;
use Exception;
use Illuminate\Console\Command;

class ArchiveSecurityLogs extends Command
{
    protected $signature = 'logs:archive-security {--force : Force archive even if already done today}';

    protected $description = 'Archive security logs older than 1 month to ZIP files';

    public function __construct(protected SecurityLogService $logService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('🔄 Starting security logs archival...');

        try {
            $result = $this->logService->archiveOldLogs();

            if (empty($result['archived'])) {
                $this->info('✅ No logs to archive (still within current month)');

                return self::SUCCESS;
            }

            $this->info('✅ Successfully archived '.count($result['archived']).' file(s)');

            foreach ($result['archived'] as $archive) {
                $this->line("   📦 {$archive['from']} → {$archive['to']} (".$this->formatBytes($archive['size']).')');
            }

            if (! empty($result['errors'])) {
                $this->warn('⚠️ Encountered '.count($result['errors']).' error(s):');
                foreach ($result['errors'] as $error) {
                    $this->error("   ❌ $error");
                }
            }

            return self::SUCCESS;
        } catch (Exception $e) {
            $this->error('❌ Error archiving logs: '.$e->getMessage());

            return self::FAILURE;
        }
    }

    protected function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision).' '.$units[$i];
    }
}
