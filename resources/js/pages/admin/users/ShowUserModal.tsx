import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
    Calendar,
    Edit,
    Hash,
    Info,
    Mail,
    MapPin,
    Phone,
    Shield,
    StickyNote,
    Trash2,
    User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';
import DeleteUserModal from './DeleteUserModal';
import EditUserModal from './EditUserModal';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    member_number: string | null;
    full_name: string | null;
    phone: string | null;
    address: string | null;
    join_date: string | null;
    note: string | null;
    is_active: boolean;
    image: string | null;
    image_url: string; // URL lengkap dengan fallback
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface ShowUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export default function ShowUserModal({
    isOpen,
    onClose,
    user,
}: ShowUserModalProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleEditUser = () => {
        setIsEditModalOpen(true);
    };

    const handleDeleteUser = () => {
        setIsDeleteModalOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    if (!user) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <img
                                    src={user.image_url}
                                    alt={user.full_name || user.name}
                                    className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
                                    onError={(e) => {
                                        e.currentTarget.src = '/user.webp';
                                    }}
                                />
                                <div>
                                    <DialogTitle className="text-2xl font-bold">
                                        {user.full_name || user.name}
                                    </DialogTitle>
                                    <DialogDescription className="mt-1 flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        {user.email}
                                    </DialogDescription>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleEditUser}
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteUser}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <UserIcon className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-3">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Username
                                            </span>
                                            <span className="text-sm font-semibold">
                                                {user.name}
                                            </span>
                                        </div>

                                        {user.full_name &&
                                            user.full_name !== user.name && (
                                                <div className="flex justify-between border-b pb-2">
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        Full Name
                                                    </span>
                                                    <span className="text-sm font-semibold">
                                                        {user.full_name}
                                                    </span>
                                                </div>
                                            )}

                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Email Status
                                            </span>
                                            <Badge
                                                variant={
                                                    user.email_verified_at
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                            >
                                                {user.email_verified_at
                                                    ? 'Verified'
                                                    : 'Not Verified'}
                                            </Badge>
                                        </div>

                                        {user.phone && (
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    Phone
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="text-sm font-semibold">
                                                        {user.phone}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {user.address && (
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    Address
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="text-sm font-semibold">
                                                        {user.address}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Role & Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Shield className="h-5 w-5" />
                                        Role & Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-3">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Role
                                            </span>
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

                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Status
                                            </span>
                                            <Badge
                                                variant={
                                                    user.is_active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                            >
                                                {user.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>
                                        </div>

                                        {user.member_number && (
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    Member No.
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="text-sm font-semibold">
                                                        {user.member_number}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {user.join_date && (
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    Join Date
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="text-sm font-semibold">
                                                        {new Date(
                                                            user.join_date,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Notes Section (Full Width if exists) */}
                        {user.note && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <StickyNote className="h-5 w-5" />
                                        Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="rounded-md bg-muted p-4 text-sm leading-relaxed">
                                        {user.note}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* System Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Info className="h-5 w-5" />
                                    System Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            User ID
                                        </span>
                                        <p className="text-sm font-semibold">
                                            #{user.id}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Created At
                                        </span>
                                        <p className="text-sm">
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleString('id-ID')}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Last Updated
                                        </span>
                                        <p className="text-sm">
                                            {new Date(
                                                user.updated_at,
                                            ).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Quick Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="outline" asChild>
                                        <a href={`mailto:${user.email}`}>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Send Email
                                        </a>
                                    </Button>

                                    {user.phone && (
                                        <Button variant="outline" asChild>
                                            <a href={`tel:${user.phone}`}>
                                                <Phone className="mr-2 h-4 w-4" />
                                                Call User
                                            </a>
                                        </Button>
                                    )}

                                    <Separator
                                        orientation="vertical"
                                        className="h-6"
                                    />

                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteUser}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete User
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Nested Modals */}
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
            />

            <DeleteUserModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                user={user}
            />
        </>
    );
}
