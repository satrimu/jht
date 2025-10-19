<?php

namespace Database\Seeders;

use App\Models\User;
use Exception;
use Faker\Factory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // SECURITY: Admin password MUST be set via environment variable
        $adminPassword = env('ADMIN_DEFAULT_PASSWORD');

        if (! $adminPassword) {
            // In development, generate a random password and display it
            if (app()->environment('local', 'development')) {
                $adminPassword = Str::random(24);
                $this->command->warn('=================================================');
                $this->command->warn('ADMIN_DEFAULT_PASSWORD not set in .env');
                $this->command->warn('Generated temporary admin password:');
                $this->command->info('Email: admin@admin.com');
                $this->command->info("Password: {$adminPassword}");
                $this->command->warn('For production, set ADMIN_DEFAULT_PASSWORD in .env');
                $this->command->warn('=================================================');
            } else {
                // In production, fail loudly
                throw new Exception(
                    'SECURITY ERROR: ADMIN_DEFAULT_PASSWORD must be set in .env file. '.
                    'This is required to prevent using weak default passwords. '.
                    'Generate a strong password with: php artisan tinker --execute="echo Str::random(24);"'
                );
            }
        }

        User::create([
            'name' => 'Super User',
            'email' => 'admin@admin.com',
            'password' => Hash::make($adminPassword),
            'image' => 'default.png',
            'role' => 'admin',
            'is_active' => true,
            'member_number' => 'M0001',
            'full_name' => 'Super Admin',
            'address' => 'Jl. Super Admin No. 1',
            'phone' => '081234567890',
            'join_date' => now(),
            'note' => 'This is a super admin user',
        ]);

        // Create regular users with random passwords
        for ($i = 1; $i <= 50; $i++) {
            $faker = Factory::create('id_ID');
            $genders = ['L', 'P'];
            $gender = $faker->randomElement($genders);
            $firstName = $gender === 'L' ? $faker->firstNameMale : $faker->firstNameFemale;
            $lastName = $faker->lastName;

            // SECURITY: Generate random password for each user
            $userPassword = Str::random(8);

            // In development, show generated passwords
            if (app()->environment('local', 'development') && $i <= 5) {
                // Only show first 5 to avoid cluttering output
                $email = 'user'.$i.'@santrimu.com';
                $this->command->line("User {$i}: {$email} / {$userPassword}");
            }

            User::create([
                'name' => $firstName.' '.$lastName,
                'email' => 'user'.$i.'@santrimu.com',
                'password' => Hash::make($userPassword),
                'image' => 'default.png',
                'role' => 'user',
                'is_active' => true,
                'member_number' => 'M'.str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'full_name' => $firstName.' '.$lastName,
                'address' => $faker->address,
                'phone' => $faker->phoneNumber,
                'join_date' => $faker->date(),
                'note' => 'This is user number '.$i,
            ]);
        }

        $this->command->info('✓ Seeded 1 admin user and regular users with secure random passwords');
    }
}
