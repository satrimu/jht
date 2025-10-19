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
import { AlertCircle, ArrowLeft, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Log {
    id: string;
    datetime: string;
    environment: string;
    level: 'DEBUG' | 'INFO' | 'NOTICE' | 'WARNING' | 'ERROR' | 'CRITICAL';
    message: string;
    context?: Record<string, unknown>;
}

interface Pagination {
    data: Log[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    has_more_pages: boolean;
    archive_name: string;
}

export default function SecurityLogsArchive() {
    const { logs, archive_name } = usePage().props as unknown as {
        logs: Pagination;
        archive_name: string;
    };
    const [search, setSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState<string>('');
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const debounced = useDebounce(search, 250);

    const paginationData = logs as Pagination;

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

    const getLevelBadgeVariant = (level: string) => {
        switch (level) {
            case 'CRITICAL':
            case 'ERROR':
                return 'destructive';
            case 'WARNING':
                return 'destructive';
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
        { title: `Archive: ${archive_name}`, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Security Logs Archive - ${archive_name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/security-logs">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">
                                Archive: {archive_name}
                            </h1>
                            <p className="mt-1 text-gray-500">
                                Historical security logs from this period
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Logs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {paginationData.total}
                            </div>
                            <p className="text-xs text-gray-500">
                                In this archive
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Showing
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {filtered.length} of {paginationData.total}
                            </div>
                            <p className="text-xs text-gray-500">
                                Matching filters
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Page
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {paginationData.current_page} /{' '}
                                {paginationData.last_page}
                            </div>
                            <p className="text-xs text-gray-500">
                                Of {paginationData.last_page} pages
                            </p>
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
                </div>

                {/* Logs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Archived Logs</CardTitle>
                        <CardDescription>
                            {filtered.length} of {paginationData.total} logs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filtered.length === 0 ? (
                            <div className="py-8 text-center">
                                <AlertCircle className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                                <p className="text-gray-500">No logs found</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filtered.map((log: Log) => (
                                    <div
                                        key={log.id}
                                        className="cursor-pointer rounded-lg border p-3 hover:bg-gray-50"
                                    >
                                        <div
                                            onClick={() =>
                                                setExpandedLog(
                                                    expandedLog === log.id
                                                        ? null
                                                        : log.id,
                                                )
                                            }
                                            className="flex items-start justify-between gap-3"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                                    <span className="font-mono text-xs text-gray-500">
                                                        {log.datetime}
                                                    </span>
                                                    <Badge
                                                        variant={getLevelBadgeVariant(
                                                            log.level,
                                                        )}
                                                    >
                                                        {log.level}
                                                    </Badge>
                                                    <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                                                        {log.environment}
                                                    </span>
                                                </div>
                                                <p className="truncate text-sm">
                                                    {log.message}
                                                </p>
                                            </div>
                                            <ChevronDown
                                                className={`mt-1 h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${
                                                    expandedLog === log.id
                                                        ? 'rotate-180'
                                                        : ''
                                                }`}
                                            />
                                        </div>

                                        {expandedLog === log.id &&
                                            log.context &&
                                            Object.keys(log.context).length >
                                                0 && (
                                                <div className="mt-3 rounded border-t bg-gray-50 p-2 pt-3">
                                                    <pre className="max-h-40 overflow-auto text-xs">
                                                        {JSON.stringify(
                                                            log.context,
                                                            null,
                                                            2,
                                                        )}
                                                    </pre>
                                                </div>
                                            )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {paginationData.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from(
                            { length: paginationData.last_page },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <Link
                                key={page}
                                href={`?page=${page}`}
                                className={`rounded border px-3 py-1 ${
                                    page === paginationData.current_page
                                        ? 'border-blue-500 bg-blue-500 text-white'
                                        : 'hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
