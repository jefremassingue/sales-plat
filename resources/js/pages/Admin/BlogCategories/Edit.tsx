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

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parent_id: string | null;
    active: boolean;
    order: number;
}

interface Props {
    category: Category;
    categories: Category[];
}

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'O nome deve ter pelo menos 2 caracteres.',
    }),
    description: z.string().optional().nullable(),
    parent_id: z.string().optional().nullable(),
    active: z.boolean().default(true),
    order: z.coerce.number().int().default(0),
});

export default function Edit({ category, categories }: Props) {
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
            title: `Editar ${category.name}`,
            href: `/admin/blog-categories/${category.id}/edit`,
        },
    ];

    const { toast } = useToast();
    const { flash, errors } = usePage().props as any;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            parent_id: 'root',
            active: true,
            order: 0,
        },
    });

    // Preencher o formulário com os dados da categoria
    useEffect(() => {
        form.reset({
            name: category.name,
            description: category.description || '',
            parent_id: category.parent_id ? String(category.parent_id) : 'root',
            active: category.active,
            order: category.order,
        });
    }, [category, form]);

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
    }, [flash, toast]);

    // Mapear erros do Laravel para os erros do formulário
    useEffect(() => {
        if (errors) {
            Object.keys(errors).forEach(key => {
                form.setError(key as any, {
                    type: 'manual',
                    message: errors[key],
                });
            });
        }
    }, [errors, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            router.put(`/admin/blog-categories/${category.id}`, {
                ...values,
                parent_id: values.parent_id && values.parent_id !== 'root' ? values.parent_id : null,
            }, {
                onSuccess: () => {
                    toast({
                        title: "Categoria atualizada",
                        description: "A categoria foi atualizada com sucesso.",
                        variant: "success",
                    });
                },
                onError: (errors) => {
                    toast({
                        title: "Erro ao atualizar",
                        description: "Verifique os erros no formulário.",
                        variant: "destructive",
                    });
                }
            });
        } catch (error) {
            toast({
                title: "Erro",
                description: "Ocorreu um erro ao atualizar a categoria.",
                variant: "destructive",
            });
            console.error('Erro ao atualizar categoria:', error);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${category.name}`} />

            <div className="container py-6 px-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/blog-categories">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Editar Categoria: {category.name}</h1>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Detalhes da Categoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Nome da categoria"
                                                    {...field}
                                                    className="text-lg h-12"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                O slug atual é: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">{category.slug}</span>
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

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
                                                        {categories.map((cat) => (
                                                            <SelectItem
                                                                key={cat.id}
                                                                value={cat.id.toString()}
                                                                disabled={cat.id === category.id}
                                                            >
                                                                {cat.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Uma categoria não pode ser sua própria pai ou filha de suas subcategorias.
                                                </FormDescription>
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
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        className="text-lg h-12"
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Define a ordem de exibição das categorias.
                                                </FormDescription>
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
                                                <FormDescription>
                                                    Determina se a categoria está activa ou não.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href="/admin/blog-categories">Cancelar</Link>
                                    </Button>
                                    <Button type="submit">Guardar Alterações</Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
