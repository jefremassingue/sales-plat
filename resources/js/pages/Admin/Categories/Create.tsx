import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
        title: 'Nova Categoria',
        href: '/admin/categories/create',
    },
];

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'O nome deve ter pelo menos 2 caracteres.',
    }),
    description: z.string().optional().nullable(),
    parent_id: z.string().optional().nullable(),
    active: z.boolean().default(true),
    order: z.coerce.number().int().default(0),
});

export default function Create({ categories }: Props) {
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

    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            router.post('/admin/categories', {
                ...values,
                parent_id: values.parent_id && values.parent_id !== 'root' ? parseInt(values.parent_id) : null,
            });
        } catch (error) {
            console.error('Erro ao criar categoria:', error);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nova Categoria" />

            <div className="container px-4 py-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/categories">
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
                                                    className="text-lg py-6"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                O slug será gerado automaticamente a partir do nome.
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
                                                        <SelectTrigger>
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
                                                        className="text-lg py-6"
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
                                        <Link href="/admin/categories">Cancelar</Link>
                                    </Button>
                                    <Button type="submit">Guardar Categoria</Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
