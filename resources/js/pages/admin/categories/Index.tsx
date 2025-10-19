import { Head } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

import CreateCategoryModal from './CreateCategoryModal';
import DeleteCategoryModal from './DeleteCategoryModal';
import EditCategoryModal from './EditCategoryModal';
import ShowCategoryModal from './ShowCategoryModal';

interface Category {
    id: number;
    name: string;
    note: string | null;
    created_at: string;
    updated_at: string;
}

interface CategoriesIndexProps {
    categories: {
        data: Category[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    breadcrumbs: Array<{
        title: string;
        href: string;
    }>;
}

export default function Index({
    categories,
    breadcrumbs,
}: CategoriesIndexProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isShowModalOpen, setIsShowModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null,
    );

    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setIsEditModalOpen(true);
    };

    const handleDeleteCategory = (category: Category) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    const handleShowCategory = (category: Category) => {
        setSelectedCategory(category);
        setIsShowModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Categories
                        </h1>
                        <p className="text-muted-foreground">
                            Manage categories for your application
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Category
                    </Button>
                </div>

                {/* Content */}
                <div className="rounded-lg border bg-card">
                    {categories.data.length === 0 ? (
                        <div className="flex h-32 items-center justify-center text-muted-foreground">
                            <p>No categories found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Note</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-[120px]">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.data.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">
                                            {category.name}
                                        </TableCell>
                                        <TableCell>
                                            {category.note ? (
                                                <span className="text-sm text-muted-foreground">
                                                    {category.note.length > 50
                                                        ? `${category.note.substring(0, 50)}...`
                                                        : category.note}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">
                                                    No note
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(
                                                    category.created_at,
                                                ).toLocaleDateString('id-ID')}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleShowCategory(
                                                            category,
                                                        )
                                                    }
                                                    aria-label={`View category ${category.name}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleEditCategory(
                                                            category,
                                                        )
                                                    }
                                                    aria-label={`Edit category ${category.name}`}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteCategory(
                                                            category,
                                                        )
                                                    }
                                                    aria-label={`Delete category ${category.name}`}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Pagination Info */}
                {categories.total > 0 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <p>
                            Showing{' '}
                            {(categories.current_page - 1) *
                                categories.per_page +
                                1}{' '}
                            to{' '}
                            {Math.min(
                                categories.current_page * categories.per_page,
                                categories.total,
                            )}{' '}
                            of {categories.total} results
                        </p>
                        <p>
                            Page {categories.current_page} of{' '}
                            {categories.last_page}
                        </p>
                    </div>
                )}

                {/* Modals */}
                <CreateCategoryModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />
                <EditCategoryModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    category={selectedCategory}
                />
                <DeleteCategoryModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    category={selectedCategory}
                />
                <ShowCategoryModal
                    isOpen={isShowModalOpen}
                    onClose={() => setIsShowModalOpen(false)}
                    category={selectedCategory}
                />
            </div>
        </AppLayout>
    );
}
