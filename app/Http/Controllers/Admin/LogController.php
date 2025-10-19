<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SecurityLogService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class LogController extends Controller
{
    public function __construct(protected SecurityLogService $logService) {}

    /**
     * Display activity logs from database
     */
    public function audit(Request $request)
    {
        $activities = Activity::with('causer')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('admin/auditlogs/Index', [
            'logs' => $activities,
        ]);
    }

    /**
     * Display active security logs (current month only)
     */
    public function security(Request $request)
    {
        $page = $request->integer('page', 1);

        // Get active logs with pagination
        $paginatedLogs = $this->logService->getActiveLogsPaginated(perPage: 25, page: $page);

        // Get archived logs for download
        $archivedLogs = $this->logService->getArchivedLogs();

        // Get statistics
        $statistics = $this->logService->getStatistics();

        return Inertia::render('admin/security-logs/Index', [
            'logs' => $paginatedLogs,
            'archives' => $archivedLogs,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Display archived security logs by month
     */
    public function archiveShow(Request $request, string $archiveFilename)
    {
        // Validate filename to prevent path traversal
        if (in_array(preg_match('/^security-logs-\d{4}-\d{2}\.(zip|gz)$/', $archiveFilename), [0, false], true)) {
            abort(404);
        }

        $page = $request->integer('page', 1);

        $archivedContent = $this->logService->getArchivedLogContent(
            archiveFilename: $archiveFilename,
            perPage: 25,
            page: $page
        );

        if (isset($archivedContent['error'])) {
            abort(404, $archivedContent['error']);
        }

        return Inertia::render('admin/security-logs/Archive', [
            'logs' => $archivedContent,
            'archive_name' => $archiveFilename,
        ]);
    }

    /**
     * Download archived security logs
     */
    public function downloadArchive(string $archiveFilename)
    {
        // Validate filename to prevent path traversal
        if (in_array(preg_match('/^security-logs-\d{4}-\d{2}\.(zip|gz)$/', $archiveFilename), [0, false], true)) {
            abort(404);
        }

        $archivePath = storage_path("logs/security/archived/{$archiveFilename}");

        if (! File::exists($archivePath)) {
            abort(404, 'Archive not found');
        }

        return response()->download($archivePath, $archiveFilename, [
            'Content-Type' => 'application/zip',
            'Content-Disposition' => 'attachment; filename="'.$archiveFilename.'"',
        ]);
    }

    /**
     * Manually trigger log archival (can also be run via scheduler)
     */
    public function archiveNow(Request $request)
    {
        // Check if user is super admin
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        try {
            $result = $this->logService->archiveOldLogs();

            return response()->json([
                'success' => true,
                'message' => 'Logs archived successfully',
                'archived' => count($result['archived']),
                'errors' => $result['errors'],
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error archiving logs: '.$e->getMessage(),
            ], 500);
        }
    }
}
