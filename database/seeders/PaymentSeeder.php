<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan users exist terlebih dahulu
        $users = User::whereBetween('id', [2, 51])->get();

        if ($users->isEmpty()) {
            $this->command->warn('No users found with ID between 2-51. Please run UserSeeder first.');

            return;
        }

        $this->command->info("Creating payments for {$users->count()} users from January 2025 to October 2025...");

        // Periode pembayaran dari Januari 2025 sampai Oktober 2025 (bulan sekarang)
        $startDate = Carbon::create(2025, 1, 1);
        $endDate = Carbon::create(2025, 10, 31); // Oktober 2025

        $totalPayments = 0;
        $months = [];

        // Generate semua bulan dari Januari sampai Oktober 2025
        $currentMonth = $startDate->copy();
        while ($currentMonth->lte($endDate)) {
            $months[] = $currentMonth->copy();
            $currentMonth->addMonth();
        }

        // Track payment history untuk logika double payment
        $userPaymentHistory = [];

        foreach ($users as $user) {
            $userPaymentHistory[$user->id] = [];

            foreach ($months as $month) {
                // Tentukan tanggal pembayaran random dalam bulan tersebut
                $paymentDate = $month->copy()->addDays(random_int(1, min(28, $month->daysInMonth)));

                // Pastikan tanggal pembayaran tidak melebihi hari ini
                if ($paymentDate->gt(Carbon::now())) {
                    continue;
                }

                // Check apakah user membayar bulan sebelumnya
                $previousMonth = $month->copy()->subMonth();
                $paidPreviousMonth = in_array($previousMonth->format('Y-m'), $userPaymentHistory[$user->id]);

                // Logika pembayaran
                $shouldPay = random_int(1, 100) <= 85; // 85% kemungkinan membayar

                if ($shouldPay) {
                    // Jika bulan lalu belum bayar, maka bulan ini double (50000)
                    // Jika bulan lalu sudah bayar atau bulan pertama, maka normal (25000)
                    $amount = ! $paidPreviousMonth ? 50000 : 25000;

                    // Logika status:
                    // - Bulan berjalan: pending 40%, terbayar 60%
                    // - Bulan sebelumnya: SELALU terbayar
                    $isCurrentMonth = $month->format('Y-m') === Carbon::now()->format('Y-m');
                    if ($isCurrentMonth) {
                        // Bulan ini: 60% terbayar, 40% pending
                        $rand = random_int(1, 100);
                        $status = $rand <= 60 ? 'terbayar' : 'pending';
                    } else {
                        // Bulan sebelumnya: SELALU terbayar
                        $status = 'terbayar';
                    }

                    // Tentukan apakah ada bukti pembayaran (image)
                    $hasImage = random_int(1, 100) <= 85; // 85% kemungkinan ada image
                    $image = $hasImage ? $this->generateImageFilename($user->id, $paymentDate) : null;

                    // Buat notes untuk beberapa pembayaran
                    $notes = $this->generateNotes($status, $paymentDate, $amount);

                    Payment::create([
                        'user_id' => $user->id,
                        'amount' => $amount,
                        'payment_date' => $paymentDate->format('Y-m-d'),
                        'status' => $status,
                        'notes' => $notes,
                        'image' => $image,
                        'created_at' => $paymentDate->copy()->addHours(random_int(1, 6)),
                        'updated_at' => $paymentDate->copy()->addHours(random_int(1, 6)),
                    ]);

                    // Track bahwa user sudah bayar di bulan ini
                    $userPaymentHistory[$user->id][] = $month->format('Y-m');

                    $totalPayments++;
                }
            }

            // Progress indicator
            if ($totalPayments % 50 === 0) {
                $this->command->info("Created {$totalPayments} payments...");
            }
        }

        $this->command->info("✅ PaymentSeeder completed! Created {$totalPayments} payments for {$users->count()} users.");

        // Summary statistics
        $this->displaySummary();
    }

    /**
     * Generate filename untuk image
     */
    private function generateImageFilename(int $userId, Carbon $date): string
    {
        $prefix = 'payment';
        $timestamp = $date->format('Ymd');
        $randomStr = substr(str_shuffle('abcdefghijklmnopqrstuvwxyz0123456789'), 0, 8);

        return "{$prefix}_{$userId}_{$timestamp}_{$randomStr}.webp";
    }

    /**
     * Generate notes untuk pembayaran
     */
    private function generateNotes(?string $status, Carbon $paymentDate, int $amount): ?string
    {
        // 40% kemungkinan ada notes
        if (random_int(1, 100) > 40) {
            return null;
        }

        $isDouble = $amount === 50000;

        $notes = [
            'terbayar' => [
                'Pembayaran iuran bulan '.$paymentDate->format('F Y').($isDouble ? ' + cicilan bulan sebelumnya' : ''),
                'Transfer bank confirmed'.($isDouble ? ' - pembayaran double' : ''),
                'Iuran bulanan - terverifikasi'.($isDouble ? ' + tunggakan' : ''),
                'Pembayaran tepat waktu'.($isDouble ? ' (include cicilan)' : ''),
                'Setoran rutin bulanan'.($isDouble ? ' + pembayaran tunggakan' : ''),
            ],
            'pending' => [
                'Menunggu verifikasi admin'.($isDouble ? ' - pembayaran double' : ''),
                'Sedang dalam proses review'.($isDouble ? ' (termasuk cicilan)' : ''),
                'Upload bukti transfer baru'.($isDouble ? ' + cicilan bulan lalu' : ''),
                'Pembayaran dalam antrian verifikasi'.($isDouble ? ' - double payment' : ''),
                'Menunggu konfirmasi'.($isDouble ? ' (tunggakan + bulan ini)' : ''),
            ],
        ];

        $statusNotes = $notes[$status] ?? $notes['pending'];

        return $statusNotes[array_rand($statusNotes)];
    }

    /**
     * Display summary statistics
     */
    private function displaySummary(): void
    {
        $total = Payment::count();
        $terbayar = Payment::where('status', 'terbayar')->count();
        $pending = Payment::where('status', 'pending')->count();

        $totalAmount = Payment::sum('amount');
        $terbayarAmount = Payment::where('status', 'terbayar')->sum('amount');
        $avgAmount = Payment::avg('amount');

        // Breakdown by amount
        $standardPayments = Payment::where('amount', 25000)->count();
        $doublePayments = Payment::where('amount', 50000)->count();

        $this->command->info("\n📊 Payment Summary:");
        $this->command->info("Total Payments: {$total}");
        $this->command->info("✅ Terbayar: {$terbayar}");
        $this->command->info("⏳ Pending: {$pending}");
        $this->command->info('💰 Total Amount: '.number_format($totalAmount, 0, ',', '.'));
        $this->command->info('💳 Terbayar Amount: '.number_format($terbayarAmount, 0, ',', '.'));
        $this->command->info('📈 Average Amount: '.number_format($avgAmount, 0, ',', '.'));

        $this->command->info("\n💵 Payment Breakdown:");
        $this->command->info("  Standard (25.000): {$standardPayments} payments");
        $this->command->info("  Double (50.000): {$doublePayments} payments (bulan lalu belum bayar)");

        // Monthly breakdown
        $this->command->info("\n📅 Monthly Breakdown:");
        $monthlyStats = Payment::selectRaw('strftime("%Y-%m", payment_date) as month, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        foreach ($monthlyStats as $stat) {
            $monthName = Carbon::createFromFormat('Y-m', $stat->month)->format('F Y');
            $this->command->info("  {$monthName}: {$stat->count} payments, ".number_format($stat->total, 0, ',', '.'));
        }
    }
}
