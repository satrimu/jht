<?php

namespace App\Repositories\Contracts;

interface ReportRepositoryInterface
{
    /**
     * Get general statistics for reports
     */
    public function getGeneralStats(int $year, ?int $month = null): array;

    /**
     * Get monthly breakdown for a year
     */
    public function getMonthlyBreakdown(int $year): array;

    /**
     * Get individual user report
     */
    public function getUserReport(int $userId, int $year): array;

    /**
     * Get data for export
     */
    public function getExportData(int $year, ?int $month = null, string $type = 'yearly'): array;
}
