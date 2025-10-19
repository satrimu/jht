import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useForm } from '@inertiajs/react';
import { UploadCloud, X } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CreateUserData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
    member_number: string;
    full_name: string;
    phone: string;
    address: string;
    join_date: string;
    note: string;
    is_active: boolean;
    image: File | null;
}

export default function CreateUserModal({
    isOpen,
    onClose,
}: CreateUserModalProps) {
    const { data, setData, post, processing, errors, reset } =
        useForm<CreateUserData>({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'user',
            member_number: '',
            full_name: '',
            phone: '',
            address: '',
            join_date: new Date().toISOString().split('T')[0],
            note: '',
            is_active: true,
            image: null,
        });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
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
                'Please upload a valid image file (JPG, PNG, GIF, WebP)',
            );
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setData('image', file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileChange(file);
        }
    };

    const handleCancelImage = () => {
        setImagePreview(null);
        setData('image', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/users', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('User berhasil dibuat!');
                reset();
                setImagePreview(null);
                onClose();
            },
            onError: () => {
                toast.error('Failed to create user. Please check the form.');
            },
            preserveScroll: true,
        });
    };

    const handleClose = () => {
        reset();
        setImagePreview(null);
        onClose();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            handleClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                        Add a new user to the system. Fill in the required
                        information below.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                aria-invalid={errors.name ? 'true' : 'false'}
                                required
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                aria-invalid={errors.email ? 'true' : 'false'}
                                required
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                aria-invalid={
                                    errors.password ? 'true' : 'false'
                                }
                                required
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Password Confirmation */}
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">
                                Confirm Password *
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                aria-invalid={
                                    errors.password_confirmation
                                        ? 'true'
                                        : 'false'
                                }
                                required
                            />
                            {errors.password_confirmation && (
                                <p className="text-sm text-destructive">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label htmlFor="role">Role *</Label>
                            <Select
                                value={data.role}
                                onValueChange={(value) =>
                                    setData('role', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-sm text-destructive">
                                    {errors.role}
                                </p>
                            )}
                        </div>

                        {/* Member Number */}
                        <div className="space-y-2">
                            <Label htmlFor="member_number">
                                Member Number *
                            </Label>
                            <Input
                                id="member_number"
                                value={data.member_number}
                                onChange={(e) =>
                                    setData('member_number', e.target.value)
                                }
                                aria-invalid={
                                    errors.member_number ? 'true' : 'false'
                                }
                                required
                            />
                            {errors.member_number && (
                                <p className="text-sm text-destructive">
                                    {errors.member_number}
                                </p>
                            )}
                        </div>

                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name *</Label>
                            <Input
                                id="full_name"
                                value={data.full_name}
                                onChange={(e) =>
                                    setData('full_name', e.target.value)
                                }
                                aria-invalid={
                                    errors.full_name ? 'true' : 'false'
                                }
                                required
                            />
                            {errors.full_name && (
                                <p className="text-sm text-destructive">
                                    {errors.full_name}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                aria-invalid={errors.phone ? 'true' : 'false'}
                                required
                            />
                            {errors.phone && (
                                <p className="text-sm text-destructive">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Input
                                id="address"
                                value={data.address}
                                onChange={(e) =>
                                    setData('address', e.target.value)
                                }
                                aria-invalid={errors.address ? 'true' : 'false'}
                                required
                            />
                            {errors.address && (
                                <p className="text-sm text-destructive">
                                    {errors.address}
                                </p>
                            )}
                        </div>

                        {/* Note */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="note">Note</Label>
                            <Input
                                id="note"
                                value={data.note}
                                onChange={(e) =>
                                    setData('note', e.target.value)
                                }
                                aria-invalid={errors.note ? 'true' : 'false'}
                            />
                            {errors.note && (
                                <p className="text-sm text-destructive">
                                    {errors.note}
                                </p>
                            )}
                        </div>

                        {/* Join Date */}
                        <div className="space-y-2">
                            <Label htmlFor="join_date">Join Date</Label>
                            <Input
                                id="join_date"
                                type="date"
                                value={data.join_date}
                                onChange={(e) =>
                                    setData('join_date', e.target.value)
                                }
                                aria-invalid={
                                    errors.join_date ? 'true' : 'false'
                                }
                            />
                            {errors.join_date && (
                                <p className="text-sm text-destructive">
                                    {errors.join_date}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Avatar Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="image">Avatar Image</Label>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                                isDragOver
                                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950'
                                    : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900'
                            }`}
                        >
                            <Input
                                id="image"
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (file) {
                                        handleFileChange(file);
                                    }
                                }}
                                className="hidden"
                            />

                            {!imagePreview && (
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                                        <UploadCloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                            Drag & Drop your avatar here
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            or click to select
                                        </p>
                                    </div>
                                    <Label
                                        htmlFor="image"
                                        className="cursor-pointer"
                                    >
                                        <span className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                                            Browse Files
                                        </span>
                                    </Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        JPG, PNG, GIF, WebP • Max 10MB •
                                        200x200px
                                    </p>
                                </div>
                            )}

                            {imagePreview && (
                                <div className="flex items-start justify-between rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-600 dark:bg-green-900/20">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={imagePreview}
                                            alt="Avatar preview"
                                            className="h-16 w-16 rounded-full object-cover"
                                        />
                                        <div className="text-left">
                                            <p className="font-medium text-green-900 dark:text-green-100">
                                                Avatar Selected
                                            </p>
                                            <p className="text-xs text-green-700 dark:text-green-300">
                                                200x200px WebP (auto-converted)
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCancelImage}
                                        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        {errors.image && (
                            <p className="text-sm text-destructive">
                                {errors.image}
                            </p>
                        )}
                    </div>

                    {/* Is Active */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData('is_active', checked as boolean)
                            }
                        />
                        <Label htmlFor="is_active">Active user</Label>
                        {errors.is_active && (
                            <p className="text-sm text-destructive">
                                {errors.is_active}
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
                            {processing ? 'Creating...' : 'Create User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
