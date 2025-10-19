<?php

namespace App\Helpers;

use App\Models\SettingApp;
use Illuminate\Support\Facades\Cache;

class SeoHelper
{
    /**
     * Get SEO meta tags for the application.
     *
     * @return array<string, string|null>
     */
    public static function getSeoMeta(): array
    {
        return Cache::remember('app_seo_meta', now()->addDay(), function (): array {
            $config = SettingApp::first();

            $title = $config ? $config->nama_app : null;
            $description = $config ? $config->description : null;
            $email = $config ? $config->email : null;
            $imagePath = $config && $config->image ? asset("storage/images/{$config->image}") : null;

            return [
                'title' => $title ?? config('app.name'),
                'description' => $description ?? 'A modern fullstack application',
                'og_title' => $title ?? config('app.name'),
                'og_description' => $description ?? 'A modern fullstack application',
                'og_image' => $imagePath,
                'twitter_title' => $title ?? config('app.name'),
                'twitter_description' => $description ?? 'A modern fullstack application',
                'twitter_image' => $imagePath,
                'author' => $email,
            ];
        });
    }

    /**
     * Get specific meta tag.
     */
    public static function getMeta(string $key): ?string
    {
        $meta = self::getSeoMeta();

        return $meta[$key] ?? null;
    }

    /**
     * Get application config.
     */
    public static function getConfig(): ?SettingApp
    {
        return Cache::remember('app_config', now()->addDay(), fn (): ?SettingApp => SettingApp::first());
    }

    /**
     * Get contact information.
     *
     * @return array<string, string|null>
     */
    public static function getContactInfo(): array
    {
        $config = self::getConfig();

        return [
            'phone' => $config?->phone,
            'email' => $config?->email,
            'address' => $config?->address,
        ];
    }

    /**
     * Get social media links.
     *
     * @return array<string, string|null>
     */
    public static function getSocialMedia(): array
    {
        $config = self::getConfig();

        return [
            'facebook' => $config?->facebook,
            'instagram' => $config?->instagram,
            'youtube' => $config?->youtube,
            'tiktok' => $config?->tiktok,
        ];
    }

    /**
     * Invalidate SEO cache (call after updating config).
     */
    public static function invalidateCache(): void
    {
        Cache::forget('app_seo_meta');
        Cache::forget('app_config');
    }
}
