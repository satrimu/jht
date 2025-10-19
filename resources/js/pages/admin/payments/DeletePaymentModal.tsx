import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    full_name: string;
    member_number: string;
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
    user: User;
}

interface DeletePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: Payment | null;
}

export default function DeletePaymentModal({
    isOpen,
    onClose,
    payment,
}: DeletePaymentModalProps) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        if (!payment) return;

        destroy(`/admin/payments/${payment.id}`, {
            onSuccess: () => {
                toast.success('Payment berhasil dihapus!');
                onClose();
            },
            onError: () => {
                toast.error('Gagal menghapus payment. Silakan coba lagi.');
            },
            preserveScroll: true,
        });
    };

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

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Pending';
            case 'terbayar':
                return 'Terbayar';
            default:
                return status;
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3">
                            <p>
                                Are you sure you want to delete this payment?
                                This action cannot be undone.
                            </p>

                            <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                                <h4 className="font-medium text-foreground">
                                    Payment Details:
                                </h4>
                                <div className="space-y-1 text-sm">
                                    <p>
                                        <span className="font-medium">
                                            Member:
                                        </span>{' '}
                                        {payment.user.full_name} (
                                        {payment.user.member_number})
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Amount:
                                        </span>{' '}
                                        {formatCurrency(payment.amount)}
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Date:
                                        </span>{' '}
                                        {formatDate(payment.payment_date)}
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Status:
                                        </span>{' '}
                                        {getStatusLabel(payment.status)}
                                    </p>
                                    {payment.notes && (
                                        <p>
                                            <span className="font-medium">
                                                Notes:
                                            </span>{' '}
                                            {payment.notes}
                                        </p>
                                    )}
                                </div>

                                {payment.image && (
                                    <div className="mt-3">
                                        <p className="mb-2 text-sm font-medium">
                                            Payment Proof:
                                        </p>
                                        <img
                                            src={payment.image_url}
                                            alt="Payment proof"
                                            className="h-24 w-24 rounded-lg object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={processing}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={processing}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {processing ? 'Deleting...' : 'Delete Payment'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
