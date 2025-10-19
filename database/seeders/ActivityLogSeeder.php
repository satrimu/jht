<?php

namespace Database\Seeders;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Spatie\Activitylog\Models\Activity;

class ActivityLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create an admin user for logging
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'full_name' => 'Administrator',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        // Get or create regular users
        $user1 = User::firstOrCreate(
            ['email' => 'user1@example.com'],
            [
                'name' => 'John Doe',
                'full_name' => 'John Alexander Doe',
                'password' => bcrypt('password'),
                'role' => 'user',
                'is_active' => true,
            ]
        );

        $user2 = User::firstOrCreate(
            ['email' => 'user2@example.com'],
            [
                'name' => 'Jane Smith',
                'full_name' => 'Jane Marie Smith',
                'password' => bcrypt('password'),
                'role' => 'user',
                'is_active' => true,
            ]
        );

        $user3 = User::firstOrCreate(
            ['email' => 'user3@example.com'],
            [
                'name' => 'Bob Johnson',
                'full_name' => 'Robert Johnson Jr',
                'password' => bcrypt('password'),
                'role' => 'user',
                'is_active' => false,
            ]
        );

        // Clear existing activity logs
        Activity::truncate();

        // Define activity types and messages
        $activities = [
            [
                'description' => 'created',
                'event' => 'created',
                'properties' => [
                    'old' => [],
                    'attributes' => [
                        'name' => 'John Doe',
                        'email' => 'john@example.com',
                        'role' => 'user',
                        'is_active' => true,
                    ],
                ],
            ],
            [
                'description' => 'updated',
                'event' => 'updated',
                'properties' => [
                    'old' => ['is_active' => true],
                    'attributes' => ['is_active' => false],
                ],
            ],
            [
                'description' => 'deleted',
                'event' => 'deleted',
                'properties' => [
                    'old' => [
                        'name' => 'Deleted User',
                        'email' => 'deleted@example.com',
                    ],
                ],
            ],
            [
                'description' => 'restored',
                'event' => 'restored',
                'properties' => [
                    'attributes' => [
                        'name' => 'Restored User',
                        'is_active' => true,
                    ],
                ],
            ],
        ];

        // Create activity logs from January 2026 to now (October 2025)
        // Start from January 1, 2026 and work backwards
        $startDate = Carbon::create(2026, 1, 1, 8, 0, 0);
        $endDate = Carbon::now(); // October 16, 2025 or current date

        // Generate logs going backwards from start date
        $currentDate = $startDate;
        $index = 0;

        while ($currentDate >= $endDate) {
            // Skip weekends occasionally
            // 70% chance to skip weekend
            if (($currentDate->dayOfWeek === 0 || $currentDate->dayOfWeek === 6) && rand(1, 100) <= 70) {
                $currentDate->subHours(random_int(12, 36));
                continue;
            }

            // Randomly select an activity
            $activity = $activities[array_rand($activities)];
            $causer = [null, $admin, $user1, $user2][random_int(0, 3)];
            $subject = [null, $user1, $user2, $user3][random_int(0, 3)];

            // Create activity log
            Activity::create([
                'log_name' => 'default',
                'description' => $activity['description'],
                'subject_type' => $subject ? User::class : null,
                'subject_id' => $subject?->id,
                'causer_type' => $causer ? User::class : null,
                'causer_id' => $causer?->id,
                'properties' => json_encode($activity['properties']),
                'batch_uuid' => null,
                'event' => $activity['event'],
                'created_at' => $currentDate,
                'updated_at' => $currentDate,
            ]);

            $index++;

            // Move to previous time (going backwards)
            $currentDate->subHours(random_int(2, 8));

            // Add some logs within the same day
            if (random_int(1, 100) <= 40) {
                for ($i = 0; $i < random_int(1, 3); $i++) {
                    $activity = $activities[array_rand($activities)];
                    $causer = [null, $admin, $user1, $user2][random_int(0, 3)];
                    $subject = [null, $user1, $user2, $user3][random_int(0, 3)];

                    Activity::create([
                        'log_name' => 'default',
                        'description' => $activity['description'],
                        'subject_type' => $subject ? User::class : null,
                        'subject_id' => $subject?->id,
                        'causer_type' => $causer ? User::class : null,
                        'causer_id' => $causer?->id,
                        'properties' => json_encode($activity['properties']),
                        'batch_uuid' => null,
                        'event' => $activity['event'],
                        'created_at' => $currentDate->copy()->subMinutes(random_int(5, 120)),
                        'updated_at' => $currentDate->copy()->subMinutes(random_int(5, 120)),
                    ]);
                }
            }

            // Stop after generating enough logs
            if ($index >= 150) {
                break;
            }
        }

        $this->command->info('Activity logs seeded successfully! Total: '.Activity::count().' logs');
    }
}
