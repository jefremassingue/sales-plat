import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parent_id: number | null;
    parent?: {
        id: number;
        name: string;
    };
    active: boolean;
    order: number;
    created_at: string;
    updated_at: string;
    children: Category[];
}

interface Props {
    category: Category;
}

export default function Show({ category }: Props) {
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

    // Verifica corretamente se existem subcategorias
    const hasChildren = Array.isArray(category.children) && category.children.length > 0;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Categorias',
            href: '/admin/categories',
        },
        {
            title: category.name,
            href: `/admin/categories/${category.id}`,
        },
    ];

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja eliminar esta categoria?')) {
            router.delete(`/admin/categories/${category.id}`);
        }
    };

    const toggleExpand = (categoryId: number) => {
        if (expandedCategories.includes(categoryId)) {
            setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
        } else {
            setExpandedCategories([...expandedCategories, categoryId]);
        }
    };

    const renderCategoryTree = (categories: Category[], depth = 0) => {
        return (
            <ul className={`pl-${depth > 0 ? 4 : 0}`}>
                {categories.map((cat) => {
                    const catHasChildren = Array.isArray(cat.children) && cat.children.length > 0;
                    return (
                        <li key={cat.id} className="py-2">
                            <div className="flex items-center">
                                {catHasChildren && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 p-0 mr-2"
                                        onClick={() => toggleExpand(cat.id)}
                                    >
                                        <ChevronDown
                                            className={`h-4 w-4 transition-transform ${
                                                expandedCategories.includes(cat.id) ? 'rotate-0' : '-rotate-90'
                                            }`}
                                        />
                                    </Button>
                                )}
                                {!catHasChildren && (
                                    <div className="w-6 mr-2" />
                                )}
                                <span className="font-medium">{cat.name}</span>
                                <Badge variant={cat.active ? "success" : "secondary"} className="ml-2">
                                    {cat.active ? 'Activo' : 'Inactivo'}
                                </Badge>
                            </div>
                            {catHasChildren && expandedCategories.includes(cat.id) && (
                                <div className="mt-2 border-l-2 border-gray-200 pl-4">
                                    {renderCategoryTree(cat.children, depth + 1)}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={category.name} />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/admin/categories">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">{category.name}</h1>
                        <Badge variant={category.active ? "success" : "secondary"}>
                            {category.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/admin/categories/${category.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash className="h-4 w-4 mr-2" />
                            Eliminar
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 mt-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalhes da Categoria</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Nome</h3>
                                <p>{category.name}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Slug</h3>
                                <p>{category.slug}</p>
                            </div>
                            {category.description && (
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Descrição</h3>
                                    <p>{category.description}</p>
                                </div>
                            )}
                            <div>
                                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Categoria Pai</h3>
                                <p>{category.parent ? category.parent.name : 'Nenhuma (Categoria Raiz)'}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Ordem</h3>
                                <p>{category.order}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Data de Criação</h3>
                                    <p>{format(new Date(category.created_at), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: pt })}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Última Actualização</h3>
                                    <p>{format(new Date(category.updated_at), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: pt })}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Subcategorias</CardTitle>
                            <CardDescription>
                                Categorias filhas de {category.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {hasChildren ? (
                                renderCategoryTree(category.children)
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">Esta categoria não possui subcategorias.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
