import { Head } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Payments
                        </h1>
                        <p className="text-muted-foreground">
                            Manage member payments and validations
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Payment
                    </Button>
                </div>

                {/* Content */}
                <div className="rounded-lg border bg-card">
                    {payments.data.length === 0 ? (
                        <div className="flex h-32 items-center justify-center text-muted-foreground">
                            <p>No payments found</p>
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
                                {payments.data.map((payment) => (
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

                {/* Pagination Info */}
                {payments.total > 0 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <p>
                            Showing{' '}
                            {(payments.current_page - 1) * payments.per_page +
                                1}{' '}
                            to{' '}
                            {Math.min(
                                payments.current_page * payments.per_page,
                                payments.total,
                            )}{' '}
                            of {payments.total} results
                        </p>
                        <p>
                            Page {payments.current_page} of {payments.last_page}
                        </p>
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
