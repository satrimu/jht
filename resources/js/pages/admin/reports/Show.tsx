import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    Download,
    FileText,
    TrendingUp,
    DollarSign,
    CheckCircle,
    Clock,
    ArrowLeft
} from 'lucide-react';

interface ReportShowProps {
    user: {
        id: number;
        full_name: string;
        email: string;
        created_at: string;
    };
    userReport: {
        user: {
            id: number;
            full_name: string;
            email: string;
        };
        payments: Array<{
            id: number;
            amount: number;
            payment_date: string;
            status: string;
            notes: string | null;
            created_at: string;
        }>;
        monthly_breakdown: Array<{
            month: number;
            month_name: string;
            payment_count: number;
            total_amount: number;
            terbayar_count: number;
            terbayar_amount: number;
        }>;
        status_summary: {
            total: number;
            terbayar: number;
            pending: number;
        };
        amount_summary: {
            total: number;
            terbayar: number;
            pending: number;
        };
        year: number;
    };
    availableYears: number[];
    selectedYear: number;
    breadcrumbs: Array<{
        title: string;
        href: string;
    }>;
}

export default function Show({
    user,
    userReport,
    availableYears,
    selectedYear,
    breadcrumbs
}: ReportShowProps) {
    const [year, setYear] = useState(selectedYear);

    const handleYearChange = (newYear: string) => {
        setYear(parseInt(newYear));
        router.get(`/admin/reports/${user.id}`, { year: newYear }, { preserveState: true });
    };

    const handleExportPdf = () => {
        window.open(`/admin/reports/${user.id}/export-pdf?year=${year}`, '_blank');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'terbayar':
                return <Badge className="bg-green-100 text-green-800">Terbayar</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Menunggu</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    // Chart data for monthly breakdown
    const chartData = userReport.monthly_breakdown.map(item => ({
        month: item.month_name.substring(0, 3),
        total: item.total_amount,
        terbayar: item.terbayar_amount,
        count: item.payment_count
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Laporan ${user.full_name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.visit('/admin/reports')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Laporan {user.full_name}
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                {user.email} • Anggota sejak {format(new Date(user.created_at), 'dd MMMM yyyy', { locale: id })}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Select value={year.toString()} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {availableYears.map(yearOption => (
                                    <SelectItem key={yearOption} value={yearOption.toString()}>
                                        {yearOption}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button onClick={handleExportPdf} variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export PDF
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pembayaran</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userReport.status_summary.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {userReport.status_summary.terbayar} terbayar
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Nominal</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(userReport.amount_summary.total)}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(userReport.amount_summary.terbayar)} terbayar
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rata-rata</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {userReport.status_summary.total > 0
                                    ? formatCurrency(userReport.amount_summary.total / userReport.status_summary.total)
                                    : formatCurrency(0)
                                }
                            </div>
                            <p className="text-xs text-muted-foreground">
                                per pembayaran
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tahun</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{year}</div>
                            <p className="text-xs text-muted-foreground">
                                Periode laporan
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan Status Pembayaran {year}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                                <div>
                                    <p className="text-2xl font-bold text-green-600">{userReport.status_summary.terbayar}</p>
                                    <p className="text-sm text-muted-foreground">Terbayar</p>
                                    <p className="text-sm font-medium">{formatCurrency(userReport.amount_summary.terbayar)}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Clock className="h-8 w-8 text-yellow-500" />
                                <div>
                                    <p className="text-2xl font-bold text-yellow-600">{userReport.status_summary.pending}</p>
                                    <p className="text-sm text-muted-foreground">Menunggu</p>
                                    <p className="text-sm font-medium">{formatCurrency(userReport.amount_summary.pending)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan Bulanan {year}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, name) => [
                                        name === 'total' ? formatCurrency(value as number) : value,
                                        name === 'total' ? 'Total' : name === 'terbayar' ? 'Terbayar' : 'Jumlah'
                                    ]}
                                />
                                <Bar dataKey="terbayar" fill="#10b981" name="terbayar" />
                                <Bar dataKey="total" fill="#3b82f6" name="total" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Payments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detail Pembayaran {year}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Semua pembayaran {user.full_name} dalam tahun {year}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Nominal</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Catatan</TableHead>
                                    <TableHead>Dibuat</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userReport.payments.map(payment => (
                                    <TableRow key={payment.id}>
                                        <TableCell>
                                            {format(new Date(payment.payment_date), 'dd/MM/yyyy', { locale: id })}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {formatCurrency(payment.amount)}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(payment.status)}
                                        </TableCell>
                                        <TableCell>
                                            {payment.notes || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', { locale: id })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {userReport.payments.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            Tidak ada pembayaran dalam tahun {year}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}