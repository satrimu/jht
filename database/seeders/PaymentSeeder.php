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

        foreach ($users as $user) {
            foreach ($months as $month) {
                // Tentukan tanggal pembayaran random dalam bulan tersebut
                $paymentDate = $month->copy()->addDays(rand(1, min(28, $month->daysInMonth)));
                
                // Pastikan tanggal pembayaran tidak melebihi hari ini
                if ($paymentDate->gt(Carbon::now())) {
                    continue;
                }

                // Tentukan amount (iuran bulanan)
                $baseAmount = 100000; // IDR 100,000 base
                $variation = rand(-10000, 20000); // Variasi ±10k to +20k
                $amount = $baseAmount + $variation;

                // Tentukan status pembayaran
                $status = $this->determinePaymentStatus($paymentDate);

                // Tentukan apakah ada bukti pembayaran (image)
                $hasImage = rand(1, 100) <= 85; // 85% kemungkinan ada image
                $image = $hasImage ? $this->generateImageFilename($user->id, $paymentDate) : null;

                // Buat notes untuk beberapa pembayaran
                $notes = $this->generateNotes($status, $paymentDate);

                Payment::create([
                    'user_id' => $user->id,
                    'amount' => $amount,
                    'payment_date' => $paymentDate->format('Y-m-d'),
                    'status' => $status,
                    'notes' => $notes,
                    'image' => $image,
                    'created_at' => $paymentDate->copy()->addHours(rand(1, 6)),
                    'updated_at' => $paymentDate->copy()->addHours(rand(1, 6)),
                ]);

                $totalPayments++;
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
     * Tentukan status pembayaran berdasarkan tanggal
     */
    private function determinePaymentStatus(Carbon $paymentDate): string
    {
        $now = Carbon::now();
        $daysSincePayment = $paymentDate->diffInDays($now);

        // Pembayaran lama lebih likely sudah divalidasi
        if ($daysSincePayment > 60) {
            // 90% validated, 8% rejected, 2% pending
            $rand = rand(1, 100);
            if ($rand <= 90) return 'validated';
            if ($rand <= 98) return 'rejected';
            return 'pending';
        } elseif ($daysSincePayment > 30) {
            // 80% validated, 15% rejected, 5% pending
            $rand = rand(1, 100);
            if ($rand <= 80) return 'validated';
            if ($rand <= 95) return 'rejected';
            return 'pending';
        } else {
            // Pembayaran baru: 60% validated, 10% rejected, 30% pending
            $rand = rand(1, 100);
            if ($rand <= 60) return 'validated';
            if ($rand <= 70) return 'rejected';
            return 'pending';
        }
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
    private function generateNotes(?string $status, Carbon $paymentDate): ?string
    {
        // 40% kemungkinan ada notes
        if (rand(1, 100) > 40) {
            return null;
        }

        $notes = [
            'validated' => [
                'Pembayaran iuran bulan ' . $paymentDate->format('F Y'),
                'Transfer bank confirmed',
                'Iuran bulanan - terverifikasi',
                'Pembayaran tepat waktu',
                'Setoran rutin bulanan',
            ],
            'rejected' => [
                'Bukti transfer tidak jelas',
                'Nominal tidak sesuai',
                'Perlu upload ulang bukti pembayaran',
                'Data transfer tidak lengkap',
                'Foto bukti transfer blur',
            ],
            'pending' => [
                'Menunggu verifikasi admin',
                'Sedang dalam proses review',
                'Upload bukti transfer baru',
                'Pembayaran dalam antrian verifikasi',
                'Menunggu konfirmasi',
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
        $validated = Payment::where('status', 'validated')->count();
        $pending = Payment::where('status', 'pending')->count();
        $rejected = Payment::where('status', 'rejected')->count();
        
        $totalAmount = Payment::where('status', 'validated')->sum('amount');
        $avgAmount = Payment::avg('amount');

        $this->command->info("\n📊 Payment Summary:");
        $this->command->info("Total Payments: {$total}");
        $this->command->info("✅ Validated: {$validated}");
        $this->command->info("⏳ Pending: {$pending}");
        $this->command->info("❌ Rejected: {$rejected}");
        $this->command->info("💰 Total Validated Amount: " . number_format($totalAmount, 0, ',', '.'));
        $this->command->info("📈 Average Amount: " . number_format($avgAmount, 0, ',', '.'));
        
        // Monthly breakdown
        $this->command->info("\n📅 Monthly Breakdown:");
        $monthlyStats = Payment::selectRaw('strftime("%Y-%m", payment_date) as month, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        foreach ($monthlyStats as $stat) {
            $monthName = Carbon::createFromFormat('Y-m', $stat->month)->format('F Y');
            $this->command->info("  {$monthName}: {$stat->count} payments, " . number_format($stat->total, 0, ',', '.'));
        }
    }
}