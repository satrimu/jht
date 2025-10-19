import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { UploadCloud, X } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    full_name: string;
    member_number: string;
}

interface CreatePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
}

interface CreatePaymentData {
    user_id: string;
    amount: string;
    payment_date: string;
    status: string;
    notes: string;
    image: File | null;
}

export default function CreatePaymentModal({
    isOpen,
    onClose,
    users,
}: CreatePaymentModalProps) {
    const { data, setData, post, processing, errors, reset } =
        useForm<CreatePaymentData>({
            user_id: '',
            amount: '',
            payment_date: new Date().toISOString().split('T')[0],
            status: 'pending',
            notes: '',
            image: null,
        });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleFileChange = (file: File | null) => {
        if (!file) return;

        const validTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ];
        if (!validTypes.includes(file.type)) {
            toast.error(
                'Harap upload file gambar yang valid (JPG, PNG, GIF, WebP)',
            );
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Ukuran file harus kurang dari 10MB');
            return;
        }

        setData('image', file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Manual validation
        if (!data.user_id) {
            toast.error('User wajib dipilih.');
            return;
        }
        if (!data.amount || parseFloat(data.amount) <= 0) {
            toast.error(
                'Jumlah pembayaran wajib diisi dan harus lebih dari 0.',
            );
            return;
        }

        post('/admin/payments', {
            forceFormData: true, // WAJIB untuk file upload
            onSuccess: () => {
                toast.success('Payment berhasil dibuat!');
                reset();
                setImagePreview(null);
                onClose();
            },
            onError: () => {
                toast.error('Gagal membuat payment. Silakan periksa form.');
            },
            preserveScroll: true,
        });
    };

    const handleClose = () => {
        reset();
        setImagePreview(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create Payment</DialogTitle>
                    <DialogDescription>
                        Add a new payment record for a member.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="user_id">Member *</Label>
                        <Select
                            value={data.user_id}
                            onValueChange={(value) => setData('user_id', value)}
                        >
                            <SelectTrigger
                                className={
                                    errors.user_id ? 'border-destructive' : ''
                                }
                            >
                                <SelectValue placeholder="Select member" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem
                                        key={user.id}
                                        value={user.id.toString()}
                                    >
                                        {user.full_name} ({user.member_number})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.user_id && (
                            <p className="text-sm text-destructive">
                                {errors.user_id}
                            </p>
                        )}
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount *</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            className={
                                errors.amount ? 'border-destructive' : ''
                            }
                            placeholder="0.00"
                            required
                        />
                        {errors.amount && (
                            <p className="text-sm text-destructive">
                                {errors.amount}
                            </p>
                        )}
                    </div>

                    {/* Payment Date */}
                    <div className="space-y-2">
                        <Label htmlFor="payment_date">Payment Date *</Label>
                        <Input
                            id="payment_date"
                            type="date"
                            value={data.payment_date}
                            onChange={(e) =>
                                setData('payment_date', e.target.value)
                            }
                            className={
                                errors.payment_date ? 'border-destructive' : ''
                            }
                            required
                        />
                        {errors.payment_date && (
                            <p className="text-sm text-destructive">
                                {errors.payment_date}
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Status *</Label>
                        <Select
                            value={data.status}
                            onValueChange={(value) => setData('status', value)}
                        >
                            <SelectTrigger
                                className={
                                    errors.status ? 'border-destructive' : ''
                                }
                            >
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="validated">
                                    Validated
                                </SelectItem>
                                <SelectItem value="rejected">
                                    Rejected
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && (
                            <p className="text-sm text-destructive">
                                {errors.status}
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            className={errors.notes ? 'border-destructive' : ''}
                            placeholder="Optional notes about the payment..."
                        />
                        {errors.notes && (
                            <p className="text-sm text-destructive">
                                {errors.notes}
                            </p>
                        )}
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>Payment Proof Image</Label>
                        <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    handleFileChange(
                                        e.target.files?.[0] || null,
                                    )
                                }
                                className="hidden"
                            />

                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="mx-auto h-32 w-32 rounded-lg object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute -top-2 -right-2"
                                        onClick={() => {
                                            setImagePreview(null);
                                            setData('image', null);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = '';
                                            }
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <UploadCloud className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        Click to upload payment proof
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="mt-2"
                                    >
                                        Choose File
                                    </Button>
                                </div>
                            )}
                        </div>
                        {errors.image && (
                            <p className="text-sm text-destructive">
                                {errors.image}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Payment'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
