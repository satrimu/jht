import { Head } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

interface Category {
    id: number;
    name: string;
    note: string | null;
    created_at: string;
    updated_at: string;
}

interface CategoryShowProps {
    category: Category;
    breadcrumbs: Array<{
        title: string;
        href: string;
    }>;
}

export default function Show({ category, breadcrumbs }: CategoryShowProps) {
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Category: ${category.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.history.back()}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {category.name}
                            </h1>
                            <p className="text-muted-foreground">
                                Category details and information
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Primary details about this category
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">
                                    ID:
                                </span>
                                <Badge variant="outline">#{category.id}</Badge>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Name:
                                </label>
                                <p className="mt-1 text-base font-medium">
                                    {category.name}
                                </p>
                            </div>

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
                        </CardContent>
                    </Card>

                    {/* Timestamps */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Timestamps</CardTitle>
                            <CardDescription>
                                Creation and modification dates
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Created:
                                </label>
                                <p className="mt-1 text-base">
                                    {formatDate(category.created_at)}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Last Updated:
                                </label>
                                <p className="mt-1 text-base">
                                    {formatDate(category.updated_at)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
