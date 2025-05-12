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
import { BlogCategory, BlogFormValues } from "./_components/types";
import AppLayout from "@/layouts/app-layout";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "@inertiajs/react";
import { type BreadcrumbItem } from '@/types';

const formSchema = z.object({
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
    slug: z.string().min(3, "O slug deve ter pelo menos 3 caracteres"),
    content: z.string().min(10, "O conteúdo deve ter pelo menos 10 caracteres"),
    excerpt: z.string().min(10, "O resumo deve ter pelo menos 10 caracteres"),
    featured_image: z.any().optional(),
    published_at: z.string().nullable(),
    blog_category_id: z.number().nullable(),
});

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
        title: 'Novo Artigo',
        href: '/admin/blog/create',
    },
];

export default function Create() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { errors, categories } = usePage().props as any;

    const form = useForm<BlogFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            slug: "",
            content: "",
            excerpt: "",
            featured_image: null,
            published_at: null,
            blog_category_id: null,
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

    const onSubmit = (values: any) => {
        setIsSubmitting(true);

        // Criar um FormData para enviar arquivos
        const formData = new FormData();

        // Adicionar todos os campos ao FormData
        Object.keys(values).forEach(key => {
            if (values[key] !== null && values[key] !== undefined) {
                if (key === 'featured_image' && values[key] instanceof File) {
                    formData.append(key, values[key]);
                    console.log('Adicionando imagem:', values[key].name);
                } else {
                    formData.append(key, values[key]);
                }
            }
        });

        // Verificar o conteúdo do FormData
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        router.post('/admin/blog', formData, {
            forceFormData: true,
            onSuccess: () => {
                setIsSubmitting(false);
                toast({
                    title: "Artigo criado",
                    description: "O artigo foi criado com sucesso.",
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
            <Head title="Novo Artigo" />

            <div className="container px-4 py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/blog">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <div className="container mx-auto py-6 px-4">
                    <h1 className="text-3xl font-bold mb-6">Criar Novo Artigo</h1>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informações do Artigo</CardTitle>
                                    <CardDescription>
                                        Preencha os detalhes do novo artigo para o blog.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <BlogForm form={form} isEditMode={false} categories={categories} />
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit("/admin/blog")}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                A criar...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="mr-2 h-4 w-4" />
                                                Guardar Artigo
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </Form>
                </div>
            </div>
        </AppLayout>
    );
}
