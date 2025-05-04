import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Product, TaxRate, Warehouse } from './types';

// Esquema de validação para o formulário de item
const itemFormSchema = z.object({
    product_id: z.string().optional(),
    product_variant_id: z.string().optional(),
    warehouse_id: z.string().optional(),
    name: z.string().min(1, { message: 'Nome é obrigatório' }),
    description: z.string().optional(),
    quantity: z
        .string()
        .min(1, { message: 'Quantidade é obrigatória' })
        .refine((val) => !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
        .refine((val) => parseFloat(val) > 0, { message: 'Deve ser maior que zero' }),
    unit: z.string().optional(),
    unit_price: z
        .string()
        .min(1, { message: 'Preço unitário é obrigatório' })
        .refine((val) => !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
        .refine((val) => parseFloat(val) >= 0, { message: 'Não pode ser negativo' }),
    discount_percentage: z
        .string()
        .optional()
        .refine((val) => val === '' || !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
        .refine((val) => val === '' || parseFloat(val) >= 0, { message: 'Não pode ser negativo' })
        .refine((val) => val === '' || parseFloat(val) <= 100, { message: 'Deve ser no máximo 100%' }),
    tax_percentage: z
        .string()
        .optional()
        .refine((val) => val === '' || !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
        .refine((val) => val === '' || parseFloat(val) >= 0, { message: 'Não pode ser negativo' }),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: ItemFormValues) => void;
    products: Product[];
    warehouses: Warehouse[];
    taxRates: TaxRate[];
    units: { value: string; label: string }[];
    initialValues?: Partial<ItemFormValues>;
    title?: string;
    isManualItemMode?: boolean;
}

export default function ItemForm({
    open,
    onOpenChange,
    onSubmit,
    products,
    warehouses = [],
    taxRates = [],
    initialValues,
    units = [],
    title = 'Adicionar Item',
    isManualItemMode = false,
}: ItemFormProps) {
    const { toast } = useToast();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [warehouseInventories, setWarehouseInventories] = useState<any[]>([]);
    const [isLoadingInventory, setIsLoadingInventory] = useState(false);

    // Inicializar o formulário com valores padrão
    const form = useForm<ItemFormValues>({
        resolver: zodResolver(itemFormSchema),
        defaultValues: {
            product_id: '',
            product_variant_id: '',
            warehouse_id: '',
            name: '',
            description: '',
            quantity: '1',
            unit: 'unit',
            unit_price: '0',
            discount_percentage: '0',
            tax_percentage: taxRates.find((tax) => tax.is_default == true)?.value + '' || '16', // Taxa padrão de IVA em Moçambique
        },
    });

    // Resetar o formulário quando o modal é aberto/fechado
    useEffect(() => {
        if (open) {
            if (initialValues) {
                // Se temos valores iniciais, usar estes valores
                const values = { ...initialValues };

                // Definir valores do formulário
                Object.keys(values).forEach((key) => {
                    const value = (values as any)[key];
                    if (value !== undefined) {
                        form.setValue(key as any, typeof value === 'number' ? value.toString() : value);
                    }
                });

                // Se tiver product_id, buscar o produto selecionado
                if (values.product_id && values.product_id !== 'none') {
                    const product = products.find((p) => p.id.toString() === values.product_id?.toString());
                    if (product) {
                        setSelectedProduct(product);
                    }
                } else {
                    setSelectedProduct(null);
                }
            } else if (isManualItemMode) {
                // Para item manual, limpar todos os campos
                form.reset({
                    product_id: '',
                    product_variant_id: '',
                    warehouse_id: '',
                    name: '',
                    description: '',
                    quantity: '1',
                    unit: 'unit',
                    unit_price: '0',
                    discount_percentage: '0',
                    tax_percentage: taxRates.find((tax) => tax.is_default == true)?.value + '' || '16', // Taxa padrão de IVA em Moçambique
                });
                setSelectedProduct(null);
            }
        } else {
            // Quando o modal fecha, limpar o produto selecionado
            setSelectedProduct(null);
        }
    }, [open, initialValues, products, form, isManualItemMode]);

    // Observar mudanças no warehouse_id
    const watchWarehouseId = form.watch('warehouse_id');
    const watchProductId = form.watch('product_id');

    // Quando o armazém muda
    useEffect(() => {
        if (selectedProduct && watchWarehouseId) {
            fetchProductInventoryPrice(selectedProduct.id.toString(), watchWarehouseId);
        }
    }, [watchWarehouseId, selectedProduct]);

    // Atualizar o nome do item quando o produto for selecionado
    useEffect(() => {
        if (watchProductId && watchProductId !== 'none') {
            const selectedProduct = products.find((p) => p.id.toString() === watchProductId);
            if (selectedProduct) {
                setSelectedProduct(selectedProduct);
                form.setValue('name', selectedProduct.name);
                form.setValue('unit_price', selectedProduct.price.toString());

                // Usar a unidade do produto se disponível, caso contrário usar 'unit'
                if (selectedProduct.unit && selectedProduct.unit.trim() !== '') {
                    form.setValue('unit', selectedProduct.unit);
                } else {
                    form.setValue('unit', 'unit');
                }

                // Se também tiver um armazém selecionado, buscar preço específico
                if (watchWarehouseId) {
                    fetchProductInventoryPrice(watchProductId, watchWarehouseId);
                }
            }
        } else if (watchProductId === 'none') {
            setSelectedProduct(null);
        }
    }, [watchProductId]);

    // Função para buscar o preço do produto em um armazém específico
    const fetchProductInventoryPrice = async (productId: string, warehouseId: string) => {
        try {
            setIsLoadingInventory(true);
            const response = await fetch(`/admin/api/product-inventory?product_id=${productId}&warehouse_id=${warehouseId}`);
            const data = await response.json();

            if (data.success && data.inventory) {
                // Usar o custo unitário do inventário se disponível, ou o preço padrão do produto
                const price = data.inventory.unit_cost || selectedProduct?.price || 0;
                form.setValue('unit_price', price.toString());
            }
        } catch (error) {
            console.error('Erro ao obter preço do inventário:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível obter o preço do produto no armazém selecionado.',
                variant: 'destructive',
            });
        } finally {
            setIsLoadingInventory(false);
        }
    };

    // Função para submeter o formulário
    const handleSubmit = (values: ItemFormValues) => {
        onSubmit(values);
        onOpenChange(false);
    };

    // Função para limpar o produto selecionado
    const clearSelectedProduct = () => {
        setSelectedProduct(null);
        form.setValue('product_id', '');
        form.setValue('name', '');
        form.setValue('unit_price', '0');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        {/* Mostrar informações do produto selecionado em vez de um select */}
                        {selectedProduct ? (
                            <div className="bg-muted relative rounded-lg p-4">
                                <div className="absolute top-2 right-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearSelectedProduct}
                                        className="h-6 w-6 rounded-full p-0"
                                    >
                                        ×
                                    </Button>
                                </div>
                                <h3 className="font-medium">Produto selecionado</h3>
                                <div className="mt-1 text-sm">
                                    <strong>{selectedProduct.name}</strong>
                                    <br />
                                    <span className="text-muted-foreground">
                                        SKU: {selectedProduct.sku} | Preço:{' '}
                                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN' }).format(selectedProduct.price)}
                                    </span>
                                </div>

                                {/* Campo oculto para armazenar o product_id */}
                                <FormField
                                    control={form.control}
                                    name="product_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <input type="hidden" {...field} value={selectedProduct.id.toString()} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ) : (
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Nome do Item <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="warehouse_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Armazém</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um armazém" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">Nenhum</SelectItem>
                                            {warehouses.map((warehouse) => (
                                                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                    {warehouse.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        {isLoadingInventory
                                            ? 'A carregar informações do inventário...'
                                            : 'Selecione o armazém para buscar o preço correto'}
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
                                        <Textarea {...field} placeholder="Descrição detalhada do item" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-3 items-start gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Quantidade <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0.01" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unidade</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value || 'unit'}
                                            disabled={selectedProduct !== null} // Desativar quando houver um produto selecionado
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione uma unidade" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {units.map((unit) => (
                                                    <SelectItem key={unit.value} value={unit.value}>
                                                        {unit.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedProduct && <FormDescription>A unidade é definida pelo produto selecionado</FormDescription>}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unit_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Preço Unitário <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                {...field}
                                                className={isLoadingInventory ? 'animate-pulse' : ''}
                                                readOnly={selectedProduct !== null}
                                            />
                                        </FormControl>
                                        {isLoadingInventory && <FormDescription>A carregar preço atualizado...</FormDescription>}
                                        {selectedProduct && <FormDescription>O preço é definido pelo produto selecionado</FormDescription>}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 items-start gap-4">
                            <FormField
                                control={form.control}
                                name="discount_percentage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Desconto (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" max="100" step="0.01" {...field} value={field.value || '0'} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tax_percentage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Imposto (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="0.01" {...field} value={field.value || '0'} />
                                        </FormControl>
                                        {taxRates.length > 0 && (
                                            <FormDescription>Taxas comuns: {taxRates.map((tax) => `${tax.label}`).join(', ')}</FormDescription>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit">Guardar Item</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
