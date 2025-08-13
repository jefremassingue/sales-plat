import { useState, useEffect } from 'react';
import { can } from '@/lib/utils';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DeleteAlert } from '@/components/delete-alert';
import { Eye, Edit, Trash, Plus, Filter, Key, Shield } from 'lucide-react';
import { Role, Permission } from './_components/types';

interface Props {
    roles: {
        data: Role[];
        links: any[];
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
    filters?: {
        search?: string | null;
        sort_field?: string;
        sort_order?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Funções',
        href: '/admin/roles',
    },
];

export default function Index({ roles, filters = {} }: Props) {
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
    const [bulkDeleteAlertOpen, setBulkDeleteAlertOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [sortField, setSortField] = useState(filters.sort_field || 'name');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    const { toast } = useToast();
    const { flash } = usePage().props as any;

    // Mostrar mensagens flash vindas do backend
    useEffect(() => {
        if (flash?.success) {
            toast({
                title: 'Operação bem sucedida',
                description: flash.success,
                variant: 'success',
            });
        }

        if (flash?.error) {
            toast({
                title: 'Erro',
                description: flash.error,
                variant: 'destructive',
            });
        }
    }, [flash, toast]);

    const handleSelectAll = () => {
        if (selectedRoles.length === roles.data.length) {
            setSelectedRoles([]);
        } else {
            setSelectedRoles(roles.data.map((role) => role.id));
        }
    };

    const handleSelect = (id: number) => {
        if (selectedRoles.includes(id)) {
            setSelectedRoles(selectedRoles.filter((roleId) => roleId !== id));
        } else {
            setSelectedRoles([...selectedRoles, id]);
        }
    };

    const handleDeleteClick = (id: number) => {
        setRoleToDelete(id);
        setDeleteAlertOpen(true);
    };

    const handleBulkDeleteClick = () => {
        if (selectedRoles.length === 0) return;
        setBulkDeleteAlertOpen(true);
    };

    const handleBulkDelete = () => {
        toast({
            title: 'Não implementado',
            description: 'A exclusão em massa ainda não foi implementada.',
            variant: 'default',
        });
        setBulkDeleteAlertOpen(false);
    };

    // Função de debounce para pesquisa
    const debouncedSearch = (value: string) => {
        // Limpa o timeout anterior se existir
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Define o valor da pesquisa imediatamente para atualizar a UI
        setSearchQuery(value);

        // Cria um novo timeout para enviar a pesquisa após 500ms
        const timeout = setTimeout(() => {
            applyFilters({
                search: value,
                sort_field: sortField,
                sort_order: sortOrder,
            });
        }, 500);

        setSearchTimeout(timeout);
    };

    // Limpar o timeout quando o componente for desmontado
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    // Aplicar filtros
    const applyFilters = (filterParams: {
        search?: string | null;
        sort_field?: string;
        sort_order?: string;
    }) => {
        router.get(
            '/admin/roles',
            {
                search: filterParams.search || null,
                sort_field: filterParams.sort_field || 'name',
                sort_order: filterParams.sort_order || 'asc',
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Alternar ordem de classificação
    const toggleSort = (field: string) => {
        const newOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(newOrder);
        applyFilters({
            search: searchQuery,
            sort_field: field,
            sort_order: newOrder,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerir Funções" />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Gerir Funções</h1>
                    <div className="flex gap-2">
                        {can('admin-role.create') && (
                            <Button asChild>
                                <Link href="/admin/roles/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    <span>Nova Função</span>
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Funções</CardTitle>

                                <div className="flex items-center gap-2">
                                    {selectedRoles.length > 0 && can('admin-role.destroy') && (
                                        <Button variant="destructive" size="sm" onClick={handleBulkDeleteClick}>
                                            <Trash className="mr-2 h-4 w-4" />
                                            Eliminar Selecionados
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Área de filtros */}
                            <div className="mt-4 grid gap-4 md:grid-cols-4">
                                <div className="md:col-span-3">
                                    <Input
                                        placeholder="Pesquisar por nome de função"
                                        value={searchQuery}
                                        onChange={(e) => debouncedSearch(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        onClick={() =>
                                            applyFilters({
                                                search: searchQuery,
                                                sort_field: sortField,
                                                sort_order: sortOrder,
                                            })
                                        }
                                        className="w-full md:w-auto"
                                    >
                                        <Filter className="mr-2 h-4 w-4" />
                                        Aplicar Filtros
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                                                checked={roles.data.length > 0 && selectedRoles.length === roles.data.length}
                                                onChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                                            Nome
                                            {sortField === 'name' && (
                                                <span className="ml-1">
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </TableHead>
                                        <TableHead>Guard</TableHead>
                                        <TableHead>Permissões</TableHead>
                                        <TableHead className="w-[100px]">Acções</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.data.length > 0 ? (
                                        roles.data.map((role) => (
                                            <TableRow key={role.id}>
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                                                        checked={selectedRoles.includes(role.id)}
                                                        onChange={() => handleSelect(role.id)}
                                                        disabled={role.name === 'Super Admin'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <Shield className="mr-2 h-4 w-4 text-primary" />
                                                        <span className="font-medium">{role.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{role.guard_name}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {role.permissions && role.permissions.length > 0 ? (
                                                            <div className="text-sm text-muted-foreground">
                                                                {role.permissions.length} permissões
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">
                                                                Nenhuma permissão
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end space-x-2">
                                                        {can('admin-role.show') && (
                                                            <Button variant="ghost" size="icon" asChild>
                                                                <Link href={`/admin/roles/${role.id}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        {can('admin-role.edit') && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                asChild
                                                                disabled={role.name === 'Super Admin'}
                                                            >
                                                                <Link href={`/admin/roles/${role.id}/edit`}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        {can('admin-role.destroy') && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteClick(role.id)}
                                                                disabled={role.name === 'Super Admin'}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                Nenhuma função encontrada
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Paginação */}
                            {roles.last_page > 1 && (
                                <div className="flex items-center justify-between px-2 py-4">
                                    <div className="text-muted-foreground text-sm">
                                        Mostrando {roles.from} a {roles.to} de {roles.total} registos
                                    </div>
                                    <div className="flex gap-1">
                                        {roles.current_page > 1 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get(`/admin/roles?page=${roles.current_page - 1}`)}
                                            >
                                                Anterior
                                            </Button>
                                        )}

                                        {roles.current_page < roles.last_page && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get(`/admin/roles?page=${roles.current_page + 1}`)}
                                            >
                                                Próxima
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Alerta de confirmação de exclusão */}
            {roleToDelete && (
                <DeleteAlert
                    isOpen={deleteAlertOpen}
                    onClose={() => {
                        setDeleteAlertOpen(false);
                        setRoleToDelete(null);
                    }}
                    title="Eliminar Função"
                    description="Tem certeza que deseja eliminar esta função? Esta acção não pode ser desfeita."
                    deleteUrl={`/admin/roles/${roleToDelete}`}
                />
            )}

            {/* Alerta de confirmação para exclusão em massa */}
            <AlertDialog open={bulkDeleteAlertOpen} onOpenChange={setBulkDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Funções Selecionadas</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja eliminar {selectedRoles.length} funções? Esta acção não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
