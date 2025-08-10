import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

// Definindo os tipos que virão do backend (ajuste conforme necessário)
interface SaleItem {
    id: string;
    name: string;
    quantity: number;
    notes?: string;
    delivered_quantity: number;
    pending_quantity: number;
}

interface DeliveryGuideItem {
    id: string;
    sale_item_id: string;
    quantity: number;
    notes?: string;
}

interface DeliveryGuide {
    id: string;
    notes: string | null;
    items: DeliveryGuideItem[];
}

interface Sale {
    id: string;
    items: SaleItem[];
}

// Props do componente
interface DeliveryGuideDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sale: Sale;
    deliveryGuide?: DeliveryGuide | null; // Opcional, para modo de edição
}

// CORREÇÃO: Schema de validação com os tipos e campos corretos
const deliveryGuideSchema = z.object({
    notes: z.string().optional(),
    items: z
        .array(
            z.object({
                // CORREÇÃO 1: O ID do item da venda é uma string, não um número.
                sale_item_id: z.string(),
                quantity: z.coerce
                    .number({ invalid_type_error: 'Deve ser um número' })
                    .min(0, 'A quantidade não pode ser negativa')
                    .default(0),
                // CORREÇÃO 2: Adicionado o campo de notas do item, que estava faltando.
                notes: z.string().optional(),
            }),
        )
        .refine((items) => items.some((item) => item.quantity > 0), {
            message: 'Pelo menos um item deve ter uma quantidade maior que zero.',
        }),
});

type DeliveryGuideFormValues = z.infer<typeof deliveryGuideSchema>;

export default function DeliveryGuideDialog({ open, onOpenChange, sale, deliveryGuide }: DeliveryGuideDialogProps) {
    const { toast } = useToast();
    const isEditMode = !!deliveryGuide;

    const pendingItems = useMemo(() => {
        if (!sale?.items) return [];
        if (isEditMode) {
            return sale.items;
        }
        return sale.items.filter((item) => item.pending_quantity > 0);
    }, [sale, isEditMode]);

    const form = useForm<DeliveryGuideFormValues>({
        resolver: zodResolver(deliveryGuideSchema),
        defaultValues: {
            notes: '',
            items: [],
        },
    });

    // CORREÇÃO: `replace` não é mais necessário, então foi removido da desestruturação.
    const { fields } = useFieldArray({
        control: form.control,
        name: 'items',
    });

    // CORREÇÃO: Lógica de `useEffect` ajustada e simplificada.
    useEffect(() => {
        if (open) {
            const formItems = pendingItems.map((item) => {
                const existingItem = deliveryGuide?.items.find((dgItem) => dgItem.sale_item_id === item.id);
                return {
                    sale_item_id: item.id,
                    quantity: existingItem?.quantity || 0,
                    // CORREÇÃO 3: Popular as notas com os dados da guia (se existirem).
                    notes: existingItem?.notes || '',
                };
            });

            // CORREÇÃO 4: `form.reset` é suficiente para atualizar todo o formulário.
            form.reset({
                notes: deliveryGuide?.notes || '',
                items: formItems,
            });
        }
    }, [open, sale, deliveryGuide, pendingItems, form]); // `replace` removido das dependências

    const onSubmit = (values: DeliveryGuideFormValues) => {
        const itemsToSubmit = values.items.filter((item) => item.quantity > 0);

        if (itemsToSubmit.length === 0) {
            form.setError('items', { message: 'Adicione uma quantidade para pelo menos um item.' });
            return;
        }

        const data = {
            ...values,
            items: itemsToSubmit.map(item => ({
                ...item,
                notes: item.notes || null // Garante que notas vazias sejam enviadas como null se desejado
            })),
        };

        const url = isEditMode ? `/admin/sales/${sale.id}/delivery-guides/${deliveryGuide.id}` : `/admin/sales/${sale.id}/delivery-guides`;

        router.visit(url, {
            method: isEditMode ? 'put' : 'post',
            data,
            onSuccess: () => {
                toast({
                    title: `Guia de entrega ${isEditMode ? 'atualizada' : 'criada'}!`,
                    description: `A guia foi salva com sucesso.`,
                    variant: 'success',
                });
                onOpenChange(false);
            },
            onError: (errors) => {
                Object.entries(errors).forEach(([key, value]) => {
                    form.setError(key as any, { message: value });
                });
                toast({
                    title: 'Erro ao salvar a guia',
                    description: 'Verifique os erros no formulário.',
                    variant: 'destructive',
                });
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Editar Guia de Entrega' : 'Criar Nova Guia de Entrega'}</DialogTitle>
                    <DialogDescription>
                        Preencha as quantidades dos produtos a serem entregues.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="max-h-[400px] overflow-y-auto pr-2">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produto</TableHead>
                                        <TableHead className="w-32 text-center">Total</TableHead>
                                        <TableHead className="w-32 text-center">Pendente</TableHead>
                                        <TableHead className="w-40 text-right">Qtd. a Entregar</TableHead>
                                        <TableHead className="w-60">Nota</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => {
                                        const saleItem = pendingItems.find((i) => i.id === field.sale_item_id);
                                        if (!saleItem) return null;

                                        const pendingForInput = isEditMode
                                            ? saleItem.pending_quantity +
                                              (deliveryGuide?.items.find((i) => i.sale_item_id === saleItem.id)?.quantity || 0)
                                            : saleItem.pending_quantity;

                                        return (
                                            <TableRow key={field.id}>
                                                <TableCell className="font-medium">{saleItem.name}</TableCell>
                                                <TableCell className="text-center">{saleItem.quantity}</TableCell>
                                                <TableCell className="text-destructive text-center font-bold">{pendingForInput}</TableCell>
                                                <TableCell className="text-right">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.quantity`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        type="number"
                                                                        className="text-right"
                                                                        min={0}
                                                                        step="0.01"
                                                                        max={pendingForInput}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.notes`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    {/* O valor do campo será tratado como string vazia se for null */}
                                                                    <Input {...field} value={field.value ?? ''} type="text" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            {form.formState.errors.items && (
                                <p className="text-destructive mt-2 text-sm font-medium">{form.formState.errors.items.message}</p>
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas Adicionais</FormLabel>
                                    <FormControl>
                                        {/* O valor do campo será tratado como string vazia se for null */}
                                        <Textarea {...field} value={field.value ?? ''} placeholder="Observações sobre a entrega, motorista, etc." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Guia'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}