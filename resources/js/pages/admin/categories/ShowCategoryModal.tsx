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

interface Category {
    id: number;
    name: string;
    note: string | null;
    created_at: string;
    updated_at: string;
}

interface ShowCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: Category | null;
}

export default function ShowCategoryModal({
    isOpen,
    onClose,
    category,
}: ShowCategoryModalProps) {
    if (!category) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Category Details</DialogTitle>
                    <DialogDescription>
                        View detailed information about this category.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* ID */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                            ID:
                        </span>
                        <Badge variant="outline">#{category.id}</Badge>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">
                            Name:
                        </label>
                        <p className="mt-1 text-base">{category.name}</p>
                    </div>

                    {/* Note */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">
                            Note:
                        </label>
                        {category.note ? (
                            <p className="mt-1 text-base text-muted-foreground">
                                {category.note}
                            </p>
                        ) : (
                            <p className="mt-1 text-base text-muted-foreground italic">
                                No note provided
                            </p>
                        )}
                    </div>

                    {/* Timestamps */}
                    <div className="space-y-2 rounded-lg bg-muted p-3">
                        <div>
                            <span className="text-sm font-medium text-muted-foreground">
                                Created:
                            </span>
                            <p className="text-sm">
                                {formatDate(category.created_at)}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-muted-foreground">
                                Last Updated:
                            </span>
                            <p className="text-sm">
                                {formatDate(category.updated_at)}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
