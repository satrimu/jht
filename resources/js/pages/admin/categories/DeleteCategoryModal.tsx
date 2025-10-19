import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface Category {
    id: number;
    name: string;
    note: string | null;
}

interface DeleteCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: Category | null;
}

export default function DeleteCategoryModal({
    isOpen,
    onClose,
    category,
}: DeleteCategoryModalProps) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        if (!category) return;

        destroy(`/admin/categories/${category.id}`, {
            onSuccess: () => {
                toast.success('Category berhasil dihapus!');
                onClose();
            },
            onError: () => {
                toast.error('Gagal menghapus category. Silakan coba lagi.');
            },
            preserveScroll: true,
        });
    };

    if (!category) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Category</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this category? This
                        action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg bg-muted p-4">
                    <h4 className="font-medium">{category.name}</h4>
                    {category.note && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {category.note}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={processing}
                    >
                        {processing ? 'Deleting...' : 'Delete Category'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
