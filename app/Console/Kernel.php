<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Archive security logs older than 1 month every day at 01:00 AM
        $schedule->command('logs:archive-security')->dailyAt('01:00');

        // Prune expired personal access tokens daily at 02:00 AM
        $schedule->command('tokens:prune-expired')->dailyAt('02:00');

        // Alternative: Run weekly on Sundays if you prefer
        // $schedule->command('logs:archive-security')->weekly();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
