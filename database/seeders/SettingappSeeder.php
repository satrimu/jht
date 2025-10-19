<?php

namespace Database\Seeders;

use App\Models\SettingApp;
use Illuminate\Database\Seeder;

class SettingappSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SettingApp::create([
            'nama_app' => 'Laravel React fullstack',
            'description' => 'Aplikasi web dengan Laravel + React + Inertiajs fullstack menggunakan ShadCN UI.',
            'address' => 'Jl Menuju Surga, no 01, Kecamatan Alim, Kabupaten Pesantren',
            'email' => 'adminemail@gmail.com',
            'phone' => '6285783024799',
            'facebook' => 'https://www.facebook.com/',
            'instagram' => 'https://www.instagram.com/',
            'tiktok' => 'https://www.tiktok.com/',
            'youtube' => 'https://www.youtube.com/',
            'image' => 'logo.webp',

        ]);
    }
}
