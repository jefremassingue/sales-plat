import { DeleteAlert } from '@/components/delete-alert';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Building, Edit, Eye, Filter, GridIcon, ListIcon, Plus, Trash, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type Supplier, type User } from './_components';

interface Props {
    suppliers: {
        data: Supplier[];
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
        supplier_type?: string | null;
        active?: string | null;
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
        title: 'Fornecedores',
        href: '/admin/suppliers',
    },
];

export default function Index({ suppliers, filters = {} }: Props) {
    const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
    const [viewTab, setViewTab] = useState<string>('table');
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);
    const [bulkDeleteAlertOpen, setBulkDeleteAlertOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [supplierTypeFilter, setSupplierTypeFilter] = useState(filters.supplier_type || '');
    const [activeFilter, setActiveFilter] = useState(filters.active || '');
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
        if (selectedSuppliers.length === suppliers.data.length) {
            setSelectedSuppliers([]);
        } else {
            setSelectedSuppliers(suppliers.data.map((supplier) => supplier.id));
        }
    };

    const handleSelect = (id: number) => {
        if (selectedSuppliers.includes(id)) {
            setSelectedSuppliers(selectedSuppliers.filter((supplierId) => supplierId !== id));
        } else {
            setSelectedSuppliers([...selectedSuppliers, id]);
        }
    };

    const handleDeleteClick = (id: number) => {
        setSupplierToDelete(id);
        setDeleteAlertOpen(true);
    };

    const handleBulkDeleteClick = () => {
        if (selectedSuppliers.length === 0) return;
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
                supplier_type: supplierTypeFilter,
                active: activeFilter,
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
        supplier_type?: string | null;
        active?: string | null;
        sort_field?: string;
        sort_order?: string;
    }) => {
        router.get(
            '/admin/suppliers',
            {
                search: filterParams.search || null,
                supplier_type: filterParams.supplier_type || null,
                active: filterParams.active || null,
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
            supplier_type: supplierTypeFilter,
            active: activeFilter,
            sort_field: field,
            sort_order: newOrder,
        });
    };

    // Função para renderizar cards de fornecedores
    const renderSupplierCard = (supplier: Supplier) => {
        return (
            <Card key={supplier.id} className="flex h-full flex-col">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            <div className="flex items-center space-x-2">
                                <Truck size={16} className="shrink-0" />
                                <span>
                                    {supplier.name}
                                    {supplier.company_name && <span className="ml-2 text-sm font-normal">({supplier.company_name})</span>}
                                </span>
                            </div>
                        </CardTitle>
                        <Badge variant={supplier.active ? 'success' : 'secondary'}>{supplier.active ? 'Activo' : 'Inactivo'}</Badge>
                    </div>
                    <div className="text-muted-foreground text-sm">
                        {supplier.email && <div>{supplier.email}</div>}
                        {supplier.phone && <div>Tel: {supplier.phone}</div>}
                        {supplier.mobile && <div>Telemóvel: {supplier.mobile}</div>}
                    </div>
                </CardHeader>
                <CardContent className="flex-grow text-sm">
                    {supplier.address && (
                        <div className="mb-2">
                            <div className="font-medium">Morada:</div>
                            <div>{supplier.address}</div>
                            <div>
                                {supplier.city}
                                {supplier.province ? `, ${supplier.province}` : ''}
                                {supplier.postal_code ? ` ${supplier.postal_code}` : ''}
                            </div>
                            <div>{supplier.country}</div>
                        </div>
                    )}

                    {supplier.payment_terms && (
                        <div className="mb-2">
                            <div className="font-medium">Termos de pagamento:</div>
                            <div>{supplier.payment_terms}</div>
                        </div>
                    )}

                    {supplier.user && (
                        <div className="bg-primary/10 mt-2 rounded-md p-2">
                            <div className="font-medium">Utilizador associado:</div>
                            <div>{supplier.user.name}</div>
                            <div>{supplier.user.email}</div>
                        </div>
                    )}
                </CardContent>
                <div className="mt-auto flex justify-end gap-2 border-t p-4 pt-0">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/suppliers/${supplier.id}`}>
                            <Eye className="mr-1 h-4 w-4" />
                            Ver
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/suppliers/${supplier.id}/edit`}>
                            <Edit className="mr-1 h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(supplier.id)}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash className="mr-1 h-4 w-4" />
                        Eliminar
                    </Button>
                </div>
            </Card>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerir Fornecedores" />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Gerir Fornecedores</h1>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href="/admin/suppliers/create">
                                <Plus className="mr-2 h-4 w-4" />
                                <span>Novo Fornecedor</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Fornecedores</CardTitle>

                                <div className="flex items-center gap-2">
                                    {selectedSuppliers.length > 0 && (
                                        <Button variant="destructive" size="sm" onClick={handleBulkDeleteClick}>
                                            <Trash className="mr-2 h-4 w-4" />
                                            Eliminar Selecionados
                                        </Button>
                                    )}
                                    <Tabs value={viewTab} onValueChange={setViewTab} className="w-auto">
                                        <TabsList>
                                            <TabsTrigger value="table">
                                                <ListIcon className="mr-1 h-4 w-4" />
                                                Tabela
                                            </TabsTrigger>
                                            <TabsTrigger value="cards">
                                                <GridIcon className="mr-1 h-4 w-4" />
                                                Cards
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                            </div>

                            {/* Área de filtros */}
                            <div className="mt-4 grid gap-4 md:grid-cols-4">
                                <div className="md:col-span-2">
                                    <Input
                                        placeholder="Pesquisar por nome, empresa, email ou telefone"
                                        value={searchQuery}
                                        onChange={(e) => debouncedSearch(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <Select
                                        value={supplierTypeFilter}
                                        onValueChange={(value) => {
                                            setSupplierTypeFilter(value);
                                            applyFilters({
                                                search: searchQuery,
                                                supplier_type: value,
                                                active: activeFilter,
                                                sort_field: sortField,
                                                sort_order: sortOrder,
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tipo de fornecedor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="products">Produtos</SelectItem>
                                            <SelectItem value="services">Serviços</SelectItem>
                                            <SelectItem value="both">Ambos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Select
                                        value={activeFilter}
                                        onValueChange={(value) => {
                                            setActiveFilter(value);
                                            applyFilters({
                                                search: searchQuery,
                                                supplier_type: supplierTypeFilter,
                                                active: value,
                                                sort_field: sortField,
                                                sort_order: sortOrder,
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Estado do fornecedor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Activos</SelectItem>
                                            <SelectItem value="false">Inactivos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end md:col-span-4">
                                    <Button
                                        onClick={() =>
                                            applyFilters({
                                                search: searchQuery,
                                                supplier_type: supplierTypeFilter,
                                                active: activeFilter,
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
                            <Tabs value={viewTab} className="w-full">
                                <TabsContent value="table" className="mt-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]">
                                                    <Checkbox
                                                        checked={suppliers.data.length > 0 && selectedSuppliers.length === suppliers.data.length}
                                                        onCheckedChange={handleSelectAll}
                                                    />
                                                </TableHead>
                                                <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                                                    Nome {sortField === 'name' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                                                </TableHead>
                                                <TableHead>Contacto</TableHead>
                                                <TableHead>Morada</TableHead>
                                                <TableHead>Termos de Pagamento</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Utilizador</TableHead>
                                                <TableHead className="w-[100px]">Acções</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {suppliers.data.length > 0 ? (
                                                suppliers.data.map((supplier) => (
                                                    <TableRow key={supplier.id}>
                                                        <TableCell className="w-[50px]">
                                                            <Checkbox
                                                                checked={selectedSuppliers.includes(supplier.id)}
                                                                onCheckedChange={() => handleSelect(supplier.id)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">
                                                                {supplier.name}
                                                                {supplier.company_name && (
                                                                    <span className="text-muted-foreground block text-xs">
                                                                        {supplier.company_name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {supplier.email && <div className="text-xs">{supplier.email}</div>}
                                                            {supplier.phone && <div className="text-xs">Tel: {supplier.phone}</div>}
                                                            {supplier.mobile && <div className="text-xs">Mob: {supplier.mobile}</div>}
                                                        </TableCell>
                                                        <TableCell>
                                                            {supplier.address ? (
                                                                <div className="text-xs">
                                                                    <div>{supplier.address}</div>
                                                                    <div>
                                                                        {supplier.city}
                                                                        {supplier.province ? `, ${supplier.province}` : ''}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground text-xs">Sem morada</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {supplier.payment_terms ? (
                                                                <div className="text-xs">{supplier.payment_terms}</div>
                                                            ) : (
                                                                <span className="text-muted-foreground text-xs">Não definido</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={supplier.active ? 'success' : 'secondary'}>
                                                                {supplier.active ? 'Activo' : 'Inactivo'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {supplier.user ? (
                                                                <div className="text-xs">
                                                                    <div className="font-medium">{supplier.user.name}</div>
                                                                    <div className="text-muted-foreground">{supplier.user.email}</div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground text-xs">Não associado</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Button variant="ghost" size="icon" asChild>
                                                                    <Link href={`/admin/suppliers/${supplier.id}`}>
                                                                        <Eye className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                                <Button variant="ghost" size="icon" asChild>
                                                                    <Link href={`/admin/suppliers/${supplier.id}/edit`}>
                                                                        <Edit className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteClick(supplier.id)}
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="py-6 text-center">
                                                        Nenhum fornecedor encontrado
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>

                                    {/* Paginação */}
                                    {suppliers.last_page > 1 && (
                                        <div className="flex items-center justify-between px-2 py-4">
                                            <div className="text-muted-foreground text-sm">
                                                Mostrando {suppliers.from} a {suppliers.to} de {suppliers.total} registos
                                            </div>
                                            <div className="flex gap-1">
                                                {suppliers.current_page > 1 && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.get(`/admin/suppliers?page=${suppliers.current_page - 1}`)}
                                                    >
                                                        Anterior
                                                    </Button>
                                                )}

                                                {suppliers.current_page < suppliers.last_page && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.get(`/admin/suppliers?page=${suppliers.current_page + 1}`)}
                                                    >
                                                        Próximo
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="cards" className="mt-0">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {suppliers.data.length > 0 ? (
                                            suppliers.data.map((supplier) => renderSupplierCard(supplier))
                                        ) : (
                                            <div className="col-span-full py-6 text-center">Nenhum fornecedor encontrado</div>
                                        )}
                                    </div>

                                    {/* Paginação */}
                                    {suppliers.last_page > 1 && (
                                        <div className="flex items-center justify-between px-2 py-4">
                                            <div className="text-muted-foreground text-sm">
                                                Mostrando {suppliers.from} a {suppliers.to} de {suppliers.total} registos
                                            </div>
                                            <div className="flex gap-1">
                                                {suppliers.current_page > 1 && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.get(`/admin/suppliers?page=${suppliers.current_page - 1}`)}
                                                    >
                                                        Anterior
                                                    </Button>
                                                )}

                                                {suppliers.current_page < suppliers.last_page && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.get(`/admin/suppliers?page=${suppliers.current_page + 1}`)}
                                                    >
                                                        Próximo
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Alerta de confirmação de exclusão */}
            {supplierToDelete && (
                <DeleteAlert
                    isOpen={deleteAlertOpen}
                    onClose={() => {
                        setDeleteAlertOpen(false);
                        setSupplierToDelete(null);
                    }}
                    title="Eliminar Fornecedor"
                    description="Tem certeza que deseja eliminar este fornecedor? Esta acção não pode ser desfeita."
                    deleteUrl={`/admin/suppliers/${supplierToDelete}`}
                />
            )}

            {/* Alerta de confirmação para exclusão em massa */}
            <AlertDialog open={bulkDeleteAlertOpen} onOpenChange={setBulkDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Fornecedores Selecionados</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja eliminar {selectedSuppliers.length} fornecedores? Esta acção não pode ser desfeita.
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
