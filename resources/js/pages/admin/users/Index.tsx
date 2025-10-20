import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
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
import { Edit, Eye, Plus, Trash2, Search } from 'lucide-react';
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
        links: Array<{ url: string | null; label: string; active: boolean }>;
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
    
    // Client-side live search
    const [search, setSearch] = useState('');

    // Filter users based on search
    const filteredUsers = users.data.filter((user) => {
        const searchLower = search.toLowerCase();
        return (
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            (user.member_number?.toLowerCase().includes(searchLower) ?? false) ||
            (user.phone?.toLowerCase().includes(searchLower) ?? false)
        );
    });

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
                {/* Search and Filter Controls */}
                <div className="flex flex-row items-center justify-between">
                    <div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by Name, Email, Member #, or Phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 md:w-72"
                            />
                        </div>
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
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
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
                        ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="py-8 text-center">
                                    <p className="text-muted-foreground">
                                        {search ? 'No users found matching your search.' : 'No users found.'}
                                    </p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="mt-8 flex justify-center">
                        <Pagination>
                            <PaginationContent>
                                {users.links.map((link, index) => {
                                    const isActive = link.active;
                                    const isDisabled = link.url === null;
                                    const isEllipsis =
                                        link.label === '...';

                                    if (isEllipsis) {
                                        return (
                                            <PaginationItem key={index}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }

                                    if (
                                        link.label === '&laquo; Previous' ||
                                        link.label.includes('Previous')
                                    ) {
                                        return (
                                            <PaginationItem key={index}>
                                                <PaginationPrevious
                                                    href={
                                                        link.url || '#'
                                                    }
                                                    onClick={(e) => {
                                                        if (isDisabled) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    className={
                                                        isDisabled
                                                            ? 'pointer-events-none opacity-50'
                                                            : ''
                                                    }
                                                />
                                            </PaginationItem>
                                        );
                                    }

                                    if (
                                        link.label === 'Next &raquo;' ||
                                        link.label.includes('Next')
                                    ) {
                                        return (
                                            <PaginationItem key={index}>
                                                <PaginationNext
                                                    href={
                                                        link.url || '#'
                                                    }
                                                    onClick={(e) => {
                                                        if (isDisabled) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    className={
                                                        isDisabled
                                                            ? 'pointer-events-none opacity-50'
                                                            : ''
                                                    }
                                                />
                                            </PaginationItem>
                                        );
                                    }

                                    return (
                                        <PaginationItem key={index}>
                                            <PaginationLink
                                                href={link.url || '#'}
                                                isActive={isActive}
                                                onClick={(e) => {
                                                    if (isDisabled) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                {link.label
                                                    .replace(
                                                        /&laquo;|&raquo;/g,
                                                        '',
                                                    )
                                                    .trim()}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}
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
