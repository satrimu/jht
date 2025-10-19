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
import { Button } from '@/components/ui/button';
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
import { Eye } from 'lucide-react';

// Decode HTML entities safely
function decodeHtmlEntities(text: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}
interface ActivityProperties {
    [key: string]: unknown;
}

interface Activity {
    id: number;
    description: string;
    created_at: string;
    causer: { name: string } | null;
    properties: ActivityProperties;
    subject_type: string | null;
}

interface Props {
    logs: {
        data: Activity[];
        current_page: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Audit Log',
        href: '/admin/audit-logs',
    },
];

function LogProperties({ properties }: { properties: ActivityProperties }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-h-[80vh] max-w-2xl overflow-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>Log Item</AlertDialogTitle>
                    <AlertDialogDescription></AlertDialogDescription>
                </AlertDialogHeader>
                <div className="mt-4 overflow-auto rounded bg-muted p-4 text-xs">
                    <pre>{JSON.stringify(properties, null, 2)}</pre>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function AuditLogIndex({ logs }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Log" />
            <div className="flex-1 p-4 md:p-6">
                <div className="overflow-x-auto rounded-md border bg-background">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Subject Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">
                                    Properties
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No activity logs.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.data.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <div className="text-muted-foreground">
                                                {log.causer?.name ?? 'System'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-muted-foreground">
                                                {log.subject_type
                                                    ? log.subject_type
                                                          .split('\\')
                                                          .pop()
                                                    : 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">
                                                {log.description}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-muted-foreground">
                                                {new Date(
                                                    log.created_at,
                                                ).toLocaleString('en-GB', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                    hour12: false,
                                                })}
                                            </div>{' '}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {log.properties &&
                                            Object.keys(log.properties).length >
                                                0 ? (
                                                <LogProperties
                                                    properties={log.properties}
                                                />
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    No properties
                                                </span>
                                            )}
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
