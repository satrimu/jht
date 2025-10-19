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
import { router } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    member_number: string | null;
    full_name: string | null;
    phone: string | null;
    join_date: string | null;
    is_active: boolean;
}

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export default function DeleteUserModal({
    isOpen,
    onClose,
    user,
}: DeleteUserModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!user) return;

        setIsDeleting(true);
        router.delete(`/admin/users/${user.id}`, {
            onSuccess: () => {
                toast.success('User berhasil dihapus!');
                setIsDeleting(false);
                onClose();
            },
            onError: () => {
                setIsDeleting(false);
                toast.error('Failed to delete user. Please try again.');
            },
            preserveScroll: true,
        });
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                            <DialogTitle>Delete User</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete this user? This will
                        permanently remove the user and all associated data.
                    </p>

                    {/* User Details */}
                    <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Name:</span>
                            <span className="text-sm">
                                {user.full_name || user.name}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Email:</span>
                            <span className="text-sm">{user.email}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Role:</span>
                            <Badge
                                variant={
                                    user.role === 'admin'
                                        ? 'destructive'
                                        : 'secondary'
                                }
                            >
                                {user.role}
                            </Badge>
                        </div>

                        {user.member_number && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Member #:
                                </span>
                                <span className="text-sm">
                                    {user.member_number}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Status:</span>
                            <Badge
                                variant={user.is_active ? 'default' : 'outline'}
                            >
                                {user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>

                        {user.join_date && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Joined:
                                </span>
                                <span className="text-sm">
                                    {new Date(
                                        user.join_date,
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete User'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
