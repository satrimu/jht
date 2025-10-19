<?php

namespace App\Repositories\Eloquent;

use App\Models\Payment;
use App\Models\User;
use App\Repositories\Contracts\ReportRepositoryInterface;

class ReportRepository implements ReportRepositoryInterface
{
    /**
     * Get general statistics for reports
     */
    public function getGeneralStats(int $year, ?int $month = null): array
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
            'total_amount' => (float) ($stats->total_amount ?? 0),
            'terbayar_amount' => (float) ($stats->terbayar_amount ?? 0),
            'average_amount' => ($stats->total_payments ?? 0) > 0 ? round((float) ($stats->average_amount ?? 0), 2) : 0,
            'period' => $month ? 'Bulan '.$month.' '.$year : 'Tahun '.$year,
        ];
    }

    /**
     * Get monthly breakdown for a year
     */
    public function getMonthlyBreakdown(int $year): array
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
                'total_amount' => (float) ($stats->total_amount ?? 0),
                'terbayar_count' => (int) ($stats->terbayar_count ?? 0),
                'terbayar_amount' => (float) ($stats->terbayar_amount ?? 0),
            ];
        }

        return $breakdown;
    }

    /**
     * Get individual user report
     */
    public function getUserReport(int $userId, int $year): array
    {
        $user = User::findOrFail($userId);

        // Get all payments for the year
        $payments = Payment::where('user_id', $userId)
            ->whereYear('payment_date', $year)
            ->with(['user'])
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
            'total' => $payments->sum('amount'),
            'terbayar' => $payments->where('status', 'terbayar')->sum('amount'),
            'pending' => $payments->where('status', 'pending')->sum('amount'),
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
     * Get data for export
     */
    public function getExportData(int $year, ?int $month = null, string $type = 'yearly'): array
    {
        if ($type === 'monthly') {
            // Monthly export - get all payments for specific month
            $payments = Payment::with(['user'])
                ->whereYear('payment_date', $year)
                ->whereMonth('payment_date', $month)
                ->orderBy('payment_date')
                ->get();

            return [
                'type' => 'monthly',
                'year' => $year,
                'month' => $month,
                'month_name' => $this->getMonthName($month),
                'payments' => $payments->map(function (Payment $payment) {
                    /** @var User $user */
                    $user = $payment->user;

                    return [
                        'id' => $payment->id,
                        'user_name' => $user->full_name,
                        'user_email' => $user->email,
                        'amount' => $payment->amount,
                        'payment_date' => $payment->payment_date,
                        'status' => $payment->status,
                        'notes' => $payment->notes,
                        'created_at' => $payment->created_at,
                    ];
                }),
            ];
        } else {
            // Yearly export - get monthly summary
            $monthlyData = $this->getMonthlyBreakdown($year);

            return [
                'type' => 'yearly',
                'year' => $year,
                'monthly_summary' => $monthlyData,
            ];
        }
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
