// filepath: /Users/macair/projects/laravel/matony/resources/js/pages/Admin/Inventories/Create.tsx
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ArrowLeft, CalendarIcon, Check, Loader2, PackageCheck, WarehouseIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Product, ProductVariant, Warehouse } from './_components/types';

interface Props {
    products: Product[];
    warehouses: Warehouse[];
    statuses: { value: string; label: string }[];
}

// Schema de validação do formulário
const formSchema = z.object({
    product_id: z.string().min(1, {
        message: "Por favor, selecione um produto",
    }),
    product_variant_id: z.string().optional(),
    warehouse_id: z.string().min(1, {
        message: "Por favor, selecione um armazém",
    }),
    quantity: z.string()
        .min(1, { message: "Quantidade é obrigatória" })
        .refine(val => !isNaN(Number(val)), { message: "Deve ser um número válido" })
        .refine(val => Number(val) >= 0, { message: "Não pode ser negativo" }),
    min_quantity: z.string()
        .refine(val => val === '' || !isNaN(Number(val)), { message: "Deve ser um número válido" })
        .refine(val => val === '' || Number(val) >= 0, { message: "Não pode ser negativo" })
        .optional()
        .transform(val => val ? val : '0'),
    max_quantity: z.string()
        .refine(val => val === '' || !isNaN(Number(val)), { message: "Deve ser um número válido" })
        .refine(val => val === '' || Number(val) >= 0, { message: "Não pode ser negativo" })
        .optional(),
    location: z.string().optional(),
    batch_number: z.string().optional(),
    expiry_date: z.date().optional().nullable(),
    unit_cost: z.string()
        .refine(val => val === '' || !isNaN(Number(val)), { message: "Deve ser um número válido" })
        .refine(val => val === '' || Number(val) >= 0, { message: "Não pode ser negativo" })
        .optional(),
    status: z.enum(['active', 'reserved', 'damaged', 'expired'], {
        required_error: "Por favor, selecione um estado",
    }),
    notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Inventário',
        href: '/admin/inventories',
    },
    {
        title: 'Novo Registo',
        href: '/admin/inventories/create',
    },
];

export default function Create({ products, warehouses, statuses }: Props) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
    const { errors } = usePage().props as any;
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

    // Inicializar o formulário com valores padrão
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            product_id: '',
            product_variant_id: '',
            warehouse_id: '',
            quantity: '0',
            min_quantity: '0',
            max_quantity: '',
            location: '',
            batch_number: '',
            expiry_date: null,
            unit_cost: '',
            status: 'active',
            notes: '',
        },
    });

    const watchProductId = form.watch('product_id');
    const watchWarehouseId = form.watch('warehouse_id');

    // Carregar variantes quando o produto mudar
    useEffect(() => {
        if (watchProductId) {
            loadProductVariants(watchProductId);
        } else {
            setProductVariants([]);
            form.setValue('product_variant_id', '');
        }
    }, [watchProductId]);

    // Atualizar o armazém selecionado quando o ID mudar
    useEffect(() => {
        if (watchWarehouseId) {
            const warehouse = warehouses.find(w => w.id.toString() === watchWarehouseId);
            setSelectedWarehouse(warehouse || null);
        } else {
            setSelectedWarehouse(null);
        }
    }, [watchWarehouseId, warehouses]);

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

    // Função para carregar variantes do produto selecionado
    const loadProductVariants = async (productId: string) => {
        try {
            const response = await fetch(`/admin/api/products/${productId}/variants`);
            const data = await response.json();
            if (data.variants) {
                setProductVariants(data.variants);
            }
        } catch (error) {
            console.error('Erro ao carregar variantes:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar as variantes do produto",
                variant: "destructive",
            });
        }
    };

    // Função para submeter o formulário
    const onSubmit = (values: FormValues) => {
        setIsSubmitting(true);

        // Preparar os dados para submissão
        const submissionData = {
            ...values,
            product_id: parseInt(values.product_id),
            product_variant_id: values.product_variant_id ? parseInt(values.product_variant_id) : null,
            warehouse_id: parseInt(values.warehouse_id),
            quantity: parseInt(values.quantity),
            min_quantity: values.min_quantity ? parseInt(values.min_quantity) : 0,
            max_quantity: values.max_quantity ? parseInt(values.max_quantity) : null,
            unit_cost: values.unit_cost ? parseFloat(values.unit_cost) : null,
            expiry_date: values.expiry_date ? format(values.expiry_date, 'yyyy-MM-dd') : null,
        };

        // Criar novo registo de inventário
        router.post('/admin/inventories', submissionData, {
            onSuccess: () => {
                setIsSubmitting(false);
                toast({
                    title: "Registo criado",
                    description: "O registo de inventário foi criado com sucesso.",
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
            <Head title="Novo Registo de Inventário" />

            <div className="container px-4 py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/inventories">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Novo Registo de Inventário</h1>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Informações do Armazém - Agora como primeira opção */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center">
                                        <WarehouseIcon className="h-5 w-5 mr-2 text-primary" />
                                        Informações do Armazém
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="warehouse_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Armazém <span className="text-destructive">*</span></FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione um armazém" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {warehouses.map(warehouse => (
                                                            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                                {warehouse.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Armazém onde o produto será registado
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Localização no Armazém</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder={
                                                            selectedWarehouse
                                                                ? `Ex: Corredor A, Prateleira 3, ${selectedWarehouse.name}`
                                                                : "Ex: Corredor A, Prateleira 3"
                                                        }
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Localização específica dentro do armazém
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Estado <span className="text-destructive">*</span></FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione um estado" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {statuses.map(status => (
                                                            <SelectItem key={status.value} value={status.value}>
                                                                {status.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Informações do Produto */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center">
                                        <PackageCheck className="h-5 w-5 mr-2 text-primary" />
                                        Informações do Produto
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="product_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Produto <span className="text-destructive">*</span></FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione um produto" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {products.map(product => (
                                                            <SelectItem key={product.id} value={product.id.toString()}>
                                                                {product.name} ({product.sku})
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
                                        name="product_variant_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Variante do Produto</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    disabled={productVariants.length === 0}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={productVariants.length === 0
                                                                ? "Nenhuma variante disponível"
                                                                : "Selecione uma variante"}
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="">Nenhuma (produto principal)</SelectItem>
                                                        {productVariants.map(variant => (
                                                            <SelectItem key={variant.id} value={variant.id.toString()}>
                                                                {variant.name} ({variant.sku || "Sem SKU"})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Selecione uma variante específica, se aplicável
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="batch_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Número do Lote</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Identificação do lote do produto
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                </CardContent>
                            </Card>

                            {/* Informações de Stock */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Informações de Stock</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quantidade <span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="min_quantity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Quantidade Mínima</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="0" {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Alerta quando abaixo deste valor
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="max_quantity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Quantidade Máxima</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="0" {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Capacidade máxima para este produto
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="unit_cost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Custo Unitário (MZN)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" step="0.01" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Custo de aquisição por unidade
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Validade e Notas */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Validade e Notas</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="expiry_date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Data de Validade</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "dd/MM/yyyy")
                                                                ) : (
                                                                    <span>Selecione uma data</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value || undefined}
                                                            onSelect={field.onChange}
                                                            disabled={(date) =>
                                                                date < new Date(new Date().setHours(0, 0, 0, 0))
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormDescription>
                                                    Data de validade do produto (se aplicável)
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Notas</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Observações adicionais sobre este item do inventário"
                                                        className="min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="sticky bottom-0 p-4 border-t bg-white shadow-lg flex justify-end items-center mt-8 z-10">
                            <Button type="submit" disabled={isSubmitting} className="ml-auto">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        A criar...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Criar Registo
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
