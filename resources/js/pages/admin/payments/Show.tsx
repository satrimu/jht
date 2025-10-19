import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, ExternalLink, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DeletePaymentModal from './DeletePaymentModal';
import EditPaymentModal from './EditPaymentModal';

interface User {
    id: number;
    name: string;
    full_name: string;
    member_number: string;
    email: string;
}

interface Payment {
    id: number;
    user_id: number;
    amount: string;
    payment_date: string;
    status: string;
    notes: string | null;
    image: string | null;
    image_url: string;
    created_at: string;
    updated_at: string;
    user: User;
}

interface PaymentShowProps {
    payment: Payment;
    breadcrumbs: Array<{
        title: string;
        href: string;
    }>;
}

export default function Show({ payment, breadcrumbs }: PaymentShowProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(parseFloat(amount));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>;
            case 'validated':
                return <Badge variant="default">Validated</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const openImageInNewTab = () => {
        if (payment.image_url) {
            window.open(payment.image_url, '_blank');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`Payment #${payment.id} - ${payment.user.full_name}`}
            />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/payments"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-muted bg-muted/50 hover:bg-muted"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">
                                Payment #{payment.id}
                            </h1>
                            <p className="text-muted-foreground">
                                Payment details for {payment.user.full_name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setIsDeleteModalOpen(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Member Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Member Information</CardTitle>
                                <CardDescription>
                                    Details about the member
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">
                                            Full Name
                                        </Label>
                                        <p className="text-sm font-medium">
                                            {payment.user.full_name}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">
                                            Member Number
                                        </Label>
                                        <p className="text-sm font-medium">
                                            {payment.user.member_number}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">
                                            Email
                                        </Label>
                                        <p className="text-sm">
                                            {payment.user.email}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Information</CardTitle>
                                <CardDescription>
                                    Payment details and status
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">
                                            Payment ID
                                        </Label>
                                        <p className="text-sm font-medium">
                                            #{payment.id}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">
                                            Amount
                                        </Label>
                                        <p className="text-lg font-bold text-green-600">
                                            {formatCurrency(payment.amount)}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">
                                            Payment Date
                                        </Label>
                                        <p className="text-sm">
                                            {formatDate(payment.payment_date)}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">
                                            Status
                                        </Label>
                                        <div>
                                            {getStatusBadge(payment.status)}
                                        </div>
                                    </div>
                                </div>

                                {payment.notes && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">
                                            Notes
                                        </Label>
                                        <p className="rounded-lg bg-muted/50 p-3 text-sm">
                                            {payment.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Record Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Record Information</CardTitle>
                                <CardDescription>
                                    Creation and modification dates
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">
                                            Created At
                                        </Label>
                                        <p className="text-sm">
                                            {formatDateTime(payment.created_at)}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">
                                            Last Updated
                                        </Label>
                                        <p className="text-sm">
                                            {formatDateTime(payment.updated_at)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Payment Proof */}
                        {payment.image ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Proof</CardTitle>
                                    <CardDescription>
                                        Uploaded payment proof image
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="group relative">
                                        <img
                                            src={payment.image_url}
                                            alt="Payment proof"
                                            className="w-full cursor-pointer rounded-lg border shadow-sm transition-shadow hover:shadow-md"
                                            onClick={openImageInNewTab}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 opacity-0 transition-colors group-hover:bg-black/10 group-hover:opacity-100">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={openImageInNewTab}
                                                className="shadow-lg"
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                View Full Size
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-center text-xs text-muted-foreground">
                                        Click image to view in full size
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Proof</CardTitle>
                                    <CardDescription>
                                        No payment proof uploaded
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="py-8 text-center">
                                        <p className="text-muted-foreground">
                                            No image available
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <EditPaymentModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                payment={payment}
                users={[payment.user]} // Just pass the current user for now
            />
            <DeletePaymentModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                payment={payment}
            />
        </AppLayout>
    );
}
