import { Head } from '@inertiajs/react';
import { Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

import CreatePaymentModal from './CreatePaymentModal';
import DeletePaymentModal from './DeletePaymentModal';
import EditPaymentModal from './EditPaymentModal';
import ShowPaymentModal from './ShowPaymentModal';
import { Payment, User } from '@/pages/shared/types';

interface PaymentsIndexProps {
    payments: {
        data: Payment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    users: User[];
    breadcrumbs: Array<{
        title: string;
        href: string;
    }>;
}

export default function Index({
    payments,
    users,
    breadcrumbs,
}: PaymentsIndexProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isShowModalOpen, setIsShowModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(
        null,
    );
    const [searchPayments, setSearchPayments] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const paymentsPerPage = 10;

    const handleEditPayment = (payment: Payment) => {
        setSelectedPayment(payment);
        setIsEditModalOpen(true);
    };

    const handleDeletePayment = (payment: Payment) => {
        setSelectedPayment(payment);
        setIsDeleteModalOpen(true);
    };

    const handleShowPayment = (payment: Payment) => {
        setSelectedPayment(payment);
        setIsShowModalOpen(true);
    };

    // Filtered payments based on search
    const filteredPayments = useMemo(() => {
        const searchLower = searchPayments.toLowerCase();
        return payments.data.filter(payment =>
            payment.user.full_name.toLowerCase().includes(searchLower) ||
            payment.user.member_number?.toLowerCase().includes(searchLower) ||
            payment.user.email?.toLowerCase().includes(searchLower) ||
            payment.amount.includes(searchPayments)
        );
    }, [payments.data, searchPayments]);

    // Paginated payments
    const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
    const paginatedPayments = useMemo(() => {
        const startIndex = (currentPage - 1) * paymentsPerPage;
        const endIndex = startIndex + paymentsPerPage;
        return filteredPayments.slice(startIndex, endIndex);
    }, [filteredPayments, currentPage, paymentsPerPage]);

    // Reset to page 1 when search changes
    const handleSearchChange = (value: string) => {
        setSearchPayments(value);
        setCurrentPage(1);
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: 'outline',
            terbayar: 'default',
        } as const;

        const labels = {
            pending: 'Pending',
            terbayar: 'Terbayar',
        };

        return (
            <Badge
                variant={variants[status as keyof typeof variants] || 'outline'}
            >
                {labels[status as keyof typeof labels] || status}
            </Badge>
        );
    };

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(parseFloat(amount));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payments Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Payments
                        </h1>
                        <p className="text-muted-foreground">
                            Manage member payments and validations
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari member, jumlah, atau nomor..."
                                value={searchPayments}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10 md:w-72"
                            />
                        </div>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Payment
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="rounded-lg border bg-card">
                    {paginatedPayments.length === 0 ? (
                        <div className="flex h-32 items-center justify-center text-muted-foreground">
                            <p>
                                {searchPayments
                                    ? 'No payments found matching your search.'
                                    : 'No payments found'}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Member</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Payment Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Image</TableHead>
                                    <TableHead className="w-[120px]">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedPayments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">
                                            #{payment.id}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">
                                                    {payment.user.full_name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {payment.user.member_number}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {formatCurrency(payment.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {new Date(
                                                    payment.payment_date,
                                                ).toLocaleDateString('id-ID')}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(payment.status)}
                                        </TableCell>
                                        <TableCell>
                                            {payment.image ? (
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={payment.image_url}
                                                        alt="Payment proof"
                                                        className="h-8 w-8 rounded object-cover"
                                                    />
                                                    <span className="text-sm text-muted-foreground">
                                                        Available
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">
                                                    No image
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleShowPayment(
                                                            payment,
                                                        )
                                                    }
                                                    aria-label={`View payment ${payment.id}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleEditPayment(
                                                            payment,
                                                        )
                                                    }
                                                    aria-label={`Edit payment ${payment.id}`}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeletePayment(
                                                            payment,
                                                        )
                                                    }
                                                    aria-label={`Delete payment ${payment.id}`}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-center">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() =>
                                                setCurrentPage(
                                                    Math.max(1, currentPage - 1),
                                                )
                                            }
                                            className={
                                                currentPage === 1
                                                    ? 'pointer-events-none opacity-50'
                                                    : 'cursor-pointer'
                                            }
                                        />
                                    </PaginationItem>

                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1,
                                    ).map((page) => {
                                        const isActive = page === currentPage;
                                        const isNeighbor =
                                            Math.abs(page - currentPage) <= 1;
                                        const isFirstOrLast =
                                            page === 1 ||
                                            page === totalPages;

                                        if (
                                            isFirstOrLast ||
                                            isActive ||
                                            isNeighbor
                                        ) {
                                            return (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                page,
                                                            )
                                                        }
                                                        isActive={isActive}
                                                        className="cursor-pointer"
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        }

                                        if (
                                            (page ===
                                                currentPage - 2 &&
                                                currentPage > 3) ||
                                            (page ===
                                                currentPage + 2 &&
                                                currentPage <
                                                    totalPages - 2)
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
                                            onClick={() =>
                                                setCurrentPage(
                                                    Math.min(
                                                        totalPages,
                                                        currentPage + 1,
                                                    ),
                                                )
                                            }
                                            className={
                                                currentPage === totalPages
                                                    ? 'pointer-events-none opacity-50'
                                                    : 'cursor-pointer'
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>

                        {/* Results info */}
                        <div className="text-center text-sm text-muted-foreground">
                            Menampilkan{' '}
                            {paginatedPayments.length > 0
                                ? (currentPage - 1) *
                                      paymentsPerPage +
                                  1
                                : 0}{' '}
                            -{' '}
                            {Math.min(
                                currentPage * paymentsPerPage,
                                filteredPayments.length,
                            )}{' '}
                            dari {filteredPayments.length} pembayaran
                        </div>
                    </div>
                )}

                {/* Pagination Info Fallback */}
                {totalPages === 0 && payments.total > 0 && (
                    <div className="text-center text-sm text-muted-foreground">
                        Total {payments.total} pembayaran
                    </div>
                )}

                {/* Modals */}
                <CreatePaymentModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    users={users}
                />
                <EditPaymentModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    payment={selectedPayment}
                    users={users}
                />
                <DeletePaymentModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    payment={selectedPayment}
                />
                <ShowPaymentModal
                    isOpen={isShowModalOpen}
                    onClose={() => setIsShowModalOpen(false)}
                    payment={selectedPayment}
                />
            </div>
        </AppLayout>
    );
}
