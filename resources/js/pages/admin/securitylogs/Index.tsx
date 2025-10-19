import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Eye, Filter } from 'lucide-react';

// Decode HTML entities safely
function decodeHtmlEntities(text: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

interface SecurityLogContext {
    [key: string]: unknown;
    email?: string;
    user_id?: number;
    ip?: string;
    timestamp?: string;
    user_agent?: string;
}

interface SecurityLog {
    datetime: string;
    level: string;
    environment: string;
    message: string;
    context: SecurityLogContext;
}

interface Props {
    logs: {
        data: SecurityLog[];
        current_page: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters?: {
        years: string[];
        months: { value: string; label: string }[];
        selected_year?: string;
        selected_month?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Security Logs',
        href: '/admin/security-logs',
    },
];

// Helper function to get badge variant based on log level
function getBadgeVariant(
    level: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    const levelLower = level.toLowerCase();
    if (levelLower.includes('warning') || levelLower.includes('alert')) {
        return 'destructive';
    }
    if (levelLower.includes('error') || levelLower.includes('critical')) {
        return 'destructive';
    }
    if (levelLower.includes('info')) {
        return 'secondary';
    }
    return 'outline';
}

// Component to display log details in a modal
function SecurityLogDetails({ logData }: { logData: SecurityLog }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-h-[80vh] max-w-2xl overflow-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        <div className="flex items-center gap-2">
                            <span>{logData.message}</span>
                            <Badge variant={getBadgeVariant(logData.level)}>
                                {logData.level}
                            </Badge>
                        </div>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-muted-foreground">
                        {logData.datetime} - Environment: {logData.environment}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="mt-4">
                    <h3 className="mb-2 text-sm font-medium">
                        Context Details
                    </h3>
                    <div className="space-y-2">
                        {logData.context.email && (
                            <div className="grid grid-cols-3">
                                <span className="text-xs font-medium">
                                    Email:
                                </span>
                                <span className="col-span-2 text-xs">
                                    {logData.context.email}
                                </span>
                            </div>
                        )}
                        {logData.context.user_id && (
                            <div className="grid grid-cols-3">
                                <span className="text-xs font-medium">
                                    User ID:
                                </span>
                                <span className="col-span-2 text-xs">
                                    {logData.context.user_id}
                                </span>
                            </div>
                        )}
                        {logData.context.ip && (
                            <div className="grid grid-cols-3">
                                <span className="text-xs font-medium">
                                    IP Address:
                                </span>
                                <span className="col-span-2 text-xs">
                                    {logData.context.ip}
                                </span>
                            </div>
                        )}
                        {logData.context.timestamp && (
                            <div className="grid grid-cols-3">
                                <span className="text-xs font-medium">
                                    Timestamp:
                                </span>
                                <span className="col-span-2 text-xs">
                                    {logData.context.timestamp}
                                </span>
                            </div>
                        )}
                        {logData.context.user_agent && (
                            <div className="grid grid-cols-3">
                                <span className="text-xs font-medium">
                                    User Agent:
                                </span>
                                <span className="col-span-2 text-xs break-words">
                                    {logData.context.user_agent}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-4 overflow-auto rounded bg-muted p-4 text-xs">
                    <pre>{JSON.stringify(logData.context, null, 2)}</pre>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function SecurityLogsIndex({ logs, filters }: Props) {
    // Handle filter changes
    const handleYearChange = (year: string | undefined) => {
        if (!year) return;
        router.visit(
            `/admin/security-logs?year=${year}${filters?.selected_month ? `&month=${filters.selected_month}` : ''}`,
        );
    };

    const handleMonthChange = (month: string | undefined) => {
        if (!month) return;
        router.visit(
            `/admin/security-logs?month=${month}${filters?.selected_year ? `&year=${filters.selected_year}` : ''}`,
        );
    };

    const clearFilters = () => {
        router.visit('/admin/security-logs');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Security Logs" />
            <div className="flex-1 p-4 md:p-6">
                {/* Filters */}
                {filters && (
                    <Card className="mb-6">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center text-base font-medium">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter Security Logs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                <div className="w-full sm:w-auto">
                                    <Select
                                        value={
                                            filters.selected_year || undefined
                                        }
                                        onValueChange={handleYearChange}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(filters.years || []).map(
                                                (year) => (
                                                    <SelectItem
                                                        key={year}
                                                        value={year}
                                                    >
                                                        {year}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-full sm:w-auto">
                                    <Select
                                        value={
                                            filters.selected_month || undefined
                                        }
                                        onValueChange={handleMonthChange}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select Month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(filters.months || []).map(
                                                (month) => (
                                                    <SelectItem
                                                        key={month.value}
                                                        value={month.value}
                                                    >
                                                        {month.label}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {(filters.selected_year ||
                                    filters.selected_month) && (
                                    <Button
                                        variant="outline"
                                        onClick={clearFilters}
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="overflow-x-auto rounded-md border bg-background">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Env</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>User/Email</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead className="text-right">
                                    Details
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No security logs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.data.map((log, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="text-xs text-muted-foreground">
                                                {log.datetime}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-mono text-xs">
                                                {log.environment}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={getBadgeVariant(
                                                    log.level,
                                                )}
                                            >
                                                {log.level}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">
                                                {log.message}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {log.context.user_id &&
                                            log.context.email ? (
                                                <div className="flex flex-col">
                                                    <div className="text-sm">
                                                        User ID:{' '}
                                                        {log.context.user_id}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {log.context.email}
                                                    </div>
                                                </div>
                                            ) : log.context.user_id ? (
                                                <div className="text-sm">
                                                    User ID:{' '}
                                                    {log.context.user_id}
                                                </div>
                                            ) : log.context.email ? (
                                                <div className="text-sm">
                                                    {log.context.email}
                                                </div>
                                            ) : (
                                                <div className="text-muted-foreground">
                                                    -
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {log.context.ip ? (
                                                <div className="font-mono text-xs">
                                                    {log.context.ip}
                                                </div>
                                            ) : (
                                                <div className="text-muted-foreground">
                                                    -
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <SecurityLogDetails logData={log} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Pagination */}
                {logs.links.length > 1 && (
                    <div className="flex flex-wrap justify-center gap-2 pt-6">
                        {logs.links.map((link, i) => (
                            <Button
                                key={i}
                                disabled={!link.url}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                onClick={() =>
                                    router.visit(link.url || '', {
                                        preserveScroll: true,
                                    })
                                }
                            >
                                {decodeHtmlEntities(link.label)}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
