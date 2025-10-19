import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Archive,
    ChevronDown,
    Download,
    RefreshCw,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface Log {
    id: string;
    datetime: string;
    environment: string;
    level: 'DEBUG' | 'INFO' | 'NOTICE' | 'WARNING' | 'ERROR' | 'CRITICAL';
    message: string;
    context?: Record<string, unknown>;
}

interface Archive {
    name: string;
    filename: string;
    size: number;
    size_human: string;
    created_at: string;
    path: string;
}

interface Pagination {
    data: Log[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    has_more_pages: boolean;
}

interface Statistics {
    active_count: number;
    archived_count: number;
    archived_size: string;
    level_distribution: Record<string, number>;
}

export default function SecurityLogsIndex() {
    const { logs, archives, statistics } = usePage().props as unknown as {
        logs: Pagination;
        archives: Archive[];
        statistics: Statistics;
    };
    const [search, setSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState<string>('');
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const [isArchiving, setIsArchiving] = useState(false);
    const debounced = useDebounce(search, 250);

    const paginationData = logs as Pagination;
    const archivedData = archives as Archive[];
    const stats = statistics as Statistics;

    const filtered = useMemo(() => {
        return paginationData.data.filter((log: Log) => {
            const matchSearch =
                debounced === '' ||
                log.message.toLowerCase().includes(debounced.toLowerCase()) ||
                log.environment.toLowerCase().includes(debounced.toLowerCase());

            const matchLevel = levelFilter === '' || log.level === levelFilter;

            return matchSearch && matchLevel;
        });
    }, [paginationData.data, debounced, levelFilter]);

    const handleArchiveNow = async () => {
        setIsArchiving(true);
        try {
            const response = await fetch('/admin/security-logs/archive-now', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                await response.json();
                window.location.reload();
            }
        } catch (error) {
            console.error('Error archiving logs:', error);
        } finally {
            setIsArchiving(false);
        }
    };

    const getLevelBadgeVariant = (level: string) => {
        switch (level) {
            case 'CRITICAL':
            case 'ERROR':
                return 'destructive';
            case 'WARNING':
                return 'secondary';
            case 'INFO':
            case 'NOTICE':
                return 'default';
            case 'DEBUG':
                return 'outline';
            default:
                return 'default';
        }
    };

    const breadcrumbs = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Security Logs', href: '/admin/security-logs' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Security Logs" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Security Logs</h1>
                        <p className="mt-1 text-gray-500">
                            Real-time security events and access logs (current
                            month only)
                        </p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Logs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.active_count}
                            </div>
                            <p className="text-xs text-gray-500">This month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Archived Months
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.archived_count}
                            </div>
                            <p className="text-xs text-gray-500">
                                ZIP archives
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Archive Size
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.archived_size}
                            </div>
                            <p className="text-xs text-gray-500">
                                Total compressed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1 text-sm">
                                {Object.entries(stats.level_distribution)
                                    .slice(0, 2)
                                    .map(([level, count]: [string, number]) => (
                                        <div
                                            key={level}
                                            className="flex justify-between"
                                        >
                                            <span className="text-xs">
                                                {level}
                                            </span>
                                            <span className="text-xs font-semibold">
                                                {count}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-end gap-4 md:flex-row">
                    <div className="flex-1">
                        <label className="mb-2 block text-sm font-medium">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Level
                        </label>
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            className="rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="">All Levels</option>
                            <option value="DEBUG">DEBUG</option>
                            <option value="INFO">INFO</option>
                            <option value="NOTICE">NOTICE</option>
                            <option value="WARNING">WARNING</option>
                            <option value="ERROR">ERROR</option>
                            <option value="CRITICAL">CRITICAL</option>
                        </select>
                    </div>

                    <Button
                        onClick={handleArchiveNow}
                        disabled={isArchiving}
                        className="gap-2"
                    >
                        <Archive className="h-4 w-4" />
                        {isArchiving ? 'Archiving...' : 'Archive Now'}
                    </Button>
                </div>

                {/* Table View - Current Month Logs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current Month Logs</CardTitle>
                        <CardDescription>
                            {filtered.length} of {paginationData.total} logs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filtered.length === 0 ? (
                            <div className="py-12 text-center">
                                <AlertCircle className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                                <p className="text-gray-500">No logs found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold">
                                                Datetime
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold">
                                                Level
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold">
                                                Environment
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold">
                                                Message
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold">
                                                Context
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((log: Log) => (
                                            <React.Fragment key={log.id}>
                                                <tr className="border-b transition-colors hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-gray-600">
                                                        {log.datetime}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant={getLevelBadgeVariant(
                                                                log.level,
                                                            )}
                                                        >
                                                            {log.level}
                                                        </Badge>
                                                    </td>
                                                    <td className="w-fit rounded bg-gray-100 px-2 px-4 py-1 py-3 text-xs">
                                                        {log.environment}
                                                    </td>
                                                    <td className="max-w-2xl truncate px-4 py-3 text-gray-700">
                                                        {log.message}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {log.context &&
                                                            Object.keys(
                                                                log.context,
                                                            ).length > 0 && (
                                                                <button
                                                                    onClick={() =>
                                                                        setExpandedLog(
                                                                            expandedLog ===
                                                                                log.id
                                                                                ? null
                                                                                : log.id,
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center justify-center rounded p-1 transition-colors hover:bg-gray-200"
                                                                    title="View JSON context"
                                                                >
                                                                    <ChevronDown
                                                                        className={`h-4 w-4 text-gray-600 transition-transform ${
                                                                            expandedLog ===
                                                                            log.id
                                                                                ? 'rotate-180'
                                                                                : ''
                                                                        }`}
                                                                    />
                                                                </button>
                                                            )}
                                                    </td>
                                                </tr>
                                                {expandedLog === log.id &&
                                                    log.context &&
                                                    Object.keys(log.context)
                                                        .length > 0 && (
                                                        <tr className="border-b bg-gray-50">
                                                            <td
                                                                colSpan={5}
                                                                className="px-4 py-4"
                                                            >
                                                                <div className="max-h-48 overflow-auto rounded bg-gray-900 p-3 text-gray-100">
                                                                    <pre className="font-mono text-xs">
                                                                        {JSON.stringify(
                                                                            log.context,
                                                                            null,
                                                                            2,
                                                                        )}
                                                                    </pre>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Archived Logs Table */}
                {archivedData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Archived Logs</CardTitle>
                            <CardDescription>
                                Download or view previous months' security logs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold">
                                                Archive Name
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold">
                                                Size
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold">
                                                Created
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {archivedData.map(
                                            (archive: Archive) => (
                                                <tr
                                                    key={archive.filename}
                                                    className="border-b transition-colors hover:bg-gray-50"
                                                >
                                                    <td className="px-4 py-3 font-medium">
                                                        {archive.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">
                                                        {archive.size_human}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-gray-600">
                                                        {archive.created_at}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                asChild
                                                                className="text-xs"
                                                            >
                                                                <Link
                                                                    href={`/admin/security-logs/archive/${archive.filename}`}
                                                                >
                                                                    <RefreshCw className="h-3 w-3" />
                                                                    View
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                asChild
                                                                className="text-xs"
                                                            >
                                                                <a
                                                                    href={`/admin/security-logs/download/${archive.filename}`}
                                                                >
                                                                    <Download className="h-3 w-3" />
                                                                    Download
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
