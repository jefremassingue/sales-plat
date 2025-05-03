// filepath: /Users/macair/projects/laravel/matony/resources/js/pages/Admin/Inventories/Adjustments/Create.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Check, Loader2, MinusCircle, PlusCircle, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AdjustmentType, Inventory, Supplier } from '../_components/types';

interface Props {
    inventory: Inventory;
    suppliers: { id: number; name: string }[];
    adjustmentTypes: AdjustmentType[];
}

// Schema de validação do formulário
const formSchema = z.object({
    quantity: z.string()
        .min(1, { message: "Quantidade é obrigatória" })
        .refine(val => !isNaN(Number(val)), { message: "Deve ser um número válido" })
        .refine(val => Number(val) > 0, { message: "Deve ser maior que zero" }),
    type: z.enum(['addition', 'subtraction', 'correction', 'transfer', 'loss', 'damaged', 'expired', 'initial'], {
        required_error: "Tipo de ajuste é obrigatório",
    }),
    reference_number: z.string().optional(),
    supplier_id: z.string().optional(),
    reason: z.string().optional(),
    notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Create({ inventory, suppliers, adjustmentTypes }: Props) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { errors } = usePage().props as any;
    const [selectedType, setSelectedType] = useState('addition');

    // Breadcrumbs dinâmicos
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
            title: `Registo #${inventory.id}`,
            href: `/admin/inventories/${inventory.id}`,
        },
        {
            title: 'Ajustes',
            href: `/admin/inventories/${inventory.id}/adjustments`,
        },
        {
            title: 'Novo Ajuste',
            href: `/admin/inventories/${inventory.id}/adjustments/create`,
        },
    ];

    // Inicializar o formulário com valores padrão
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quantity: '',
            type: 'addition',
            reference_number: '',
            supplier_id: '',
            reason: '',
            notes: '',
        },
    });

    // Observar as mudanças no tipo de ajuste
    const watchType = form.watch('type');
    useEffect(() => {
        setSelectedType(watchType);
    }, [watchType]);

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

    // Função para submeter o formulário
    const onSubmit = (values: FormValues) => {
        setIsSubmitting(true);

        // Preparar os dados para submissão
        const submissionData = {
            ...values,
            quantity: values.quantity, // O controller PHP vai converter para negativo se necessário
        };

        router.post(`/admin/inventories/${inventory.id}/adjustments`, submissionData, {
            onSuccess: () => {
                setIsSubmitting(false);
                toast({
                    title: "Ajuste criado",
                    description: "O ajuste de inventário foi registado com sucesso.",
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

    // Obter ícone e cor com base no tipo de ajuste
    const getAdjustmentTypeIcon = (type: string) => {
        switch (type) {
            case 'addition':
            case 'initial':
                return <PlusCircle className="h-5 w-5 text-emerald-500" />;
            case 'subtraction':
            case 'transfer':
            case 'loss':
            case 'damaged':
            case 'expired':
                return <MinusCircle className="h-5 w-5 text-red-500" />;
            case 'correction':
                return <RotateCcw className="h-5 w-5 text-amber-500" />;
            default:
                return null;
        }
    };

    // Verificar se o tipo de ajuste é de quantidade negativa
    const isNegativeAdjustment = (type: string) => {
        return ['subtraction', 'transfer', 'loss', 'damaged', 'expired'].includes(type);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Novo Ajuste de Inventário" />

            <div className="container px-4 py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/inventories/${inventory.id}/adjustments`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Novo Ajuste de Inventário</h1>
                </div>

                {/* Detalhes do Produto */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Detalhes do Inventário</CardTitle>
                            <Badge className="ml-2">Stock Atual: {inventory.quantity}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <h3 className="font-medium">Produto</h3>
                                <div className="mt-1">
                                    {inventory.product?.name}
                                    {inventory.productVariant && (
                                        <span className="text-muted-foreground text-sm block">
                                            Variante: {inventory.productVariant.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium">Armazém</h3>
                                <div className="mt-1">
                                    {inventory.warehouse?.name}
                                    {inventory.location && (
                                        <span className="text-muted-foreground text-sm block">
                                            Localização: {inventory.location}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium">Lote</h3>
                                <div className="mt-1">
                                    {inventory.batch_number || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações do Ajuste</CardTitle>
                                <CardDescription>
                                    Registe um ajuste de inventário para adicionar ou remover itens
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Tipo de Ajuste */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo de Ajuste <span className="text-destructive">*</span></FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        setSelectedType(value);
                                                    }}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione um tipo de ajuste" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {adjustmentTypes.map(type => (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                <div className="flex items-center gap-2">
                                                                    {getAdjustmentTypeIcon(type.value)}
                                                                    <span>{type.label}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {selectedType && (
                                                    <FormDescription>
                                                        {adjustmentTypes.find(t => t.value === selectedType)?.description}
                                                    </FormDescription>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Quantidade <span className="text-destructive">*</span>
                                                    {isNegativeAdjustment(selectedType) &&
                                                        <span className="text-sm text-muted-foreground ml-1">
                                                            (será subtraído do inventário)
                                                        </span>
                                                    }
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0.01" step="0.01" {...field} />
                                                </FormControl>
                                                {isNegativeAdjustment(selectedType) && inventory.quantity > 0 && (
                                                    <FormDescription>
                                                        Quantidade máxima disponível: {inventory.quantity}
                                                    </FormDescription>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator />

                                {/* Referência e Fornecedor */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="reference_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Referência</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ex: Fatura #12345, Nota de Encomenda #789"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Opcional: Número da fatura, nota de encomenda, etc.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="supplier_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fornecedor</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione um fornecedor (opcional)" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {/* <SelectItem value="">Nenhum</SelectItem> */}
                                                        {suppliers.map(supplier => (
                                                            <SelectItem
                                                                key={supplier.id}
                                                                value={supplier.id.toString()}
                                                            >
                                                                {supplier.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Opcional: Associar este ajuste a um fornecedor
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator />

                                {/* Motivo e Notas */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="reason"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Motivo</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Explique o motivo deste ajuste"
                                                        className="min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Opcional: Justificativa para este ajuste de inventário
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
                                                <FormLabel>Notas Adicionais</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Notas adicionais sobre este ajuste"
                                                        className="min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Opcional: Outros detalhes importantes
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="sticky bottom-0 p-4 border-t bg-white shadow-lg flex justify-end items-center mt-8">
                            <Button type="submit" disabled={isSubmitting} className="ml-auto">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        A processar...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Registar Ajuste
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
