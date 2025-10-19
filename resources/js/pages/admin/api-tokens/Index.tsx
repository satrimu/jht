import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ApiToken {
    id: number;
    name: string;
    abilities: string[];
    created_at: string;
    last_used_at: string | null;
    expires_at: string | null;
}

interface TokensIndexProps {
    tokens: {
        data: ApiToken[];
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
    flash?: {
        success?: string;
        error?: string;
        token?: string;
        token_id?: number | string;
    };
}

export default function Index({
    tokens,
    breadcrumbs,
    flash,
}: TokensIndexProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedToken, setSelectedToken] = useState<ApiToken | null>(null);
    const [copiedToken, setCopiedToken] = useState<string | null>(null);
    const [showToken, setShowToken] = useState<string | null>(null);
    const [maskedTokens] = useState<Record<number, string>>({});
    const [readTokenId, setReadTokenId] = useState<number | null>(null);
    const [isReadModalOpen, setIsReadModalOpen] = useState(false);

    const createForm = useForm({
        name: '',
        abilities: [] as string[],
        expires_at: '',
    });

    const deleteForm = useForm({});

    const handleCreateToken = () => {
        createForm.post('/admin/api-tokens', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleDeleteToken = (token: ApiToken) => {
        setSelectedToken(token);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedToken) {
            deleteForm.delete(`/admin/api-tokens/${selectedToken.id}`, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setSelectedToken(null);
                },
            });
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedToken(text);
            setTimeout(() => setCopiedToken(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isExpired = (expiresAt: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    const availableAbilities = [
        { value: '*', label: 'Full Access (*)' },
        { value: 'read', label: 'Read Only' },
        { value: 'write', label: 'Write Access' },
        { value: 'users:read', label: 'Read Users' },
        { value: 'users:write', label: 'Manage Users' },
        { value: 'logs:read', label: 'Read Logs' },
        { value: 'settings:read', label: 'Read Settings' },
        { value: 'settings:write', label: 'Manage Settings' },
    ];

    const handleAbilityChange = (ability: string, checked: boolean) => {
        if (checked) {
            createForm.setData('abilities', [
                ...createForm.data.abilities,
                ability,
            ]);
        } else {
            createForm.setData(
                'abilities',
                createForm.data.abilities.filter((a) => a !== ability),
            );
        }
    };

    // Show token and token_id from flash data
    useEffect(() => {
        if (flash?.token) {
            setShowToken(flash.token);
        }
        if (flash?.token_id) {
            setReadTokenId(Number(flash.token_id));
        }
        // If a token was just created, open the read modal automatically
        if (flash?.token) {
            setIsReadModalOpen(true);
        }
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="API Tokens Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            API Tokens Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your API access tokens for third-party
                            integrations.
                        </p>
                    </div>
                    <Dialog
                        open={isCreateModalOpen}
                        onOpenChange={setIsCreateModalOpen}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Token
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create API Token</DialogTitle>
                                <DialogDescription>
                                    Create a new API token for accessing your
                                    application programmatically.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="name"
                                        className="text-right"
                                    >
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={createForm.data.name}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        className="col-span-3"
                                        placeholder="e.g., Mobile App Token"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <Label className="pt-2 text-right">
                                        Abilities
                                    </Label>
                                    <div className="col-span-3 space-y-2">
                                        {availableAbilities.map((ability) => (
                                            <div
                                                key={ability.value}
                                                className="flex items-center space-x-2"
                                            >
                                                <Checkbox
                                                    id={`ability-${ability.value}`}
                                                    checked={createForm.data.abilities.includes(
                                                        ability.value,
                                                    )}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        handleAbilityChange(
                                                            ability.value,
                                                            checked as boolean,
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`ability-${ability.value}`}
                                                    className="text-sm font-normal"
                                                >
                                                    {ability.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="expires_at"
                                        className="text-right"
                                    >
                                        Expires At
                                    </Label>
                                    <Input
                                        id="expires_at"
                                        type="datetime-local"
                                        value={createForm.data.expires_at}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'expires_at',
                                                e.target.value,
                                            )
                                        }
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    onClick={handleCreateToken}
                                    disabled={createForm.processing}
                                >
                                    Create Token
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Flash messages are handled globally by useFlashMessages + Sonner toaster. */}

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Abilities</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Last Used</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tokens.data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="py-8 text-center"
                                >
                                    <div className="text-muted-foreground">
                                        No API tokens found. Create your first
                                        token to get started.
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            tokens.data.map((token) => (
                                <TableRow key={token.id}>
                                    <TableCell className="font-medium">
                                        {token.name}
                                        {/* If this is the freshly-created token and showToken is available, show the plaintext inline */}
                                        {readTokenId === token.id &&
                                            showToken && (
                                                <div className="mt-2 text-sm">
                                                    <code className="rounded bg-gray-100 p-1 text-xs break-all">
                                                        {maskedTokens[
                                                            token.id
                                                        ] ?? showToken}
                                                    </code>
                                                </div>
                                            )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {token.abilities.map((ability) => (
                                                <Badge
                                                    key={ability}
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {ability}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(token.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(token.last_used_at)}
                                    </TableCell>
                                    <TableCell>
                                        {token.expires_at ? (
                                            <span
                                                className={
                                                    isExpired(token.expires_at)
                                                        ? 'text-red-600'
                                                        : ''
                                                }
                                            >
                                                {formatDate(token.expires_at)}
                                            </span>
                                        ) : (
                                            'Never'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {isExpired(token.expires_at) ? (
                                            <Badge variant="destructive">
                                                Expired
                                            </Badge>
                                        ) : (
                                            <Badge variant="default">
                                                Active
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Read/Copy button: enabled only for freshly-created token (showToken available) */}
                                            {readTokenId === token.id &&
                                            showToken ? (
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setIsReadModalOpen(
                                                            true,
                                                        );
                                                        setSelectedToken(token);
                                                    }}
                                                >
                                                    Read
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    disabled
                                                >
                                                    Read
                                                </Button>
                                            )}

                                            {/* Copy button removed — copying is available from the Read modal only */}

                                            <AlertDialog
                                                open={
                                                    isDeleteModalOpen &&
                                                    selectedToken?.id ===
                                                        token.id
                                                }
                                                onOpenChange={
                                                    setIsDeleteModalOpen
                                                }
                                            >
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDeleteToken(
                                                                token,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Delete API Token
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you
                                                            want to delete the
                                                            token "
                                                            {
                                                                selectedToken?.name
                                                            }
                                                            "? This action
                                                            cannot be undone and
                                                            will immediately
                                                            revoke access for
                                                            any applications
                                                            using this token.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>
                                                            Cancel
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={
                                                                confirmDelete
                                                            }
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Delete Token
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {tokens.last_page > 1 && (
                    <div className="flex justify-center">
                        <Pagination>
                            <PaginationContent>
                                {tokens.prev_page_url && (
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={tokens.prev_page_url}
                                        />
                                    </PaginationItem>
                                )}

                                {Array.from(
                                    { length: tokens.last_page },
                                    (_, i) => i + 1,
                                ).map((page) => {
                                    if (
                                        page === 1 ||
                                        page === tokens.last_page ||
                                        (page >= tokens.current_page - 1 &&
                                            page <= tokens.current_page + 1)
                                    ) {
                                        return (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href={`/admin/api-tokens?page=${page}`}
                                                    isActive={
                                                        page ===
                                                        tokens.current_page
                                                    }
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    } else if (
                                        page === tokens.current_page - 2 ||
                                        page === tokens.current_page + 2
                                    ) {
                                        return (
                                            <PaginationItem key={page}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }
                                    return null;
                                })}

                                {tokens.next_page_url && (
                                    <PaginationItem>
                                        <PaginationNext
                                            href={tokens.next_page_url}
                                        />
                                    </PaginationItem>
                                )}
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
                {/* Read Token Modal - only for freshly created token shown in flash */}
                <Dialog
                    open={isReadModalOpen}
                    onOpenChange={setIsReadModalOpen}
                >
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>API Token</DialogTitle>
                            <DialogDescription>
                                This is the plain-text token created. Copy it
                                now; it will not be shown again.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <code className="block rounded bg-gray-100 p-3 break-all">
                                {showToken ?? 'Not available'}
                            </code>
                            <div className="mt-3 flex items-center gap-2">
                                <Button
                                    onClick={() =>
                                        showToken && copyToClipboard(showToken)
                                    }
                                >
                                    {copiedToken === showToken
                                        ? 'Copied'
                                        : 'Copy'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsReadModalOpen(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
