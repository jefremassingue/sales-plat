import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeleteAlert } from '@/components/delete-alert';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight, GridIcon, ListIcon, MoreHorizontal, Plus, Trash, Edit, Eye, ListTree, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parent_id: number | null;
    active: boolean;
    order: number;
    created_at: string;
    updated_at: string;
    children?: Category[];
}

interface Props {
    categories: {
        data: Category[];
        links: any[];
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            path: string;
            per_page: number;
            to: number;
            total: number;
        };
    };
    allCategories: Category[];
    filters?: {
        search?: string | null;
        active?: string | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Categorias',
        href: '/admin/categories',
    },
];

export default function Index({ categories, allCategories, filters = {} }: Props) {
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [viewTab, setViewTab] = useState<string>("table");
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
    const [bulkDeleteAlertOpen, setBulkDeleteAlertOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeFilter, setActiveFilter] = useState(filters.active || '');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    const { toast } = useToast();
    const { flash } = usePage().props as any;

    // Mostrar mensagens flash vindas do backend
    useEffect(() => {
        if (flash?.success) {
            toast({
                title: "Operação bem sucedida",
                description: flash.success,
                variant: "success",
            });
        }

        if (flash?.error) {
            toast({
                title: "Erro",
                description: flash.error,
                variant: "destructive",
            });
        }
    }, [flash]);

    const handleSelectAll = () => {
        if (selectedCategories.length === allCategories.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(allCategories.map(category => category.id));
        }
    };

    const handleSelect = (id: number) => {
        if (selectedCategories.includes(id)) {
            setSelectedCategories(selectedCategories.filter(categoryId => categoryId !== id));
        } else {
            setSelectedCategories([...selectedCategories, id]);
        }
    };

    const handleDeleteClick = (id: number) => {
        setCategoryToDelete(id);
        setDeleteAlertOpen(true);
    };

    const handleBulkDeleteClick = () => {
        if (selectedCategories.length === 0) return;
        setBulkDeleteAlertOpen(true);
    };

    const handleBulkDelete = () => {
        // Implementar a lógica de exclusão em massa aqui
        toast({
            title: "Não implementado",
            description: "A exclusão em massa ainda não foi implementada.",
            variant: "default",
        });
        setBulkDeleteAlertOpen(false);
    };

    const toggleExpand = (categoryId: number) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const isExpanded = (categoryId: number) => {
        return expandedCategories.includes(categoryId);
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
            applyFilters(value, activeFilter);
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
    const applyFilters = (search = searchQuery, active = activeFilter) => {
        router.get(
            '/admin/categories',
            {
                search: search || null,
                active: active || null,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Função para renderizar a tabela de categorias (incluindo subcategorias aninhadas)
    const renderCategoryTable = (categoryList: Category[], level = 0) => {
        return categoryList.map((category) => (
            <>
                <TableRow key={`row-${category.id}`}>
                    <TableCell className="w-[50px]">
                        <Checkbox
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() => handleSelect(category.id)}
                        />
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center">
                            <div style={{ marginLeft: `${level * 24}px` }} className="flex items-center">
                                {category.children && category.children.length > 0 ? (
                                    <button
                                        onClick={() => toggleExpand(category.id)}
                                        className="mr-1 focus:outline-none"
                                    >
                                        {isExpanded(category.id) ? (
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-gray-500" />
                                        )}
                                    </button>
                                ) : (
                                    <span className="w-5 h-5 mr-1"></span>
                                )}
                                {category.name}
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>
                        <Badge variant={category.active ? "success" : "secondary"}>
                            {category.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                    </TableCell>
                    <TableCell className="w-[100px]">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Abrir Menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/categories/${category.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        <span>Ver Detalhes</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/categories/${category.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Editar</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/categories/create?parent_id=${category.id}`}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        <span>Adicionar Subcategoria</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleDeleteClick(category.id)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Eliminar</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
                {isExpanded(category.id) && category.children && category.children.length > 0 && (
                    renderCategoryTable(category.children, level + 1)
                )}
            </>
        ));
    };

    // Função para renderizar cards de categorias
    const renderCategoryCard = (category: Category) => {
        return (
            <Card key={category.id} className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>{category.name}</span>
                        <Badge variant={category.active ? "success" : "secondary"}>
                            {category.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                        {category.description || 'Sem descrição'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    {category.children && category.children.length > 0 && (
                        <div className="mt-2">
                            <h4 className="text-sm font-semibold mb-2">Subcategorias:</h4>
                            <div className="flex flex-wrap gap-1">
                                {category.children.map(child => (
                                    <Badge key={child.id} variant="outline" className="mr-1 mb-1">
                                        <Link href={`/admin/categories/${child.id}`} className="hover:underline">
                                            {child.name}
                                        </Link>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/categories/${category.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/categories/${category.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/categories/create?parent_id=${category.id}`}>
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(category.id)}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash className="h-4 w-4 mr-1" />
                        Eliminar
                    </Button>
                </CardFooter>
            </Card>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerir Categorias" />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Gerir Categorias</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/categories/tree">
                                <ListTree className="mr-2 h-4 w-4" />
                                <span>Ver em Árvore</span>
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/admin/categories/create">
                                <Plus className="mr-2 h-4 w-4" />
                                <span>Nova Categoria</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Categorias</CardTitle>

                                <div className="flex items-center gap-2">
                                    {selectedCategories.length > 0 && (
                                        <Button variant="destructive" size="sm" onClick={handleBulkDeleteClick}>
                                            <Trash className="mr-2 h-4 w-4" />
                                            Eliminar Selecionados
                                        </Button>
                                    )}
                                    <Tabs value={viewTab} onValueChange={setViewTab} className="w-auto">
                                        <TabsList>
                                            <TabsTrigger value="table">
                                                <ListIcon className="h-4 w-4 mr-1" />
                                                Tabela
                                            </TabsTrigger>
                                            <TabsTrigger value="cards">
                                                <GridIcon className="h-4 w-4 mr-1" />
                                                Cards
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                            </div>

                            {/* Área de filtros */}
                            <div className="mt-4 grid gap-4 md:grid-cols-3">
                                <div className="md:col-span-2">
                                    <Input
                                        placeholder="Pesquisar por nome, slug ou descrição"
                                        value={searchQuery}
                                        onChange={(e) => debouncedSearch(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <Select value={activeFilter} onValueChange={(value) => {
                                        setActiveFilter(value);
                                        applyFilters(searchQuery, value);
                                    }}>
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
                                <div className="flex justify-end md:col-span-3">
                                    <Button onClick={() => applyFilters()} className="w-full md:w-auto">
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
                                                        checked={categories.data.length > 0 && selectedCategories.length === allCategories.length}
                                                        onCheckedChange={handleSelectAll}
                                                    />
                                                </TableHead>
                                                <TableHead>Nome</TableHead>
                                                <TableHead>Slug</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead className="w-[100px]">Acções</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {categories.data.length > 0 ? (
                                                renderCategoryTable(categories.data)
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-6">
                                                        Nenhuma categoria encontrada
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TabsContent>

                                <TabsContent value="cards" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {categories.data.length > 0 ? (
                                            categories.data.map((category) => renderCategoryCard(category))
                                        ) : (
                                            <div className="col-span-full text-center py-6">
                                                Nenhuma categoria encontrada
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Alerta de confirmação de exclusão */}
            {categoryToDelete && (
                <DeleteAlert
                    isOpen={deleteAlertOpen}
                    onClose={() => {
                        setDeleteAlertOpen(false);
                        setCategoryToDelete(null);
                    }}
                    title="Eliminar Categoria"
                    description="Tem certeza que deseja eliminar esta categoria? Esta acção não pode ser desfeita."
                    deleteUrl={`/admin/categories/${categoryToDelete}`}
                />
            )}

            {/* Alerta de confirmação para exclusão em massa */}
            <AlertDialog open={bulkDeleteAlertOpen} onOpenChange={setBulkDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Categorias Selecionadas</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja eliminar {selectedCategories.length} categorias? Esta acção não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
