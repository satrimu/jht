<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\User;
use Spatie\LaravelPdf\Facades\Pdf;
use Spatie\LaravelPdf\PdfBuilder;

class PdfService
{
    /**
     * Generate user report PDF
     */
    public function generateUserReportPdf(User $user, int $year): PdfBuilder
    {
        // Get user report data
        $userReport = $this->getUserReportData($user->id, $year);

        // Get period info
        $period = "Tahun $year";

        // Generate PDF
        return Pdf::view('pdfs.user-report', [
            'user' => $user,
            'userReport' => $userReport,
            'year' => $year,
            'period' => $period,
        ])
            ->format('A4')
            ->name("Laporan-{$user->full_name}-{$year}.pdf");
    }

    /**
     * Generate general report PDF
     */
    public function generateGeneralReportPdf(int $year, ?int $month = null): PdfBuilder
    {
        // Get general stats
        $generalStats = $this->getGeneralStats($year, $month);

        // Get monthly breakdown
        $monthlyBreakdown = $this->getMonthlyBreakdown($year);

        // Get members summary
        $members = $this->getMembersSummary($year, $month);

        // Get period info
        $period = $month ? "Bulan $month Tahun $year" : "Tahun $year";

        // Generate PDF
        $monthStr = $month ? str_pad((string) $month, 2, '0', STR_PAD_LEFT) : 'Tahunan';

        return Pdf::view('pdfs.general-report', [
            'generalStats' => $generalStats,
            'monthlyBreakdown' => $monthlyBreakdown,
            'members' => $members,
            'year' => $year,
            'month' => $month,
            'period' => $period,
        ])
            ->format('A4')
            ->landscape()
            ->name("Laporan-Umum-{$year}-{$monthStr}.pdf");
    }

    /**
     * Get user report data
     */
    private function getUserReportData(int $userId, int $year): array
    {
        $user = User::findOrFail($userId);

        // Get all payments for the year
        $payments = Payment::where('user_id', $userId)
            ->whereYear('payment_date', $year)
            ->orderBy('payment_date', 'desc')
            ->get();

        // Monthly breakdown for user
        $monthlyBreakdown = [];
        for ($month = 1; $month <= 12; $month++) {
            $query = Payment::where('user_id', $userId)
                ->whereYear('payment_date', $year)
                ->whereMonth('payment_date', $month);

            $stats = $query->selectRaw('
                COUNT(*) as payment_count,
                SUM(amount) as total_amount,
                COUNT(CASE WHEN status = "terbayar" THEN 1 END) as terbayar_count,
                SUM(CASE WHEN status = "terbayar" THEN amount ELSE 0 END) as terbayar_amount
            ')->first();

            /** @var \stdClass $stats */
            $stats = $stats;

            $monthlyBreakdown[] = [
                'month' => $month,
                'month_name' => $this->getMonthName($month),
                'payment_count' => (int) ($stats->payment_count ?? 0),
                'total_amount' => (float) ($stats->total_amount ?? 0),
                'terbayar_count' => (int) ($stats->terbayar_count ?? 0),
                'terbayar_amount' => (float) ($stats->terbayar_amount ?? 0),
            ];
        }

        // Status summary
        $statusSummary = [
            'total' => $payments->count(),
            'terbayar' => $payments->where('status', 'terbayar')->count(),
            'pending' => $payments->where('status', 'pending')->count(),
        ];

        // Amount summary
        $amountSummary = [
            'total' => (int) $payments->sum('amount'),
            'terbayar' => (int) $payments->where('status', 'terbayar')->sum('amount'),
            'pending' => (int) $payments->where('status', 'pending')->sum('amount'),
        ];

        return [
            'user' => $user,
            'payments' => $payments,
            'monthly_breakdown' => $monthlyBreakdown,
            'status_summary' => $statusSummary,
            'amount_summary' => $amountSummary,
            'year' => $year,
        ];
    }

    /**
     * Get general statistics
     */
    private function getGeneralStats(int $year, ?int $month = null): array
    {
        $query = Payment::whereYear('payment_date', $year);

        if ($month) {
            $query->whereMonth('payment_date', $month);
        }

        $totalMembers = User::where('id', '!=', 1)->count();

        $stats = $query->selectRaw('
            COUNT(*) as total_payments,
            COUNT(DISTINCT user_id) as active_members,
            SUM(amount) as total_amount,
            AVG(amount) as average_amount,
            COUNT(CASE WHEN status = "terbayar" THEN 1 END) as terbayar_payments,
            COUNT(CASE WHEN status = "pending" THEN 1 END) as pending_payments,
            SUM(CASE WHEN status = "terbayar" THEN amount ELSE 0 END) as terbayar_amount
        ')->first();

        /** @var \stdClass $stats */
        $stats = $stats;

        return [
            'total_members' => $totalMembers,
            'active_members' => (int) ($stats->active_members ?? 0),
            'total_payments' => (int) ($stats->total_payments ?? 0),
            'terbayar_payments' => (int) ($stats->terbayar_payments ?? 0),
            'pending_payments' => (int) ($stats->pending_payments ?? 0),
            'total_amount' => (int) ($stats->total_amount ?? 0),
            'terbayar_amount' => (int) ($stats->terbayar_amount ?? 0),
            'average_amount' => ($stats->total_payments ?? 0) > 0 ? round((float) ($stats->average_amount ?? 0), 2) : 0,
        ];
    }

    /**
     * Get monthly breakdown
     */
    private function getMonthlyBreakdown(int $year): array
    {
        $breakdown = [];

        for ($month = 1; $month <= 12; $month++) {
            $query = Payment::whereYear('payment_date', $year)
                ->whereMonth('payment_date', $month);

            $stats = $query->selectRaw('
                COUNT(*) as total_payments,
                COUNT(DISTINCT user_id) as unique_members,
                SUM(amount) as total_amount,
                COUNT(CASE WHEN status = "terbayar" THEN 1 END) as terbayar_count,
                SUM(CASE WHEN status = "terbayar" THEN amount ELSE 0 END) as terbayar_amount
            ')->first();

            /** @var \stdClass $stats */
            $stats = $stats;

            $breakdown[] = [
                'month' => $month,
                'month_name' => $this->getMonthName($month),
                'total_payments' => (int) ($stats->total_payments ?? 0),
                'unique_members' => (int) ($stats->unique_members ?? 0),
                'total_amount' => (int) ($stats->total_amount ?? 0),
                'terbayar_count' => (int) ($stats->terbayar_count ?? 0),
                'terbayar_amount' => (int) ($stats->terbayar_amount ?? 0),
            ];
        }

        return $breakdown;
    }

    /**
     * Get members summary
     */
    private function getMembersSummary(int $year, ?int $month = null): array
    {
        $query = Payment::whereYear('payment_date', $year);

        if ($month) {
            $query->whereMonth('payment_date', $month);
        }

        $members = User::where('id', '!=', 1)
            ->select(['id', 'full_name', 'email'])
            ->with([
                'payments' => function ($q) use ($year, $month) {
                    $q->whereYear('payment_date', $year);
                    if ($month) {
                        $q->whereMonth('payment_date', $month);
                    }
                }
            ])
            ->orderBy('full_name')
            ->get()
            ->map(function (User $member) {
                $terbayar = $member->payments->where('status', 'terbayar');
                $pending = $member->payments->where('status', 'pending');

                return [
                    'id' => $member->id,
                    'full_name' => $member->full_name,
                    'email' => $member->email,
                    'total_amount' => (int) $member->payments->sum('amount'),
                    'terbayar_amount' => (int) $terbayar->sum('amount'),
                    'pending_amount' => (int) $pending->sum('amount'),
                    'payment_count' => $member->payments->count(),
                ];
            })
            ->toArray();

        return $members;
    }

    /**
     * Get month name in Indonesian
     */
    private function getMonthName(int $month): string
    {
        $months = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ];

        return $months[$month] ?? 'Unknown';
    }
}
