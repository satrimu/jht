<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class SecurityLogsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $logsPath = storage_path('logs/security');

        // Make sure the logs/security directory exists
        if (! File::exists($logsPath)) {
            File::makeDirectory($logsPath, 0755, true);
        }

        // Define security log patterns
        $logPatterns = [
            'Authentication' => [
                'User {user} logged in successfully',
                'User {user} failed login attempt from {ip}',
                'User {user} logged out',
                'Password changed for user {user}',
                'User {user} enabled two-factor authentication',
            ],
            'Authorization' => [
                'User {user} attempted unauthorized access to {resource}',
                'Permission denied for user {user} on {resource}',
                'User {user} accessed admin panel',
                'Suspicious activity detected for user {user}',
            ],
            'Data Changes' => [
                'User {user} created record: {entity}',
                'User {user} modified record: {entity}',
                'User {user} deleted record: {entity}',
                'Bulk operation performed by user {user}',
            ],
            'System Events' => [
                'Database connection failed',
                'API rate limit exceeded from {ip}',
                'System backup completed',
                'Cron job executed successfully',
                'Cache cleared by administrator',
            ],
        ];

        // Users for substitution
        $users = ['Admin User', 'John Doe', 'Jane Smith', 'Bob Johnson'];
        $resources = ['Dashboard', 'User Management', 'Settings', 'Reports', 'Admin Panel'];
        $entities = ['User Profile', 'Product', 'Order', 'Invoice', 'Settings'];

        // Create logs for each day from Jan 1, 2026 backwards to now
        $startDate = Carbon::create(2026, 1, 1);
        $endDate = Carbon::now(); // October 16, 2025
        $currentDate = $startDate->copy();

        $fileCount = 0;

        while ($currentDate >= $endDate) {
            $logsForDay = [];
            $dayLogCount = random_int(5, 20); // 5-20 logs per day

            for ($i = 0; $i < $dayLogCount; $i++) {
                // Random time during the day
                $logTime = $currentDate->copy()->setTime(random_int(0, 23), random_int(0, 59), random_int(0, 59));

                // Random log type
                $category = array_rand($logPatterns);
                $templates = $logPatterns[$category];
                $template = $templates[array_rand($templates)];

                // Replace placeholders
                $message = $template;
                $message = str_replace('{user}', $users[array_rand($users)], $message);
                $message = str_replace('{resource}', $resources[array_rand($resources)], $message);
                $message = str_replace('{entity}', $entities[array_rand($entities)], $message);
                $message = str_replace('{ip}', random_int(192, 255).'.'.random_int(0, 255).'.'.random_int(0, 255).'.'.random_int(1, 254), $message);

                // Random log level
                $levels = ['DEBUG', 'INFO', 'NOTICE', 'WARNING', 'ERROR', 'CRITICAL'];
                $level = $levels[array_rand($levels)];

                // Create log entry in Laravel format
                $logEntry = '['.$logTime->toIso8601String().'] local.'.strtolower($level).': '.$message;

                $logsForDay[] = $logEntry;
            }

            // Write logs to file (one file per day)
            $fileName = $currentDate->format('Y-m-d');
            $logFile = $logsPath.'/security-'.$fileName.'.log';

            File::put($logFile, implode("\n", $logsForDay)."\n");
            $fileCount++;

            $currentDate->subDay();
        }

        // Count total logs created
        $totalLogFiles = count(File::glob($logsPath.'/security-*.log'));
        $totalLogs = 0;
        foreach (File::glob($logsPath.'/security-*.log') as $file) {
            $totalLogs += count(array_filter(explode("\n", File::get($file))));
        }

        $this->command->info('Security logs created successfully!');
        $this->command->info('Total log files: '.$totalLogFiles);
        $this->command->info('Total log entries: '.$totalLogs);
    }
}
