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
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

interface CreateCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CreateCategoryData {
    name: string;
    note: string;
}

export default function CreateCategoryModal({
    isOpen,
    onClose,
}: CreateCategoryModalProps) {
    const { data, setData, post, processing, errors, reset } =
        useForm<CreateCategoryData>({
            name: '',
            note: '',
        });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Manual validation
        if (!data.name.trim()) {
            toast.error('Nama kategori wajib diisi.');
            return;
        }

        post('/admin/categories', {
            onSuccess: () => {
                toast.success('Category berhasil dibuat!');
                reset();
                onClose();
            },
            onError: () => {
                toast.error('Gagal membuat category. Silakan periksa form.');
            },
            preserveScroll: true,
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Category</DialogTitle>
                    <DialogDescription>
                        Add a new category to organize your content.
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
                            {processing ? 'Creating...' : 'Create Category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
