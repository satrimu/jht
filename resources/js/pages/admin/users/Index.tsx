import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import CreateUserModal from './CreateUserModal';
import DeleteUserModal from './DeleteUserModal';
import EditUserModal from './EditUserModal';
import ShowUserModal from './ShowUserModal';

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

interface UsersIndexProps {
    users: {
        data: User[];
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

export default function Index({ users, breadcrumbs }: UsersIndexProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isShowModalOpen, setIsShowModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleShowUser = (user: User) => {
        setSelectedUser(user);
        setIsShowModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleDeleteUser = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Users Management
                        </h1>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Member #</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Join Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.data.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={user.image_url}
                                            alt={user.full_name || user.name}
                                            className="h-8 w-8 rounded object-cover"
                                            onError={(e) => {
                                                // Fallback if image fails to load
                                                e.currentTarget.src =
                                                    '/user.webp';
                                            }}
                                        />
                                        <span>
                                            {user.full_name || user.name}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            user.role === 'admin'
                                                ? 'destructive'
                                                : 'secondary'
                                        }
                                    >
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.member_number || '-'}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            user.is_active
                                                ? 'default'
                                                : 'outline'
                                        }
                                    >
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.join_date
                                        ? new Date(
                                              user.join_date,
                                          ).toLocaleDateString()
                                        : '-'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleShowUser(user)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditUser(user)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleDeleteUser(user)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="mt-8 flex justify-center">
                        <Pagination>
                            <PaginationContent>
                                {/* Previous Button */}
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={
                                            users.prev_page_url
                                                ? users.prev_page_url
                                                : '#'
                                        }
                                        onClick={(e) => {
                                            if (!users.prev_page_url) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className={
                                            !users.prev_page_url
                                                ? 'pointer-events-none opacity-50'
                                                : ''
                                        }
                                    />
                                </PaginationItem>

                                {/* Page Numbers */}
                                {Array.from(
                                    { length: users.last_page },
                                    (_, i) => i + 1,
                                ).map((page) => {
                                    const isActive =
                                        page === users.current_page;
                                    const isNeighbor = Math.abs(
                                        page - users.current_page,
                                    ) <= 1;
                                    const isFirstOrLast =
                                        page === 1 ||
                                        page === users.last_page;

                                    // Show: first, last, current, and neighbors
                                    if (
                                        isFirstOrLast ||
                                        isActive ||
                                        isNeighbor
                                    ) {
                                        return (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href={`?page=${page}`}
                                                    isActive={isActive}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    }

                                    // Show ellipsis between groups
                                    if (
                                        (page ===
                                            users.current_page - 2 &&
                                            users.current_page > 3) ||
                                        (page ===
                                            users.current_page + 2 &&
                                            users.current_page <
                                                users.last_page - 2)
                                    ) {
                                        return (
                                            <PaginationItem key={page}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }

                                    return null;
                                })}

                                {/* Next Button */}
                                <PaginationItem>
                                    <PaginationNext
                                        href={
                                            users.next_page_url
                                                ? users.next_page_url
                                                : '#'
                                        }
                                        onClick={(e) => {
                                            if (!users.next_page_url) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className={
                                            !users.next_page_url
                                                ? 'pointer-events-none opacity-50'
                                                : ''
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}

                {/* Modals */}
                <CreateUserModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />

                <ShowUserModal
                    isOpen={isShowModalOpen}
                    onClose={() => {
                        setIsShowModalOpen(false);
                        setSelectedUser(null);
                    }}
                    user={selectedUser}
                />

                <EditUserModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedUser(null);
                    }}
                    user={selectedUser}
                />

                <DeleteUserModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setSelectedUser(null);
                    }}
                    user={selectedUser}
                />
            </div>
        </AppLayout>
    );
}
