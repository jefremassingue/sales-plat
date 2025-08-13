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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, Edit, Eye, Filter, GridIcon, ListIcon, MoreHorizontal, PackageSearch, Plus, Store, Trash, WarehouseIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Image {
    id: number;
    url: string;
    name: string;
    versions?: Image[];
    version: string;
}

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    technical_details: string | null;
    price: number;
    stock: number;
    sku: string | null;
    barcode: string | null;
    category_id: number;
    active: boolean;
    featured: boolean;
    certification: string | null;
    warranty: string | null;
    brand: string | null;
    created_at: string;
    updated_at: string;
    main_image: Image | null;
    category: Category;
    total_stock?: number;
    inventories?: any[];
}

interface Props {
    products: {
        data: Product[];
        links: any[];
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
    categories: Category[];
    filters: {
        search: string | null;
        category_id: string | null;
        active: string | null;
        sort_field: string;
        sort_order: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Produtos',
        href: '/admin/products',
    },
];

export default function Index({ products, categories, filters }: Props) {
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [viewTab, setViewTab] = useState<string>('table');
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [bulkDeleteAlertOpen, setBulkDeleteAlertOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category_id || '');
    const [activeFilter, setActiveFilter] = useState(filters.active || '');
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
    }, [flash]);

    // Aplicar filtros quando forem alterados
    const applyFilters = () => {
        router.get(
            '/admin/products',
            {
                search: searchQuery || null,
                category_id: categoryFilter || null,
                active: activeFilter || null,
                sort_field: sortField,
                sort_order: sortOrder,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
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
            router.get(
                '/admin/products',
                {
                    search: value || null,
                    category_id: categoryFilter || null,
                    active: activeFilter || null,
                    sort_field: sortField,
                    sort_order: sortOrder,
                },
                {
                    preserveState: true,
                    replace: true,
                }
            );
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

    // Lida com a alteração na ordenação
    const handleSort = (field: string) => {
        const newSortOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(newSortOrder);

        router.get(
            '/admin/products',
            {
                ...filters,
                sort_field: field,
                sort_order: newSortOrder,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleSelectAll = () => {
        if (selectedProducts.length === products.data.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.data.map((product) => product.id));
        }
    };

    const handleSelect = (id: number) => {
        if (selectedProducts.includes(id)) {
            setSelectedProducts(selectedProducts.filter((productId) => productId !== id));
        } else {
            setSelectedProducts([...selectedProducts, id]);
        }
    };

    const handleDeleteClick = (id: number) => {
        setProductToDelete(id);
        setDeleteAlertOpen(true);
    };

    const handleBulkDeleteClick = () => {
        if (selectedProducts.length === 0) return;
        setBulkDeleteAlertOpen(true);
    };

    const handleBulkDelete = () => {
        // Esta funcionalidade precisaria ser implementada no backend
        toast({
            title: 'Não implementado',
            description: 'A exclusão em massa ainda não foi implementada.',
            variant: 'default',
        });
        setBulkDeleteAlertOpen(false);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN',
        }).format(value);
    };

    // Função para renderizar cartões de produtos
    const renderProductCard = (product: Product) => {
        return (
            <Card key={product.id} className="flex h-full flex-col">
                <CardHeader className="pb-3">
                    <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-md">
                        {product.main_image ? (
                            <img
                                src={
                                    product.main_image.versions?.find((image) => image.version == 'md')?.url ||
                                    product.main_image.versions?.find((image) => image.version == 'lg')?.url ||
                                    product.main_image.url
                                }
                                alt={product.name}
                                className="h-full w-full object-cover transition-all hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                                <PackageSearch className="h-10 w-10 text-gray-400" />
                            </div>
                        )}
                        {product.featured && (
                            <Badge variant="default" className="absolute top-2 right-2">
                                Destaque
                            </Badge>
                        )}
                    </div>
                    <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                    <div className="flex items-center justify-between">
                        <div className="text-lg font-bold">{formatCurrency(product.price)}</div>
                        <Badge variant={product.active ? 'success' : 'secondary'}>{product.active ? 'Activo' : 'Inactivo'}</Badge>
                    </div>
                    {/* <CardDescription className="line-clamp-2">{product.description || 'Sem descrição'}</CardDescription> */}
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Categoria:</span>
                            <p className="font-medium">{product.category?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Stock:</span>
                            <div className="font-medium flex items-center gap-1">
                                {product.total_stock !== undefined ? (
                                    <>
                                        {product.total_stock > 0 ? product.total_stock : <span className="text-red-500">Esgotado</span>}
                                        {product.inventories && product.inventories.length > 0 && (
                                            <Badge variant="outline" className="ml-1 text-xs">
                                                {product.inventories.length} armazém(ns)
                                            </Badge>
                                        )}
                                    </>
                                ) : (
                                    product.stock > 0 ? product.stock : <span className="text-red-500">Esgotado</span>
                                )}
                            </div>
                        </div>
                        {product.sku && (
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">SKU:</span>
                                <p className="font-medium">{product.sku}</p>
                            </div>
                        )}
                        {product.brand && (
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Marca:</span>
                                <p className="font-medium">{product.brand}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-2">
                    {can('admin-product.view') && (
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/products/${product.id}`}>
                                <Eye className="mr-1 h-4 w-4" />
                                Ver
                            </Link>
                        </Button>
                    )}
                    {can('admin-product.edit') && (
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/products/${product.id}/inventory`}>
                                <WarehouseIcon className="mr-1 h-4 w-4" />
                                Inventário
                            </Link>
                        </Button>
                    )}
                    {can('admin-product.edit') && (
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/products/${product.id}/edit`}>
                                <Edit className="mr-1 h-4 w-4" />
                                Editar
                            </Link>
                        </Button>
                    )}
                    {can('admin-product.destroy') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(product.id)}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash className="mr-1 h-4 w-4" />
                            Eliminar
                        </Button>
                    )}
                </CardFooter>
            </Card>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerir Produtos" />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Gerir Produtos</h1>
                    <div className="flex gap-2">
                        {can('admin-product.create') && (
                            <Button asChild>
                                <Link href="/admin/products/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    <span>Novo Produto</span>
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <CardTitle>Produtos</CardTitle>

                                <div className="flex items-center gap-2">
                                    {selectedProducts.length > 0 && can('admin-product.destroy') && (
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

                            <div className="mt-4 grid gap-4 md:grid-cols-4">
                                <div className="md:col-span-2">
                                    <Input
                                        placeholder="Pesquisar por nome, descrição ou SKU"
                                        value={searchQuery}
                                        onChange={(e) => debouncedSearch(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filtrar por categoria" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* <SelectItem value="">Todas as categorias</SelectItem> */}
                                            {categories?.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Select value={activeFilter} onValueChange={setActiveFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filtrar por estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* <SelectItem value="">Todos os estados</SelectItem> */}
                                            <SelectItem value="true">Activos</SelectItem>
                                            <SelectItem value="false">Inactivos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end md:col-span-4">
                                    <Button onClick={applyFilters} className="w-full md:w-auto">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Aplicar Filtros
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={viewTab} className="w-full">
                                <TabsContent value="table" className="mt-0">
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[50px]">
                                                        <Checkbox
                                                            checked={products.data.length > 0 && selectedProducts.length === products.data.length}
                                                            onCheckedChange={handleSelectAll}
                                                        />
                                                    </TableHead>
                                                    <TableHead className="w-[80px]">Imagem</TableHead>
                                                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                                                        Nome
                                                        {sortField === 'name' && (
                                                            <ChevronDown
                                                                className={`ml-1 inline-block h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                                                            />
                                                        )}
                                                    </TableHead>
                                                    <TableHead className="cursor-pointer" onClick={() => handleSort('price')}>
                                                        Preço
                                                        {sortField === 'price' && (
                                                            <ChevronDown
                                                                className={`ml-1 inline-block h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                                                            />
                                                        )}
                                                    </TableHead>
                                                    <TableHead>Categoria</TableHead>
                                                    <TableHead className="cursor-pointer" onClick={() => handleSort('stock')}>
                                                        Stock
                                                        {sortField === 'stock' && (
                                                            <ChevronDown
                                                                className={`ml-1 inline-block h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                                                            />
                                                        )}
                                                    </TableHead>
                                                    <TableHead>Estado</TableHead>
                                                    <TableHead className="text-right">Acções</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {products.data.length > 0 ? (
                                                    products.data.map((product) => (
                                                        <TableRow key={product.id}>
                                                            <TableCell>
                                                                <Checkbox
                                                                    checked={selectedProducts.includes(product.id)}
                                                                    onCheckedChange={() => handleSelect(product.id)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                                                                    {product.main_image ? (
                                                                        <img
                                                                            src={
                                                                                product.main_image.versions?.find((image) => image.version == 'sm')
                                                                                    ?.url ||
                                                                                product.main_image.versions?.find((image) => image.version == 'md')
                                                                                    ?.url ||
                                                                                product.main_image.versions?.find((image) => image.version == 'lg')
                                                                                    ?.url ||
                                                                                product.main_image.url
                                                                            }
                                                                            alt={product.name}
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <PackageSearch className="h-6 w-6 text-gray-400" />
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="line-clamp-1 font-medium">{product.name}</div>
                                                                {product.sku && <div className="text-xs text-gray-500">SKU: {product.sku}</div>}
                                                            </TableCell>
                                                            <TableCell>{formatCurrency(product.price)}</TableCell>
                                                            <TableCell>{product.category?.name || 'N/A'}</TableCell>
                                                            <TableCell>
                                                                {product.total_stock !== undefined ? (
                                                                    <div>
                                                                        {product.total_stock > 0 ? (
                                                                            <span>{product.total_stock}</span>
                                                                        ) : (
                                                                            <span className="text-red-500">Esgotado</span>
                                                                        )}
                                                                        {product.inventories && product.inventories.length > 0 && (
                                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                                                <WarehouseIcon className="h-3 w-3" />
                                                                                <span>{product.inventories.length} armazém(ns)</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    product.stock > 0 ? (
                                                                        <span>{product.stock}</span>
                                                                    ) : (
                                                                        <span className="text-red-500">Esgotado</span>
                                                                    )
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant={product.active ? 'success' : 'secondary'}>
                                                                    {product.active ? 'Activo' : 'Inactivo'}
                                                                </Badge>
                                                                {product.featured && (
                                                                    <Badge variant="default" className="ml-1">
                                                                        Destaque
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                            <span className="sr-only">Abrir Menu</span>
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        {can('admin-product.view') && (
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/admin/products/${product.id}`}>
                                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                                    <span>Ver Detalhes</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        {can('admin-product.edit') && (
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/admin/products/${product.id}/inventory`}>
                                                                                    <Store className="mr-2 h-4 w-4" />
                                                                                    <span>Gerir Inventário</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        {can('admin-product.edit') && (
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/admin/products/${product.id}/edit`}>
                                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                                    <span>Editar</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        {can('admin-product.destroy') && (
                                                                            <DropdownMenuItem
                                                                                onClick={() => handleDeleteClick(product.id)}
                                                                                className="text-destructive focus:text-destructive"
                                                                            >
                                                                                <Trash className="mr-2 h-4 w-4" />
                                                                                <span>Eliminar</span>
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={8} className="py-6 text-center">
                                                            Nenhum produto encontrado
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>

                                <TabsContent value="cards" className="mt-0">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2  xl:grid-cols-4">
                                        {products.data.length > 0 ? (
                                            products.data.map((product) => renderProductCard(product))
                                        ) : (
                                            <div className="col-span-full py-6 text-center">Nenhum produto encontrado</div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>

                            {/* Paginação */}
                            {products.last_page > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        A mostrar {products.from} a {products.to} de {products.total} produtos
                                    </div>
                                    <div className="flex gap-1">
                                        {Array.from({ length: products.last_page }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={page === products.current_page ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => {
                                                    router.get(
                                                        '/admin/products',
                                                        {
                                                            ...filters,
                                                            page,
                                                        },
                                                        {
                                                            preserveState: true,
                                                            replace: true,
                                                        },
                                                    );
                                                }}
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Alerta de confirmação de exclusão */}
            {productToDelete && (
                <DeleteAlert
                    isOpen={deleteAlertOpen}
                    onClose={() => {
                        setDeleteAlertOpen(false);
                        setProductToDelete(null);
                    }}
                    title="Eliminar Produto"
                    description="Tem certeza que deseja eliminar este produto? Esta acção não pode ser desfeita."
                    deleteUrl={`/admin/products/${productToDelete}`}
                />
            )}

            {/* Alerta de confirmação para exclusão em massa */}
            <AlertDialog open={bulkDeleteAlertOpen} onOpenChange={setBulkDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Produtos Selecionados</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja eliminar {selectedProducts.length} produtos? Esta acção não pode ser desfeita.
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
