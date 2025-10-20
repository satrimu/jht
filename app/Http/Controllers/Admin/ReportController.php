<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use App\Repositories\Contracts\ReportRepositoryInterface;
use App\Services\PdfService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportRepositoryInterface $reportRepo,
        private readonly PdfService $pdfService
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

        // Get members list with total amount for selected period (exclude admin id 1)
        /** @var Collection<int, User> $members */
        $members = User::where('id', '!=', 1)
            ->select(['id', 'full_name', 'email'])
            ->with([
                'payments' => function ($query) use ($year, $month) {
                    $query->whereYear('payment_date', $year)
                        ->when($month, fn ($q) => $q->whereMonth('payment_date', $month))
                        ->where('status', 'terbayar');
                }
            ])
            ->orderBy('full_name')
            ->get()
            ->map(function (User $member) {
                $member->setAttribute('total_amount', (int) $member->payments->sum('amount'));
                return $member;
            });

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
    public function exportUserPdf(User $user, Request $request): Response
    {
        // Ensure user is not admin (id 1)
        if ($user->id === 1) {
            abort(404);
        }

        $year = (int) $request->get('year', now()->year);

        // Generate and download PDF
        return $this->pdfService->generateUserReportPdf($user, $year);
    }

    /**
     * Export general report to PDF
     */
    public function exportGeneral(Request $request): Response
    {
        $year = (int) $request->get('year', now()->year);
        $month = $request->has('month') ? (int) $request->get('month') : null;

        // Generate and download PDF
        return $this->pdfService->generateGeneralReportPdf($year, $month);
    }
}
