import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ImageIcon, Loader2, RotateCw, UploadCloud, X } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

interface SettingApp {
    nama_app: string;
    description: string;
    address: string;
    email: string;
    phone: string;
    facebook: string;
    instagram: string;
    tiktok: string;
    youtube: string;
    image: string;
}

interface Props {
    setting: SettingApp | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Application Settings', href: '/settingsapp' },
];

export default function SettingForm({ setting }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        nama_app: setting?.nama_app || '',
        description: setting?.description || '',
        address: setting?.address || '',
        email: setting?.email || '',
        phone: setting?.phone || '',
        facebook: setting?.facebook || '',
        instagram: setting?.instagram || '',
        tiktok: setting?.tiktok || '',
        youtube: setting?.youtube || '',
        image: null as File | null,
    });

    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [isDragOver, setIsDragOver] = React.useState(false);
    const currentImageUrl = setting?.image || null;
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
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
            'image/svg+xml',
        ];
        if (!validTypes.includes(file.type)) {
            toast.error(
                'Please upload a valid image file (JPG, PNG, GIF, WebP, SVG)',
            );
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size must be less than 2MB');
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

    const handleCancelNewImage = () => {
        setImagePreview(null);
        setData('image', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/settingsapp', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setTimeout(() => {
                    toast.success('Settings saved successfully!');
                }, 100);
            },
            onError: () => {
                toast.error(
                    'Failed to save settings. Please check the form for errors.',
                );
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Application Settings" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Application Settings
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Manage your application configuration and branding
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Logo Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                Application Logo
                            </CardTitle>
                            <CardDescription>
                                Upload your application logo (Max 2MB)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                                    isDragOver
                                        ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950'
                                        : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900'
                                }`}
                            >
                                <Input
                                    id="logo"
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                                    onChange={(e) => {
                                        const file =
                                            e.target.files?.[0] || null;
                                        if (file) {
                                            handleFileChange(file);
                                        }
                                    }}
                                    className="hidden"
                                />

                                {!imagePreview && !currentImageUrl && (
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                                            <UploadCloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                Drag & Drop your image here
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                or click to select
                                            </p>
                                        </div>
                                        <Label
                                            htmlFor="logo"
                                            className="cursor-pointer"
                                        >
                                            <span className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                                                Browse Files
                                            </span>
                                        </Label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            JPG, PNG, GIF, WebP, SVG • Max 2MB
                                        </p>
                                    </div>
                                )}

                                {!imagePreview && currentImageUrl && (
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="group relative">
                                            <img
                                                src={currentImageUrl}
                                                alt="Current logo"
                                                className="max-h-32 rounded object-contain"
                                            />
                                        </div>

                                        <Label
                                            htmlFor="logo"
                                            className="w-full cursor-pointer"
                                        >
                                            <span className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                                                <RotateCw className="h-4 w-4" />
                                                Replace Image
                                            </span>
                                        </Label>
                                    </div>
                                )}

                                {imagePreview && (
                                    <div className="flex items-start justify-between rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-600 dark:bg-green-900/20">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={imagePreview}
                                                alt="New logo"
                                                className="h-16 w-16 rounded object-contain"
                                            />
                                            <div className="text-left">
                                                <p className="font-medium text-green-900 dark:text-green-100">
                                                    New Image Selected
                                                </p>
                                                <p className="text-xs text-green-700 dark:text-green-300">
                                                    Click save to apply changes
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCancelNewImage}
                                            className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Basic Information Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                General application details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Application Name */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="nama_app"
                                    className="text-base font-medium"
                                >
                                    Application Name{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="nama_app"
                                    placeholder="e.g., Ponpes Santrimu"
                                    value={data.nama_app}
                                    onChange={(e) =>
                                        setData('nama_app', e.target.value)
                                    }
                                    className={
                                        errors.nama_app
                                            ? 'border-red-500 focus-visible:ring-red-500'
                                            : ''
                                    }
                                />
                                {errors.nama_app && (
                                    <p className="text-sm font-medium text-red-500">
                                        {errors.nama_app}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="description"
                                    className="text-base font-medium"
                                >
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe your application..."
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    rows={3}
                                    className="resize-none"
                                />
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="address"
                                    className="text-base font-medium"
                                >
                                    Address{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="address"
                                    placeholder="Enter full address..."
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                    rows={3}
                                    className={`resize-none ${errors.address ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                />
                                {errors.address && (
                                    <p className="text-sm font-medium text-red-500">
                                        {errors.address}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>
                                Email and phone details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Email */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-base font-medium"
                                    >
                                        Email{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="contact@example.com"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        className={
                                            errors.email
                                                ? 'border-red-500 focus-visible:ring-red-500'
                                                : ''
                                        }
                                    />
                                    {errors.email && (
                                        <p className="text-sm font-medium text-red-500">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="phone"
                                        className="text-base font-medium"
                                    >
                                        Phone{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+62 xxx xxxx xxxx"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                        className={
                                            errors.phone
                                                ? 'border-red-500 focus-visible:ring-red-500'
                                                : ''
                                        }
                                    />
                                    {errors.phone && (
                                        <p className="text-sm font-medium text-red-500">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Social Media Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Social Media</CardTitle>
                            <CardDescription>
                                Links to your social media accounts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Facebook */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="facebook"
                                        className="text-base font-medium"
                                    >
                                        Facebook
                                    </Label>
                                    <Input
                                        id="facebook"
                                        type="url"
                                        placeholder="https://facebook.com/..."
                                        value={data.facebook}
                                        onChange={(e) =>
                                            setData('facebook', e.target.value)
                                        }
                                        className={
                                            errors.facebook
                                                ? 'border-red-500 focus-visible:ring-red-500'
                                                : ''
                                        }
                                    />
                                    {errors.facebook && (
                                        <p className="text-sm font-medium text-red-500">
                                            {errors.facebook}
                                        </p>
                                    )}
                                </div>

                                {/* Instagram */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="instagram"
                                        className="text-base font-medium"
                                    >
                                        Instagram
                                    </Label>
                                    <Input
                                        id="instagram"
                                        type="url"
                                        placeholder="https://instagram.com/..."
                                        value={data.instagram}
                                        onChange={(e) =>
                                            setData('instagram', e.target.value)
                                        }
                                        className={
                                            errors.instagram
                                                ? 'border-red-500 focus-visible:ring-red-500'
                                                : ''
                                        }
                                    />
                                    {errors.instagram && (
                                        <p className="text-sm font-medium text-red-500">
                                            {errors.instagram}
                                        </p>
                                    )}
                                </div>

                                {/* TikTok */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="tiktok"
                                        className="text-base font-medium"
                                    >
                                        TikTok
                                    </Label>
                                    <Input
                                        id="tiktok"
                                        type="url"
                                        placeholder="https://tiktok.com/..."
                                        value={data.tiktok}
                                        onChange={(e) =>
                                            setData('tiktok', e.target.value)
                                        }
                                        className={
                                            errors.tiktok
                                                ? 'border-red-500 focus-visible:ring-red-500'
                                                : ''
                                        }
                                    />
                                    {errors.tiktok && (
                                        <p className="text-sm font-medium text-red-500">
                                            {errors.tiktok}
                                        </p>
                                    )}
                                </div>

                                {/* YouTube */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="youtube"
                                        className="text-base font-medium"
                                    >
                                        YouTube
                                    </Label>
                                    <Input
                                        id="youtube"
                                        type="url"
                                        placeholder="https://youtube.com/..."
                                        value={data.youtube}
                                        onChange={(e) =>
                                            setData('youtube', e.target.value)
                                        }
                                        className={
                                            errors.youtube
                                                ? 'border-red-500 focus-visible:ring-red-500'
                                                : ''
                                        }
                                    />
                                    {errors.youtube && (
                                        <p className="text-sm font-medium text-red-500">
                                            {errors.youtube}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                        <Button
                            type="submit"
                            disabled={processing}
                            size="lg"
                            className="min-w-40"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Settings'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
