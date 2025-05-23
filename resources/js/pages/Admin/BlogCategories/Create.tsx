import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Função para formatar o slug
const formatSlug = (text: string): string => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplicados
        .trim();
};

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parent_id: number | null;
    active: boolean;
    order: number;
}

interface Props {
    categories: Category[];
}

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'O nome deve ter pelo menos 2 caracteres.',
    }),
    slug: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    parent_id: z.string().optional().nullable(),
    active: z.boolean().default(true),
    order: z.coerce.number().int().default(0),
});

export default function Create({ categories }: Props) {
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
            title: 'Nova Categoria',
            href: '/admin/blog-categories/create',
        },
    ];

    const { toast } = useToast();
    const { flash, errors } = usePage().props as any;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            slug: '',
            description: '',
            parent_id: 'root',
            active: true,
            order: 0,
        },
    });

    // Checar se há um parent_id na URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const parentId = urlParams.get('parent_id');

        if (parentId) {
            form.setValue('parent_id', parentId);
        }
    }, [form]);

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

    // Efeito para atualizar automaticamente o slug quando o nome mudar
    useEffect(() => {
        const nameValue = form.getValues('name');
        const slugValue = form.getValues('slug');

        if (nameValue && (!slugValue || slugValue === '')) {
            form.setValue('slug', formatSlug(nameValue));
        }
    }, [form.watch('name')]);

    // Função que gerencia a alteração manual do campo slug
    const handleSlugChange = (value: string) => {
        form.setValue('slug', formatSlug(value));
    };

    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            router.post(
                '/admin/blog-categories',
                {
                    ...values,
                    parent_id: values.parent_id && values.parent_id !== 'root' ? parseInt(values.parent_id) : null,
                },
                {
                    onSuccess: () => {
                        toast({
                            title: 'Categoria criada',
                            description: 'A categoria foi criada com sucesso.',
                            variant: 'success',
                        });
                    },
                    onError: () => {
                        toast({
                            title: 'Erro ao criar',
                            description: 'Verifique os erros no formulário.',
                            variant: 'destructive',
                        });
                    },
                },
            );
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Ocorreu um erro ao criar a categoria.',
                variant: 'destructive',
            });
            console.error('Erro ao criar categoria:', error);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nova Categoria" />

            <div className="container px-4 py-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/blog-categories">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Nova Categoria</h1>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Detalhes da Categoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nome</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nome da categoria" {...field} className="h-12 text-lg" />
                                                    </FormControl>
                                                    <FormDescription>O slug será gerado automaticamente a partir do nome.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="slug"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Slug (Opcional)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="slug-da-categoria"
                                                        {...field}
                                                        value={field.value || ''}
                                                        onChange={(e) => handleSlugChange(e.target.value)}
                                                        className="h-12 text-lg"
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    URL amigável da categoria. Se não for fornecido, será gerado automaticamente.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Descrição da categoria"
                                                    className="min-h-[120px]"
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid gap-6 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="parent_id"

                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Categoria Pai</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || 'root'}>
                                                    <FormControl>
                                                        <SelectTrigger className='h-12'>
                                                            <SelectValue placeholder="Selecione uma categoria pai (opcional)" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="root">Nenhuma (Categoria Raiz)</SelectItem>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>Define se for uma nova subcategoria.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="order"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ordem</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} className="h-12 text-lg" />
                                                </FormControl>
                                                <FormDescription>Define a ordem de exibição das categorias.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="active"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Estado Activo</FormLabel>
                                                <FormDescription>Determina se a categoria está activa ou não.</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href="/admin/blog-categories">Cancelar</Link>
                                    </Button>
                                    <Button type="submit">Criar Categoria</Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
