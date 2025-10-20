import React, { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    FileText,
    Users,
    CheckCircle,
    Clock,
    User,
    Search,
} from 'lucide-react';

interface ReportIndexProps {
    generalStats: {
        total_members: number;
        active_members: number;
        total_payments: number;
        pending_payments: number;
        terbayar_payments: number;
        total_amount: number;
        terbayar_amount: number;
        average_amount: number;
        period: string;
    };
    members: Array<{
        id: number;
        full_name: string;
        email: string;
        total_amount?: number;
    }>;
    availableYears: number[];
    selectedYear: number;
    selectedMonth: number | null;
    breadcrumbs: Array<{
        title: string;
        href: string;
    }>;
}

export default function Index({
    generalStats,
    members,
    availableYears,
    selectedYear,
    selectedMonth,
    breadcrumbs
}: ReportIndexProps) {
    const [year, setYear] = useState(selectedYear);
    const [month, setMonth] = useState<number | null>(selectedMonth);
    const [searchMembers, setSearchMembers] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const membersPerPage = 10;

    const handleYearChange = (newYear: string) => {
        setYear(parseInt(newYear));
        setMonth(null);
        router.get('/admin/reports', { year: newYear }, { preserveState: true });
    };

    const handleMonthChange = (newMonth: string) => {
        const monthValue = newMonth === 'all' ? null : parseInt(newMonth);
        setMonth(monthValue);
        router.get('/admin/reports', { year, month: monthValue }, { preserveState: true });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Filtered members based on search
    const filteredMembers = useMemo(() => {
        const searchLower = searchMembers.toLowerCase();
        return members.filter(member =>
            member.full_name.toLowerCase().includes(searchLower) ||
            member.email.toLowerCase().includes(searchLower)
        );
    }, [members, searchMembers]);

    // Paginated members
    const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
    const paginatedMembers = useMemo(() => {
        const startIndex = (currentPage - 1) * membersPerPage;
        const endIndex = startIndex + membersPerPage;
        return filteredMembers.slice(startIndex, endIndex);
    }, [filteredMembers, currentPage, membersPerPage]);

    // Reset to page 1 when search changes
    const handleSearchChange = (value: string) => {
        setSearchMembers(value);
        setCurrentPage(1);
    };

    // Get period info
    const getPeriodInfo = () => {
        if (month) {
            return `${format(new Date(year, month - 1), 'MMMM yyyy', { locale: id })}`;
        }
        return `${year}`;
    };

    // Calculate total amount per member for current period
    const getMemberTotalAmount = (member: typeof members[0]) => {
        return member.total_amount || 0;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Iuran JHT" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Laporan Iuran JHT
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Laporan umum dan per anggota untuk periode {generalStats.period}
                        </p>
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

                        <Select value={month?.toString() || 'all'} onValueChange={handleMonthChange}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Seluruh Tahun</SelectItem>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => (
                                    <SelectItem key={monthNum} value={monthNum.toString()}>
                                        {format(new Date(year, monthNum - 1), 'MMMM', { locale: id })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Anggota</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{generalStats.total_members}</div>
                            <p className="text-xs text-muted-foreground">
                                {generalStats.active_members} aktif {month ? 'bulan ini' : 'tahun ini'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pembayaran</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{generalStats.total_payments}</div>
                            <p className="text-xs text-muted-foreground">
                                {generalStats.terbayar_payments} terbayar
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Terbayar</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(generalStats.terbayar_amount)}</div>
                            <p className="text-xs text-muted-foreground">
                                pembayaran yang sudah terbayar
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan Status Pembayaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                                <div>
                                    <p className="text-2xl font-bold text-green-600">{generalStats.terbayar_payments}</p>
                                    <p className="text-sm text-muted-foreground">Terbayar</p>
                                    <p className="text-sm font-medium">{formatCurrency(generalStats.terbayar_amount)}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Clock className="h-8 w-8 text-yellow-500" />
                                <div>
                                    <p className="text-2xl font-bold text-yellow-600">{generalStats.pending_payments}</p>
                                    <p className="text-sm text-muted-foreground">Menunggu</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Members List */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle>Daftar Anggota</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Total iuran periode {getPeriodInfo()}
                                </p>
                            </div>
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama atau email..."
                                    value={searchMembers}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Jumlah Iuran</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedMembers.length > 0 ? (
                                    paginatedMembers.map(member => (
                                        <TableRow key={member.id}>
                                            <TableCell className="font-medium">{member.full_name}</TableCell>
                                            <TableCell>{member.email}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(getMemberTotalAmount(member))}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.visit(`/admin/reports/${member.id}?year=${year}`)}
                                                >
                                                    <User className="mr-2 h-4 w-4" />
                                                    Lihat Laporan
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-8 text-center">
                                            <p className="text-muted-foreground">
                                                {searchMembers ? 'Anggota tidak ditemukan.' : 'Belum ada anggota.'}
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                            const isActive = page === currentPage;
                                            const isNeighbor = Math.abs(page - currentPage) <= 1;
                                            const isFirstOrLast = page === 1 || page === totalPages;

                                            if (isFirstOrLast || isActive || isNeighbor) {
                                                return (
                                                    <PaginationItem key={page}>
                                                        <PaginationLink
                                                            onClick={() => setCurrentPage(page)}
                                                            isActive={isActive}
                                                            className="cursor-pointer"
                                                        >
                                                            {page}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            }

                                            if (
                                                (page === currentPage - 2 && currentPage > 3) ||
                                                (page === currentPage + 2 && currentPage < totalPages - 2)
                                            ) {
                                                return (
                                                    <PaginationItem key={page}>
                                                        <PaginationEllipsis />
                                                    </PaginationItem>
                                                );
                                            }

                                            return null;
                                        })}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}

                        {/* Results info */}
                        <div className="text-center text-sm text-muted-foreground">
                            Menampilkan {paginatedMembers.length > 0 ? (currentPage - 1) * membersPerPage + 1 : 0} - {Math.min(currentPage * membersPerPage, filteredMembers.length)} dari {filteredMembers.length} anggota
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}