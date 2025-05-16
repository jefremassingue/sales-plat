// filepath: /Users/macair/projects/laravel/matony/resources/js/pages/Admin/Inventories/Adjustments/Edit.tsx
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
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AdjustmentType, Inventory, InventoryAdjustment, Supplier } from '../_components/types';

interface Props {
    inventory: Inventory;
    adjustment: InventoryAdjustment;
    suppliers: Supplier[];
    adjustmentTypes: AdjustmentType[];
}

// Schema de validação do formulário
// Nota: Não permitimos alterar o tipo e quantidade do ajuste por questões de integridade.
// Apenas metadados como referência, fornecedor, motivo e notas.
const formSchema = z.object({
    reference_number: z.string().optional(),
    supplier_id: z.string().optional(),
    reason: z.string().optional(),
    notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Edit({ inventory, adjustment, suppliers, adjustmentTypes }: Props) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { errors } = usePage().props as any;

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
            title: `Ajuste #${adjustment.id}`,
            href: `/admin/inventories/${inventory.id}/adjustments/${adjustment.id}`,
        },
        {
            title: 'Editar',
            href: `/admin/inventories/${inventory.id}/adjustments/${adjustment.id}/edit`,
        },
    ];

    // Obter o tipo de ajuste formatado
    const getAdjustmentType = (type: string) => {
        return adjustmentTypes.find(t => t.value === type)?.label || type;
    };

    // Função para obter a cor do badge com base no tipo de ajuste
    const getAdjustmentBadgeVariant = (type: string) => {
        switch (type) {
            case 'addition':
            case 'initial':
                return 'success';
            case 'subtraction':
            case 'transfer':
                return 'warning';
            case 'correction':
                return 'secondary';
            case 'loss':
            case 'damaged':
            case 'expired':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    // Inicializar o formulário com valores do ajuste existente
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reference_number: adjustment.reference_number || '',
            supplier_id: adjustment.supplier_id ? String(adjustment.supplier_id) : '',
            reason: adjustment.reason || '',
            notes: adjustment.notes || '',
        },
    });

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

        router.put(`/admin/inventories/${inventory.id}/adjustments/${adjustment.id}`, values, {
            onSuccess: () => {
                setIsSubmitting(false);
                toast({
                    title: "Ajuste atualizado",
                    description: "As informações do ajuste foram atualizadas com sucesso.",
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
            <Head title={`Editar Ajuste de Inventário #${adjustment.id}`} />

            <div className="container px-4 py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/inventories/${inventory.id}/adjustments/${adjustment.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Editar Ajuste de Inventário</h1>
                </div>

                {/* Detalhes do ajuste */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Detalhes do Ajuste</CardTitle>
                        <CardDescription>
                            Não é possível alterar o tipo ou quantidade de um ajuste já registado.
                        </CardDescription>
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
                                <h3 className="font-medium">Tipo de Ajuste</h3>
                                <div className="mt-1">
                                    <Badge variant={getAdjustmentBadgeVariant(adjustment.type)}>
                                        {getAdjustmentType(adjustment.type)}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium">Quantidade</h3>
                                <div className={`mt-1 font-bold ${adjustment.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {adjustment.quantity > 0 ? `+${adjustment.quantity}` : adjustment.quantity}
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
                                    Atualize as informações auxiliares deste ajuste de inventário
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
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
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        A processar...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Guardar Alterações
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
