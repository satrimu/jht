<?php

namespace Database\Seeders;

use App\Models\AppConfig;
use Illuminate\Database\Seeder;

class AppConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        AppConfig::updateOrCreate(
            ['title' => 'Fullstack Laravel React Starter'],
            [
                'title' => 'Fullstack Laravel React Starter',
                'description' => 'A modern, full-featured starter kit built with Laravel 12, React 19, and Inertia.js. Complete with authentication, dashboard, security logs, and admin panel.',
                'address' => 'Jl. Contoh No. 123, Jakarta, Indonesia',
                'phone' => '+62-812-3456-7890',
                'email' => 'info@example.com',
                'facebook' => 'https://facebook.com/example',
                'instagram' => 'https://instagram.com/example',
                'youtube' => 'https://youtube.com/@example',
                'tiktok' => 'https://tiktok.com/@example',
                'twitter' => 'https://twitter.com/example',
                'logo' => null,
            ]
        );
    }
}
