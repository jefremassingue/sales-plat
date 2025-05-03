// filepath: /Users/macair/projects/laravel/matony/resources/js/pages/Admin/Inventories/Index.tsx
import { DeleteAlert } from '@/components/delete-alert';
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
import { AlertCircle, Archive, Box, Calendar, Edit, Eye, Filter, GridIcon, ListIcon, MoreHorizontal, PackageCheck, Pencil, Plus, Trash, WarehouseIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Inventory, Product, Warehouse } from './_components/types';

interface Props {
    inventories: {
        data: Inventory[];
        links: any[];
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
    products: Product[];
    warehouses: Warehouse[];
    statuses: { value: string; label: string }[];
    filters?: {
        search?: string | null;
        product_id?: string | null;
        warehouse_id?: string | null;
        status?: string | null;
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
        title: 'Inventário',
        href: '/admin/inventories',
    },
];

export default function Index({ inventories, products, warehouses, statuses, filters = {} }: Props) {
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [viewTab, setViewTab] = useState<string>('table');
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [bulkDeleteAlertOpen, setBulkDeleteAlertOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [productFilter, setProductFilter] = useState(filters.product_id || '');
    const [warehouseFilter, setWarehouseFilter] = useState(filters.warehouse_id || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [sortField, setSortField] = useState(filters.sort_field || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');
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
        if (selectedItems.length === inventories.data.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(inventories.data.map((item) => item.id));
        }
    };

    const handleSelect = (id: number) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleDeleteClick = (id: number) => {
        setItemToDelete(id);
        setDeleteAlertOpen(true);
    };

    const handleBulkDeleteClick = () => {
        if (selectedItems.length === 0) return;
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
                product_id: productFilter,
                warehouse_id: warehouseFilter,
                status: statusFilter,
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
        product_id?: string | null;
        warehouse_id?: string | null;
        status?: string | null;
        sort_field?: string;
        sort_order?: string;
    }) => {
        router.get(
            '/admin/inventories',
            {
                search: filterParams.search || null,
                product_id: filterParams.product_id || null,
                warehouse_id: filterParams.warehouse_id || null,
                status: filterParams.status || null,
                sort_field: filterParams.sort_field || 'created_at',
                sort_order: filterParams.sort_order || 'desc',
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
            product_id: productFilter,
            warehouse_id: warehouseFilter,
            status: statusFilter,
            sort_field: field,
            sort_order: newOrder,
        });
    };

    // Função para obter a cor do badge com base no status
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'reserved':
                return 'warning';
            case 'damaged':
                return 'destructive';
            case 'expired':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    // Função para formatar valores monetários
    const formatCurrency = (value: number | null | undefined) => {
        if (value === null || value === undefined) return 'N/A';
        return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN' }).format(value);
    };

    // Função para renderizar cards de inventário
    const renderInventoryCard = (inventory: Inventory) => {
        return (
            <Card key={inventory.id} className="flex h-full flex-col">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            <div className="flex items-center space-x-2">
                                <Box size={16} className="shrink-0" />
                                <span>
                                    {inventory.product?.name}
                                    {inventory.productVariant && (
                                        <span className="ml-2 text-sm font-normal">({inventory.productVariant.name})</span>
                                    )}
                                </span>
                            </div>
                        </CardTitle>
                        <Badge variant={getStatusBadgeVariant(inventory.status)}>
                            {statuses.find((s) => s.value === inventory.status)?.label || inventory.status}
                        </Badge>
                    </div>
                    <div className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-1">
                            <PackageCheck className="h-4 w-4" />
                            <span>SKU: {inventory.product?.sku || inventory.productVariant?.sku || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <WarehouseIcon className="h-4 w-4" />
                            <span>Armazém: {inventory.warehouse?.name || 'N/A'}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow text-sm">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <div className="font-medium">Quantidade:</div>
                            <div>{inventory.quantity}</div>
                        </div>
                        <div>
                            <div className="font-medium">Mín/Máx:</div>
                            <div>{inventory.min_quantity}/{inventory.max_quantity || 'N/A'}</div>
                        </div>

                        {/* Preço unitário - ADICIONADO */}
                        <div className="col-span-2 mt-2 border-t pt-2">
                            <div className="font-medium">Preço Unitário:</div>
                            <div className="text-lg font-bold">{formatCurrency(inventory.unit_cost || inventory.product?.price)}</div>
                            {inventory.quantity > 0 && inventory.unit_cost && (
                                <div className="text-xs text-muted-foreground">
                                    Valor total: {formatCurrency(inventory.unit_cost * inventory.quantity)}
                                </div>
                            )}
                        </div>

                        {inventory.location && (
                            <div>
                                <div className="font-medium">Localização:</div>
                                <div>{inventory.location}</div>
                            </div>
                        )}
                        {inventory.batch_number && (
                            <div>
                                <div className="font-medium">Lote:</div>
                                <div>{inventory.batch_number}</div>
                            </div>
                        )}
                        {inventory.expiry_date && (
                            <div className="col-span-2">
                                <div className="font-medium flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Validade:</span>
                                </div>
                                <div>{new Date(inventory.expiry_date).toLocaleDateString('pt-PT')}</div>
                            </div>
                        )}
                    </div>
                </CardContent>
                <div className="mt-auto flex justify-end gap-2 border-t p-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/inventories/${inventory.id}`}>
                            <Eye className="mr-1 h-4 w-4" />
                            Ver
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/inventories/${inventory.id}/edit`}>
                            <Edit className="mr-1 h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(inventory.id)}
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
            <Head title="Gerir Inventário" />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Gerir Inventário</h1>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href="/admin/inventories/create">
                                <Plus className="mr-2 h-4 w-4" />
                                <span>Novo Registo</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Adicionar estatísticas de resumo */}
                <div className="grid gap-4 mb-6 grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base">Total em Stock</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-3xl font-bold">
                                {inventories.data.reduce((acc, item) => acc + item.quantity, 0)}
                            </div>
                            <p className="text-sm text-muted-foreground">Itens em inventário</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base">Valor Total</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-3xl font-bold">
                                {formatCurrency(
                                    inventories.data.reduce((acc, item) => {
                                        const cost = item.unit_cost || item.product?.price || 0;
                                        return acc + (cost * item.quantity);
                                    }, 0)
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">Valor em inventário</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base">Armazéns</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-3xl font-bold">
                                {warehouses.length}
                            </div>
                            <p className="text-sm text-muted-foreground">Total de armazéns</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base">Stock Baixo</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-3xl font-bold">
                                {inventories.data.filter(item => item.quantity < item.min_quantity && item.min_quantity > 0).length}
                            </div>
                            <p className="text-sm text-muted-foreground">Itens abaixo do mínimo</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Inventário</CardTitle>

                                <div className="flex items-center gap-2">
                                    {selectedItems.length > 0 && (
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
                                        placeholder="Pesquisar por produto, lote ou localização"
                                        value={searchQuery}
                                        onChange={(e) => debouncedSearch(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <Select
                                        value={productFilter}
                                        onValueChange={(value) => {
                                            setProductFilter(value);
                                            applyFilters({
                                                search: searchQuery,
                                                product_id: value,
                                                warehouse_id: warehouseFilter,
                                                status: statusFilter,
                                                sort_field: sortField,
                                                sort_order: sortOrder,
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filtrar por produto" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* <SelectItem value="">Todos os produtos</SelectItem> */}
                                            {products.map((product) => (
                                                <SelectItem key={product.id} value={product.id.toString()}>
                                                    {product.name} ({product.sku})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Select
                                        value={warehouseFilter}
                                        onValueChange={(value) => {
                                            setWarehouseFilter(value);
                                            applyFilters({
                                                search: searchQuery,
                                                product_id: productFilter,
                                                warehouse_id: value,
                                                status: statusFilter,
                                                sort_field: sortField,
                                                sort_order: sortOrder,
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filtrar por armazém" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* <SelectItem value="">Todos os armazéns</SelectItem> */}
                                            {warehouses.map((warehouse) => (
                                                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                    {warehouse.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Select
                                        value={statusFilter}
                                        onValueChange={(value) => {
                                            setStatusFilter(value);
                                            applyFilters({
                                                search: searchQuery,
                                                product_id: productFilter,
                                                warehouse_id: warehouseFilter,
                                                status: value,
                                                sort_field: sortField,
                                                sort_order: sortOrder,
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filtrar por estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* <SelectItem value="">Todos os estados</SelectItem> */}
                                            {statuses.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end md:col-span-2">
                                    <Button
                                        onClick={() =>
                                            applyFilters({
                                                search: searchQuery,
                                                product_id: productFilter,
                                                warehouse_id: warehouseFilter,
                                                status: statusFilter,
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
                                                        checked={inventories.data.length > 0 && selectedItems.length === inventories.data.length}
                                                        onCheckedChange={handleSelectAll}
                                                    />
                                                </TableHead>
                                                <TableHead className="cursor-pointer" onClick={() => toggleSort('product.name')}>
                                                    Produto {sortField === 'product.name' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                                                </TableHead>
                                                <TableHead className="cursor-pointer" onClick={() => toggleSort('warehouse.name')}>
                                                    Armazém {sortField === 'warehouse.name' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                                                </TableHead>
                                                <TableHead className="cursor-pointer text-right" onClick={() => toggleSort('quantity')}>
                                                    Quantidade {sortField === 'quantity' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                                                </TableHead>

                                                {/* Coluna de preço - ADICIONADA */}
                                                <TableHead className="cursor-pointer text-right" onClick={() => toggleSort('unit_cost')}>
                                                    Preço {sortField === 'unit_cost' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                                                </TableHead>

                                                <TableHead>Mín/Máx</TableHead>
                                                <TableHead>Localização</TableHead>
                                                <TableHead>Lote/Validade</TableHead>
                                                <TableHead className="cursor-pointer" onClick={() => toggleSort('status')}>
                                                    Estado {sortField === 'status' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                                                </TableHead>
                                                <TableHead className="w-[100px]">Acções</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {inventories.data.length > 0 ? (
                                                inventories.data.map((inventory) => (
                                                    <TableRow key={inventory.id}>
                                                        <TableCell className="w-[50px]">
                                                            <Checkbox
                                                                checked={selectedItems.includes(inventory.id)}
                                                                onCheckedChange={() => handleSelect(inventory.id)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">
                                                                {inventory.product?.name}
                                                                {inventory.productVariant && (
                                                                    <span className="text-muted-foreground block text-xs">
                                                                        {inventory.productVariant.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-muted-foreground text-xs">
                                                                SKU: {inventory.product?.sku || inventory.productVariant?.sku || 'N/A'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center">
                                                                <WarehouseIcon className="mr-1 h-4 w-4" />
                                                                <span>{inventory.warehouse?.name || 'N/A'}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            {inventory.quantity}
                                                            {inventory.quantity < inventory.min_quantity && (
                                                                <div className="text-destructive flex items-center justify-end mt-1 text-xs">
                                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                                    <span>Abaixo do mínimo</span>
                                                                </div>
                                                            )}
                                                        </TableCell>

                                                        {/* Célula de preço - ADICIONADA */}
                                                        <TableCell className="text-right">
                                                            <div className="font-medium">
                                                                {formatCurrency(inventory.unit_cost || inventory.product?.price)}
                                                            </div>
                                                            {inventory.quantity > 0 && inventory.unit_cost && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    Total: {formatCurrency(inventory.unit_cost * inventory.quantity)}
                                                                </div>
                                                            )}
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="text-xs">
                                                                Min: {inventory.min_quantity}
                                                            </div>
                                                            <div className="text-xs">
                                                                Max: {inventory.max_quantity || 'N/A'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {inventory.location ? (
                                                                <div className="text-xs">{inventory.location}</div>
                                                            ) : (
                                                                <span className="text-muted-foreground text-xs">Não definida</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {inventory.batch_number && (
                                                                <div className="text-xs">
                                                                    Lote: {inventory.batch_number}
                                                                </div>
                                                            )}
                                                            {inventory.expiry_date && (
                                                                <div className="text-xs flex items-center">
                                                                    <Calendar className="h-3 w-3 mr-1" />
                                                                    <span>Validade: {new Date(inventory.expiry_date).toLocaleDateString('pt-PT')}</span>
                                                                </div>
                                                            )}
                                                            {!inventory.batch_number && !inventory.expiry_date && (
                                                                <span className="text-muted-foreground text-xs">N/A</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={getStatusBadgeVariant(inventory.status)}>
                                                                {statuses.find((s) => s.value === inventory.status)?.label || inventory.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Button variant="ghost" size="icon" asChild>
                                                                    <Link href={`/admin/inventories/${inventory.id}`}>
                                                                        <Eye className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                                <Button variant="ghost" size="icon" asChild>
                                                                    <Link href={`/admin/inventories/${inventory.id}/edit`}>
                                                                        <Edit className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteClick(inventory.id)}
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
                                                    <TableCell colSpan={10} className="h-24 text-center">
                                                        Nenhum registo de inventário encontrado
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>

                                    {/* Paginação */}
                                    {inventories.last_page > 1 && (
                                        <div className="flex items-center justify-between px-2 py-4">
                                            <div className="text-muted-foreground text-sm">
                                                Mostrando {inventories.from} a {inventories.to} de {inventories.total} registos
                                            </div>
                                            <div className="flex gap-1">
                                                {inventories.current_page > 1 && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.get(`/admin/inventories?page=${inventories.current_page - 1}`)}
                                                    >
                                                        Anterior
                                                    </Button>
                                                )}

                                                {inventories.current_page < inventories.last_page && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.get(`/admin/inventories?page=${inventories.current_page + 1}`)}
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
                                        {inventories.data.length > 0 ? (
                                            inventories.data.map((inventory) => renderInventoryCard(inventory))
                                        ) : (
                                            <div className="col-span-full py-6 text-center">Nenhum registo de inventário encontrado</div>
                                        )}
                                    </div>

                                    {/* Paginação */}
                                    {inventories.last_page > 1 && (
                                        <div className="flex items-center justify-between px-2 py-4">
                                            <div className="text-muted-foreground text-sm">
                                                Mostrando {inventories.from} a {inventories.to} de {inventories.total} registos
                                            </div>
                                            <div className="flex gap-1">
                                                {inventories.current_page > 1 && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.get(`/admin/inventories?page=${inventories.current_page - 1}`)}
                                                    >
                                                        Anterior
                                                    </Button>
                                                )}

                                                {inventories.current_page < inventories.last_page && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.get(`/admin/inventories?page=${inventories.current_page + 1}`)}
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

                {/* Tabela de distribuição por armazém */}
                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribuição por Armazém</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-4 py-2 text-left">Armazém</th>
                                            <th className="px-4 py-2 text-right">Itens em Stock</th>
                                            <th className="px-4 py-2 text-right">Valor Total</th>
                                            <th className="px-4 py-2 text-right">% do Inventário</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {warehouses.map(warehouse => {
                                            const warehouseItems = inventories.data.filter(item =>
                                                item.warehouse_id === warehouse.id
                                            );

                                            const itemCount = warehouseItems.reduce((sum, item) =>
                                                sum + item.quantity, 0
                                            );

                                            const totalValue = warehouseItems.reduce((sum, item) => {
                                                const cost = item.unit_cost || item.product?.price || 0;
                                                return sum + (cost * item.quantity);
                                            }, 0);

                                            const totalInventory = inventories.data.reduce((sum, item) =>
                                                sum + item.quantity, 0
                                            );

                                            const percentage = totalInventory > 0
                                                ? (itemCount / totalInventory) * 100
                                                : 0;

                                            return (
                                                <tr key={warehouse.id} className="border-b">
                                                    <td className="px-4 py-2">
                                                        <Link
                                                            href={`/admin/warehouses/${warehouse.id}`}
                                                            className="hover:underline font-medium"
                                                        >
                                                            {warehouse.name}
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-2 text-right">{itemCount}</td>
                                                    <td className="px-4 py-2 text-right">
                                                        {formatCurrency(totalValue)}
                                                    </td>
                                                    <td className="px-4 py-2 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className="bg-primary h-full"
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                            <span>{percentage.toFixed(1)}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabela de produtos com maior valor */}
                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Produtos com Maior Valor em Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-4 py-2 text-left">Produto</th>
                                            <th className="px-4 py-2 text-right">Quantidade</th>
                                            <th className="px-4 py-2 text-right">Preço Unitário</th>
                                            <th className="px-4 py-2 text-right">Valor Total</th>
                                            <th className="px-4 py-2 text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...inventories.data]
                                            .filter(item => item.quantity > 0)
                                            .sort((a, b) => {
                                                const aValue = (a.unit_cost || a.product?.price || 0) * a.quantity;
                                                const bValue = (b.unit_cost || b.product?.price || 0) * b.quantity;
                                                return bValue - aValue;
                                            })
                                            .slice(0, 10)
                                            .map(item => {
                                                const unitCost = item.unit_cost || item.product?.price || 0;
                                                const totalValue = unitCost * item.quantity;

                                                return (
                                                    <tr key={item.id} className="border-b">
                                                        <td className="px-4 py-2">
                                                            <div className="font-medium">{item.product?.name}</div>
                                                            {item.productVariant && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    Variante: {item.productVariant.name}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                                                        <td className="px-4 py-2 text-right">{formatCurrency(unitCost)}</td>
                                                        <td className="px-4 py-2 text-right font-medium">{formatCurrency(totalValue)}</td>
                                                        <td className="px-4 py-2 text-center">
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={`/admin/inventories/${item.id}`}>
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    Ver
                                                                </Link>
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        }
                                        {inventories.data.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                                    Nenhum produto em stock
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Alerta de confirmação de exclusão */}
            {itemToDelete && (
                <DeleteAlert
                    isOpen={deleteAlertOpen}
                    onClose={() => {
                        setDeleteAlertOpen(false);
                        setItemToDelete(null);
                    }}
                    title="Eliminar Registo de Inventário"
                    description="Tem certeza que deseja eliminar este registo de inventário? Esta acção não pode ser desfeita."
                    deleteUrl={`/admin/inventories/${itemToDelete}`}
                />
            )}
        </AppLayout>
    );
}
