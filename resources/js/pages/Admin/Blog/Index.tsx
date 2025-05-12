import { DeleteAlert } from '@/components/delete-alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Edit, Eye, FileText, Plus, Search, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Blog, BlogCategory } from './_components/types';

interface Props {
    blogs: {
        data: Blog[];
        links: any;
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
    categories: BlogCategory[];
    filters: {
        search: string;
        category_id: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Blog',
        href: '/admin/blog',
    },
];

export default function Index({ blogs, categories, filters }: Props) {
    const { toast } = useToast();
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);

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

    // Função para aplicar filtros
    const applyFilters = () => {
        router.get('/admin/blog', {
            search,
            category_id: categoryId,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Função para limpar filtros
    const clearFilters = () => {
        setSearch('');
        setCategoryId('');
        router.get('/admin/blog', {}, {
            preserveState: true,
            replace: true,
        });
    };

    // Função para confirmar exclusão
    const confirmDelete = (blog: Blog) => {
        setBlogToDelete(blog);
        setDeleteAlertOpen(true);
    };

    // Função para excluir blog
    const deleteBlog = () => {
        if (blogToDelete) {
            router.delete(`/admin/blog/${blogToDelete.id}`, {
                onSuccess: () => {
                    toast({
                        title: 'Artigo excluído',
                        description: 'O artigo foi excluído com sucesso.',
                        variant: 'success',
                    });
                },
                onError: () => {
                    toast({
                        title: 'Erro',
                        description: 'Não foi possível excluir o artigo.',
                        variant: 'destructive',
                    });
                },
            });
        }
        setDeleteAlertOpen(false);
    };

    // Função para formatar a data
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Não publicado';
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: pt });
    };

    // Função para obter o nome da categoria
    const getCategoryName = (categoryId: number | null) => {
        if (!categoryId) return 'Sem categoria';
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Categoria não encontrada';
    };

    // Função para obter o status do artigo
    const getBlogStatus = (publishedAt: string | null) => {
        if (!publishedAt) return { label: 'Rascunho', variant: 'secondary' as const };
        const publishDate = new Date(publishedAt);
        const now = new Date();

        if (publishDate > now) {
            return { label: 'Agendado', variant: 'warning' as const };
        }
        return { label: 'Publicado', variant: 'success' as const };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Blog" />

            <div className="container px-4 py-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-2xl font-bold">Blog</h1>
                    <Button asChild>
                        <Link href="/admin/blog/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Artigo
                        </Link>
                    </Button>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                        <CardDescription>Filtre os artigos por título ou categoria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por título..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1"
                                />
                            </div>
                            <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas as categorias" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* <SelectItem value="">Todas as categorias</SelectItem> */}
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                                <Button onClick={applyFilters} className="flex-1">Aplicar Filtros</Button>
                                <Button variant="outline" onClick={clearFilters}>Limpar</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Artigos</CardTitle>
                        <CardDescription>
                            Gerenciar artigos do blog ({blogs.total} artigos encontrados)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {blogs.data.length === 0 ? (
                            <div className="text-center py-10">
                                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-medium">Nenhum artigo encontrado</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Não foram encontrados artigos com os filtros aplicados.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href="/admin/blog/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Criar Novo Artigo
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Título</TableHead>
                                            <TableHead>Categoria</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Data de Publicação</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {blogs.data.map((blog) => {
                                            const status = getBlogStatus(blog.published_at);
                                            return (
                                                <TableRow key={blog.id}>
                                                    <TableCell className="font-medium">{blog.title}</TableCell>
                                                    <TableCell>{getCategoryName(blog.blog_category_id)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={status.variant}>{status.label}</Badge>
                                                    </TableCell>
                                                    <TableCell>{formatDate(blog.published_at)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="outline" size="icon" asChild>
                                                                <Link href={`/admin/blog/${blog.slug}`} target="_blank">
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button variant="outline" size="icon" asChild>
                                                                <Link href={`/admin/blog/${blog.id}/edit`}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => confirmDelete(blog)}
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Paginação */}
                        {blogs.last_page > 1 && (
                            <div className="flex justify-center mt-6">
                                <div className="flex gap-1">
                                    {blogs.links.map((link: any, i: number) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            className="w-10"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <DeleteAlert
                open={deleteAlertOpen}
                onOpenChange={setDeleteAlertOpen}
                onConfirm={deleteBlog}
                title="Excluir Artigo"
                description="Tem certeza que deseja excluir este artigo? Esta ação não pode ser desfeita."
            />
        </AppLayout>
    );
}
