<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use App\Repositories\Contracts\ReportRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportRepositoryInterface $reportRepo
    ) {}

    /**
     * Display general reports page
     */
    public function index(Request $request)
    {
        $year = $request->get('year', now()->year);
        $month = $request->get('month');

        // Get available years from payments
        $availableYears = Payment::selectRaw('DISTINCT strftime("%Y", payment_date) as year')
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();

        // If no years available, use current year
        if (empty($availableYears)) {
            $availableYears = [now()->year];
        }

        // Get general statistics
        $generalStats = $this->reportRepo->getGeneralStats($year, $month);

        // Get members list (exclude admin id 1)
        $members = User::where('id', '!=', 1)
            ->select(['id', 'full_name', 'email'])
            ->orderBy('full_name')
            ->get();

        return Inertia::render('admin/reports/Index', [
            'generalStats' => $generalStats,
            'members' => $members,
            'availableYears' => $availableYears,
            'selectedYear' => (int) $year,
            'selectedMonth' => $month ? (int) $month : null,
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => route('admin.dashboard')],
                ['title' => 'Reports', 'href' => route('admin.reports.index')],
            ],
        ]);
    }

    /**
     * Display individual user report
     */
    public function show(User $user, Request $request)
    {
        // Ensure user is not admin (id 1)
        if ($user->id === 1) {
            abort(404);
        }

        $year = $request->get('year', now()->year);

        // Get available years for this user
        $availableYears = Payment::where('user_id', $user->id)
            ->selectRaw('DISTINCT strftime("%Y", payment_date) as year')
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();

        if (empty($availableYears)) {
            $availableYears = [now()->year];
        }

        // Get user report data
        $userReport = $this->reportRepo->getUserReport($user->id, $year);

        return Inertia::render('admin/reports/Show', [
            'user' => $user,
            'userReport' => $userReport,
            'availableYears' => $availableYears,
            'selectedYear' => (int) $year,
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => route('admin.dashboard')],
                ['title' => 'Reports', 'href' => route('admin.reports.index')],
                ['title' => $user->full_name, 'href' => route('admin.reports.show', $user)],
            ],
        ]);
    }

    /**
     * Export user report to PDF
     */
    public function exportUserPdf(User $user, Request $request)
    {
        // Ensure user is not admin (id 1)
        if ($user->id === 1) {
            abort(404);
        }

        $year = $request->get('year', now()->year);

        // Get user report data
        $userReport = $this->reportRepo->getUserReport($user->id, $year);

        // Generate PDF (we'll implement this later)
        // For now, return JSON response
        return response()->json([
            'message' => 'PDF export untuk '.$user->full_name.' tahun '.$year,
            'data' => $userReport,
        ]);
    }

    /**
     * Export general report to Excel/CSV
     */
    public function exportGeneral(Request $request)
    {
        $year = $request->get('year', now()->year);
        $month = $request->get('month');
        $type = $request->get('type', 'yearly'); // yearly or monthly

        if ($type === 'monthly' && ! $month) {
            return response()->json(['error' => 'Month is required for monthly export'], 400);
        }

        // Get export data
        $exportData = $this->reportRepo->getExportData($year, $month, $type);

        // Generate Excel/CSV (we'll implement this later)
        // For now, return JSON response
        return response()->json([
            'message' => 'Export '.$type.' untuk tahun '.$year.($month ? ' bulan '.$month : ''),
            'data' => $exportData,
        ]);
    }
}
