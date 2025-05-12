import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DeleteAlert } from '@/components/delete-alert';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ChevronDown, ChevronRight, Edit, Eye, MoreHorizontal, Plus, Trash } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parent_id: number | null;
    active: boolean;
    order: number;
    children_recursive: Category[];
}

interface Props {
    categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Categorias',
        href: '/admin/blog-categories',
    },
    {
        title: 'Visualização em Árvore',
        href: '/admin/blog-categories/tree',
    },
];

export default function Tree({ categories }: Props) {
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
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

    const handleDeleteClick = (id: number) => {
        setCategoryToDelete(id);
        setDeleteAlertOpen(true);
    };

    const expandAll = () => {
        const allCategoryIds = collectAllCategoryIds(categories);
        setExpandedCategories(allCategoryIds);
    };

    const collapseAll = () => {
        setExpandedCategories([]);
    };

    // Função recursiva para coletar todos os IDs de categorias
    const collectAllCategoryIds = (categoryList: Category[]): number[] => {
        let ids: number[] = [];
        categoryList.forEach(category => {
            ids.push(category.id);
            if (category.children_recursive && category.children_recursive.length > 0) {
                ids = [...ids, ...collectAllCategoryIds(category.children_recursive)];
            }
        });
        return ids;
    };

    const renderCategoryTree = (categoryList: Category[], level = 0) => {
        return categoryList.map((category) => (
            <div key={category.id} className="category-item">
                <div
                    className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${level > 0 ? 'ml-6' : ''}`}
                    style={{ marginLeft: `${level * 16}px` }}
                >
                    <div className="flex-1 flex items-center">
                        {category.children_recursive && category.children_recursive.length > 0 ? (
                            <button
                                onClick={() => toggleExpand(category.id)}
                                className="mr-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
                                aria-label={isExpanded(category.id) ? "Colapsar categoria" : "Expandir categoria"}
                            >
                                {isExpanded(category.id) ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </button>
                        ) : (
                            <div className="w-6"></div>
                        )}

                        <span className="font-medium">{category.name}</span>

                        {category.children_recursive && category.children_recursive.length > 0 && (
                            <Badge variant="outline" className="ml-2">
                                {category.children_recursive.length}
                            </Badge>
                        )}

                        <Badge
                            variant={category.active ? "success" : "secondary"}
                            className="ml-2"
                        >
                            {category.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                    </div>

                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/blog-categories/${category.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        <span>Ver Detalhes</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/blog-categories/${category.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Editar</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/blog-categories/create?parent_id=${category.id}`}>
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
                    </div>
                </div>

                {isExpanded(category.id) && category.children_recursive && category.children_recursive.length > 0 && (
                    <div className="category-children">
                        {renderCategoryTree(category.children_recursive, level + 1)}
                    </div>
                )}
            </div>
        ));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Visualização em Árvore de Categorias" />

            <div className="container px-4 py-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/blog-categories">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Visualização em Árvore de Categorias</h1>
                </div>

                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Estrutura de Categorias</CardTitle>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={expandAll}>
                                        Expandir Todos
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={collapseAll}>
                                        Colapsar Todos
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {categories.length > 0 ? (
                                <div className="category-tree border rounded-lg p-2 max-h-[70vh] overflow-auto">
                                    {renderCategoryTree(categories)}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-500">
                                    <p>Nenhuma categoria encontrada</p>
                                </div>
                            )}
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
                    deleteUrl={`/admin/blog-categories/${categoryToDelete}`}
                />
            )}
        </AppLayout>
    );
}
