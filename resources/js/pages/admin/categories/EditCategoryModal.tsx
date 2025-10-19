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
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import { toast } from 'sonner';

interface Category {
    id: number;
    name: string;
    note: string | null;
}

interface EditCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: Category | null;
}

interface EditCategoryData {
    name: string;
    note: string;
}

export default function EditCategoryModal({
    isOpen,
    onClose,
    category,
}: EditCategoryModalProps) {
    const { data, setData, put, processing, errors, reset } =
        useForm<EditCategoryData>({
            name: '',
            note: '',
        });

    // Update form data when category changes
    useEffect(() => {
        if (category) {
            setData({
                name: category.name,
                note: category.note || '',
            });
        }
    }, [category, setData]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!category) return;

        // Manual validation
        if (!data.name.trim()) {
            toast.error('Nama kategori wajib diisi.');
            return;
        }

        put(`/admin/categories/${category.id}`, {
            onSuccess: () => {
                toast.success('Category berhasil diperbarui!');
                reset();
                onClose();
            },
            onError: () => {
                toast.error('Gagal memperbarui category. Silakan coba lagi.');
            },
            preserveScroll: true,
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!category) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                    <DialogDescription>
                        Update the category information below.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={errors.name ? 'border-destructive' : ''}
                            aria-invalid={errors.name ? 'true' : 'false'}
                            required
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Note Field */}
                    <div className="space-y-2">
                        <Label htmlFor="note">Note</Label>
                        <Textarea
                            id="note"
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            rows={4}
                            className={errors.note ? 'border-destructive' : ''}
                            aria-invalid={errors.note ? 'true' : 'false'}
                            placeholder="Optional note or description..."
                        />
                        {errors.note && (
                            <p className="text-sm text-destructive">
                                {errors.note}
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
                            {processing ? 'Updating...' : 'Update Category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
