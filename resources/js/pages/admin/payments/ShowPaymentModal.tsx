import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ExternalLink } from 'lucide-react';

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

interface ShowPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: Payment | null;
}

export default function ShowPaymentModal({
    isOpen,
    onClose,
    payment,
}: ShowPaymentModalProps) {
    if (!payment) return null;

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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Payment Details</DialogTitle>
                    <DialogDescription>
                        View payment information for {payment.user.full_name}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Member Information */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold">
                            Member Information
                        </h3>
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
                                <p className="text-sm">{payment.user.email}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Payment Information */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold">
                            Payment Information
                        </h3>
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
                                <div>{getStatusBadge(payment.status)}</div>
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
                    </div>

                    {/* Payment Proof Image */}
                    {payment.image && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold">
                                    Payment Proof
                                </h3>
                                <div className="space-y-3">
                                    <div className="group relative">
                                        <img
                                            src={payment.image_url}
                                            alt="Payment proof"
                                            className="mx-auto w-full max-w-md cursor-pointer rounded-lg border shadow-sm transition-shadow hover:shadow-md"
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
                                </div>
                            </div>
                        </>
                    )}

                    <Separator />

                    {/* Timestamps */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold">
                            Record Information
                        </h3>
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
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
