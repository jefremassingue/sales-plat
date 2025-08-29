import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Head, router, usePage } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { BlogForm } from "./_components/BlogForm";
import { BlogFormValues, Blog } from "./_components/types";
import AppLayout from "@/layouts/app-layout";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "@inertiajs/react";
import { type BreadcrumbItem } from '@/types';

const formSchema = z.object({
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
    slug: z.string().min(3, "O slug deve ter pelo menos 3 caracteres"),
    content: z.string().min(10, "O conteúdo deve ter pelo menos 10 caracteres"),
    excerpt: z.string().min(10, "O resumo deve ter pelo menos 10 caracteres"),
    featured_image: z.union([
        z.string().nullable(),
        z.instanceof(File).nullable()
    ]),
    published_at: z.string().nullable(),
    blog_category_id: z.string().nullable(),
});

interface Props {
    blog: Blog;
    categories: any[];
}

export default function Edit({ blog, categories }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { errors } = usePage().props as any;

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
            href: `/admin/blog/${blog.id}/edit`,
        },
    ];

    const form = useForm<BlogFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: blog.title,
            slug: blog.slug,
            content: blog.content,
            excerpt: blog.excerpt,
            featured_image: blog.featured_image,
            published_at: blog.published_at,
            blog_category_id: blog.blog_category_id ? blog.blog_category_id.toString() : null,
        }
    });

    // Mapear erros do Laravel para os erros do formulário
    useEffect(() => {
        if (errors) {
            Object.keys(errors).forEach((key) => {
                form.setError(key as any, {
                    type: 'manual',
                    message: errors[key],
                });
            });
        }
    }, [errors, form]);

    const onSubmit = (values: BlogFormValues) => {
        setIsSubmitting(true);
        let payload: any = values;
        // Se houver arquivo, usar FormData
        if (values.featured_image && typeof values.featured_image !== 'string') {
            payload = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (key === 'featured_image' && value instanceof File) {
                    payload.append(key, value);
                } else if (value !== undefined && value !== null) {
                    payload.append(key, value as any);
                }
            });
        }
        router.post(`/admin/blog/${blog.id}?_method=PUT`, payload, {
            forceFormData: true,
            onSuccess: () => {
                setIsSubmitting(false);
                toast({
                    title: "Artigo atualizado",
                    description: "O artigo foi atualizado com sucesso.",
                    variant: "success",
                });
            },
            onError: () => {
                setIsSubmitting(false);
                toast({
                    title: "Erro",
                    description: "Verifique os erros no formulário.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Artigo - ${blog.title}`} />

            <div className="container px-4 py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/blog">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Editar Artigo</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informações do Artigo</CardTitle>
                        <CardDescription>
                            Edite as informações do artigo do blog
                        </CardDescription>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardContent>
                                <BlogForm form={form} isEditMode={true} categories={categories} />
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                >
                                    <Link href="/admin/blog">Cancelar</Link>
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </div>
        </AppLayout>
    );
}
