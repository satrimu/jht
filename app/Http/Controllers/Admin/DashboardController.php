<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Generate general report data
        $reportData = $this->generateGeneralReport();

        // dd($reportData);
        return Inertia::render('admin/dashboard', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => route('admin.dashboard')],
            ],
            'generalReport' => $reportData,
        ]);
    }

    /**
     * Generate comprehensive general report
     */
    private function generateGeneralReport(): array
    {
        $currentDate = Carbon::now();
        $currentMonth = $currentDate->format('Y-m');
        $oneYearAgo = $currentDate->copy()->subYear();

        // 1. Rekapitulasi Jumlah Anggota (exclude user ID 1)
        $memberStats = $this->getMemberStatistics();

        // 2. Rekapitulasi Iuran Bulan Ini
        $monthlyContribution = $this->getMonthlyContribution($currentMonth);

        // 3. Rekapitulasi Global Iuran Semua Anggota
        $globalContribution = $this->getGlobalContribution();

        // 4. Grafik Jumlah Iuran Selama 1 Tahun
        $yearlyChart = $this->getYearlyContributionChart($oneYearAgo, $currentDate);

        // 5. Chart global tahun ini (Januari - sekarang)
        $currentYearChart = $this->getCurrentYearChart();

        // 6. Additional summary statistics
        $summaryStats = $this->getSummaryStatistics();

        // 7. Recent payments
        $recentPayments = $this->getRecentPayments();

        return [
            'memberStats' => $memberStats,
            'monthlyContribution' => $monthlyContribution,
            'globalContribution' => $globalContribution,
            'yearlyChart' => $yearlyChart,
            'currentYearChart' => $currentYearChart,
            'summaryStats' => $summaryStats,
            'recentPayments' => $recentPayments,
            'generatedAt' => $currentDate->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Get member statistics (exclude user ID 1)
     */
    private function getMemberStatistics(): array
    {
        $totalMembers = User::where('id', '!=', 1)->count();
        $activeMembersThisMonth = User::where('id', '!=', 1)
            ->whereHas('payments', function ($query) {
                $query->whereMonth('payment_date', Carbon::now()->month)
                      ->whereYear('payment_date', Carbon::now()->year)
                      ->where('status', 'validated');
            })
            ->count();

        $inactiveMembersThisMonth = $totalMembers - $activeMembersThisMonth;

        return [
            'totalMembers' => $totalMembers,
            'activeMembersThisMonth' => $activeMembersThisMonth,
            'inactiveMembersThisMonth' => $inactiveMembersThisMonth,
            'memberActivityRate' => $totalMembers > 0 ? round(($activeMembersThisMonth / $totalMembers) * 100, 2) : 0,
            'currentMonthName' => Carbon::now()->format('F Y'),
        ];
    }

    /**
     * Get monthly contribution data
     */
    private function getMonthlyContribution(string $currentMonth): array
    {
        $monthlyPayments = Payment::whereRaw('strftime("%Y-%m", payment_date) = ?', [$currentMonth])
            ->where('status', 'validated')
            ->get();

        $totalAmount = $monthlyPayments->sum('amount');
        $totalPayments = $monthlyPayments->count();
        $averageAmount = $totalPayments > 0 ? $totalAmount / $totalPayments : 0;

        // Breakdown by week
        $weeklyBreakdown = Payment::whereRaw('strftime("%Y-%m", payment_date) = ?', [$currentMonth])
            ->where('status', 'validated')
            ->selectRaw('
                CASE 
                    WHEN strftime("%d", payment_date) BETWEEN "01" AND "07" THEN "Week 1"
                    WHEN strftime("%d", payment_date) BETWEEN "08" AND "14" THEN "Week 2"
                    WHEN strftime("%d", payment_date) BETWEEN "15" AND "21" THEN "Week 3"
                    ELSE "Week 4+"
                END as week,
                COUNT(*) as count,
                SUM(amount) as total
            ')
            ->groupBy('week')
            ->get();

        // Count unique members who paid this month
        $uniqueMembers = Payment::whereRaw('strftime("%Y-%m", payment_date) = ?', [$currentMonth])
            ->where('status', 'validated')
            ->distinct('user_id')
            ->count('user_id');

        return [
            'currentMonthName' => Carbon::createFromFormat('Y-m', $currentMonth)->format('F Y'),
            'totalAmount' => $totalAmount,
            'totalPayments' => $totalPayments,
            'averageAmount' => round($averageAmount, 2),
            'uniqueMembers' => $uniqueMembers,
        ];
    }

    /**
     * Get global contribution statistics
     */
    private function getGlobalContribution(): array
    {
        // Total validated payments
        $validatedPayments = Payment::where('status', 'validated')->get();
        $totalValidatedAmount = $validatedPayments->sum('amount');
        $totalValidatedCount = $validatedPayments->count();

        // All payments (including pending and rejected)
        $allPayments = Payment::all();
        $totalAllAmount = $allPayments->sum('amount');
        $totalAllCount = $allPayments->count();

        // Payment status breakdown
        $statusBreakdown = Payment::selectRaw('status, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('status')
            ->get()
            ->keyBy('status')
            ->map(function ($item) {
                return [
                    'count' => $item->count,
                    'amount' => $item->total,
                ];
            });

        // Ensure all statuses are present
        $allStatuses = ['validated', 'pending', 'rejected'];
        foreach ($allStatuses as $status) {
            if (!$statusBreakdown->has($status)) {
                $statusBreakdown[$status] = ['count' => 0, 'amount' => 0];
            }
        }

        // Top contributing members
        $topContributors = User::where('id', '!=', 1)
            ->withSum(['payments as total_contribution' => function ($query) {
                $query->where('status', 'validated');
            }], 'amount')
            ->withCount(['payments as total_payments' => function ($query) {
                $query->where('status', 'validated');
            }])
            ->orderByDesc('total_contribution')
            ->limit(10)
            ->get(['id', 'full_name', 'member_number'])
            ->map(function ($user) {
                return [
                    'user_id' => $user->id,
                    'user_name' => $user->full_name,
                    'member_number' => $user->member_number,
                    'total_amount' => $user->total_contribution ?? 0,
                    'payment_count' => $user->total_payments ?? 0,
                ];
            });

        return [
            'totalValidatedAmount' => $totalValidatedAmount,
            'totalValidatedCount' => $totalValidatedCount,
            'statusBreakdown' => $statusBreakdown->toArray(),
            'topContributors' => $topContributors->toArray(),
        ];
    }

    /**
     * Get yearly contribution chart data
     */
    private function getYearlyContributionChart(Carbon $startDate, Carbon $endDate): array
    {
        $chartData = [];
        $current = $startDate->copy()->startOfMonth();

        while ($current->lte($endDate)) {
            $monthKey = $current->format('Y-m');
            
            $monthlyData = Payment::whereRaw('strftime("%Y-%m", payment_date) = ?', [$monthKey])
                ->where('status', 'validated')
                ->selectRaw('COUNT(*) as count, SUM(amount) as total')
                ->first();

            $chartData[] = [
                'month' => $current->format('M Y'),
                'amount' => $monthlyData->total ?? 0,
                'count' => $monthlyData->count ?? 0,
            ];

            $current->addMonth();
        }

        // Calculate trends
        $totalAmount = collect($chartData)->sum('amount');
        $totalCount = collect($chartData)->sum('count');
        $averageMonthly = count($chartData) > 0 ? $totalAmount / count($chartData) : 0;

        return [
            'data' => $chartData,
            'summary' => [
                'totalAmount' => $totalAmount,
                'totalPayments' => $totalCount,
                'averageMonthly' => round($averageMonthly, 2),
                'periodMonths' => count($chartData),
            ],
        ];
    }

    /**
     * Get additional summary statistics
     */
    private function getSummaryStatistics(): array
    {
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();

        return [
            'todayPayments' => Payment::whereDate('payment_date', $today)->where('status', 'validated')->count(),
            'todayAmount' => Payment::whereDate('payment_date', $today)->where('status', 'validated')->sum('amount'),
            
            'thisWeekPayments' => Payment::where('payment_date', '>=', $thisWeek)->where('status', 'validated')->count(),
            'thisWeekAmount' => Payment::where('payment_date', '>=', $thisWeek)->where('status', 'validated')->sum('amount'),
            
            'pendingPayments' => Payment::where('status', 'pending')->count(),
            'pendingAmount' => Payment::where('status', 'pending')->sum('amount'),
            
            'rejectedPayments' => Payment::where('status', 'rejected')->count(),
            'rejectedAmount' => Payment::where('status', 'rejected')->sum('amount'),
        ];
    }

    /**
     * Get current year chart data (January to current month)
     */
    private function getCurrentYearChart(): array
    {
        $currentYear = Carbon::now()->year;
        $currentMonth = Carbon::now()->month;
        $chartData = [];
        
        // Generate data for each month from January to current month
        for ($month = 1; $month <= $currentMonth; $month++) {
            $monthKey = sprintf('%d-%02d', $currentYear, $month);
            $monthName = Carbon::createFromDate($currentYear, $month, 1)->format('M');
            
            $monthlyData = Payment::whereRaw('strftime("%Y-%m", payment_date) = ?', [$monthKey])
                ->where('status', 'validated')
                ->selectRaw('COUNT(*) as count, SUM(amount) as total')
                ->first();

            $chartData[] = [
                'month' => $monthName,
                'monthFull' => Carbon::createFromDate($currentYear, $month, 1)->format('F Y'),
                'totalPayments' => $monthlyData->count ?? 0,
                'totalAmount' => $monthlyData->total ?? 0,
            ];
        }

        // Calculate summary statistics
        $totalPayments = collect($chartData)->sum('totalPayments');
        $totalAmount = collect($chartData)->sum('totalAmount');
        $averageMonthlyPayments = count($chartData) > 0 ? $totalPayments / count($chartData) : 0;
        $averageMonthlyAmount = count($chartData) > 0 ? $totalAmount / count($chartData) : 0;

        return [
            'data' => $chartData,
            'summary' => [
                'totalPayments' => $totalPayments,
                'totalAmount' => $totalAmount,
                'averageMonthlyPayments' => round($averageMonthlyPayments, 1),
                'averageMonthlyAmount' => round($averageMonthlyAmount, 2),
                'monthsCovered' => count($chartData),
                'currentYear' => $currentYear,
            ],
        ];
    }

    /**
     * Get recent payments (last 10)
     */
    private function getRecentPayments(): array
    {
        return Payment::with('user:id,full_name,member_number')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'user_name' => $payment->user->full_name ?? 'Unknown User',
                    'member_number' => $payment->user->member_number ?? '-',
                    'amount' => $payment->amount,
                    'payment_date' => $payment->payment_date,
                    'status' => $payment->status,
                    'created_at' => $payment->created_at->format('Y-m-d H:i:s'),
                ];
            })
            ->toArray();
    }
}
