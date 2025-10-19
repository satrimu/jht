<?php

namespace App\Observers;

use App\Models\SettingApp;
use Illuminate\Support\Facades\Cache;
use Log;

class SettingAppObserver
{
    /**
     * Handle the SettingApp "created" event.
     */
    public function created(SettingApp $settingApp): void
    {
        $this->clearCache();
    }

    /**
     * Handle the SettingApp "updated" event.
     */
    public function updated(SettingApp $settingApp): void
    {
        $this->clearCache();
    }

    /**
     * Handle the SettingApp "deleted" event.
     */
    public function deleted(SettingApp $settingApp): void
    {
        $this->clearCache();
    }

    /**
     * Clear all related cache keys.
     */
    protected function clearCache(): void
    {
        // Clear settings cache
        Cache::forget('app.settings');

        // Extend cache TTL when data is updated to prevent frequent re-fetching
        Cache::put('app.settings', SettingApp::first(), now()->addHours(24));

        Log::info('SettingApp cache cleared and refreshed with 24 hour TTL');
    }
}
