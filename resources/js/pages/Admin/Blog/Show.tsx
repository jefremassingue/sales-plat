import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Calendar, Tag } from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from '@/types';
import { useToast } from "@/components/ui/use-toast";
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
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featured_image: string | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    image: {
        id: number;
        url: string;
        versions: {
            id: number;
            url: string;
            version: string;
        }[];
    } | null;
    blog_category: {
        id: number;
        name: string;
    } | null;
}

interface Props {
    blog: BlogPost;
}

export default function Show({ blog }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Blog',
            href: '/admin/blog',
        },
        {
            title: blog.title,
            href: `/admin/blog/${blog.id}`,
        },
    ];

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/admin/blog/${blog.id}`, {
            onSuccess: () => {
                setIsDeleting(false);
                toast({
                    title: "Artigo eliminado",
                    description: "O artigo foi eliminado com sucesso.",
                    variant: "success",
                });
            },
            onError: () => {
                setIsDeleting(false);
                toast({
                    title: "Erro",
                    description: "Ocorreu um erro ao eliminar o artigo.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={blog.title} />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/admin/blog">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/admin/blog/${blog.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Isto irá eliminar permanentemente o artigo.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                                        {isDeleting ? 'A eliminar...' : 'Eliminar'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-2xl">{blog.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4">
                            {blog.published_at && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(blog.published_at), "dd 'de' MMMM 'de' yyyy", { locale: pt })}
                                </span>
                            )}
                            {blog.blog_category && (
                                <span className="flex items-center gap-1">
                                    <Tag className="h-4 w-4" />
                                    {blog.blog_category.name}
                                </span>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {blog.featured_image && (
                            <div className="mb-6">
                                <img
                                    // src={`/storage/${blog.featured_image}`}
                                    src={
                                        blog.image?.versions?.find((image) => image.version == 'md')?.url ||
                                        blog.image?.versions?.find((image) => image.version == 'lg')?.url ||
                                        blog.image?.url
                                    }
                                    alt={blog.title}
                                    className="w-full h-auto rounded-lg object-cover max-h-96"
                                />
                                {JSON.stringify(blog)}
                            </div>
                        )}
                        <div className="prose max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Informações adicionais</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium text-sm text-gray-500">Slug</h3>
                                <p>{blog.slug}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-gray-500">Criado em</h3>
                                <p>{format(new Date(blog.created_at), "dd/MM/yyyy HH:mm")}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-gray-500">Atualizado em</h3>
                                <p>{format(new Date(blog.updated_at), "dd/MM/yyyy HH:mm")}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-gray-500">Resumo</h3>
                                <p>{blog.excerpt}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
