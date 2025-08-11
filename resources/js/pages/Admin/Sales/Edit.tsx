import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Sale } from '@/types'; // Supondo que você tenha um tipo Sale
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FieldErrors, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

// Importar os subcomponentes (mesmos do Create)
import ItemEditDialog from './_components/ItemEditDialog';
import ManualItemDialog from './_components/ManualItemDialog';
import ProductCatalog from './_components/ProductCatalog';
import SaleDetails from './_components/SaleDetails';
import SaleSummary from './_components/SaleSummary';
import ShoppingCartComponent from './_components/ShoppingCart';

// Schema de validação (geralmente o mesmo, mas pode ser ajustado se necessário)
const formSchema = z.object({
    sale_number: z.string().optional().nullable(),
    customer_id: z.string().optional().nullable(),
    issue_date: z.date({ required_error: 'Data de emissão é obrigatória' }),
    due_date: z.date().optional().nullable(),
    status: z.enum(['draft', 'pending', 'paid', 'partial', 'cancelled']),
    currency_code: z.string().min(1, { message: 'Moeda é obrigatória' }),
    exchange_rate: z
        .string()
        .min(1, { message: 'Taxa de câmbio é obrigatória' })
        .refine((val) => !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
        .refine((val) => parseFloat(val) > 0, { message: 'Deve ser maior que zero' }),
    include_tax: z.boolean().default(true),
    notes: z.string().optional(),
    terms: z.string().optional(),
    shipping_amount: z
        .string()
        .optional()
        .refine((val) => val === '' || !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
        .refine((val) => val === '' || parseFloat(val) >= 0, { message: 'Não pode ser negativo' }),
    shipping_address: z.string().optional(),
    billing_address: z.string().optional(),
    payment_method: z.string().optional(),
    amount_paid: z
        .string()
        .optional()
        .refine((val) => val === '' || !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
        .refine((val) => val === '' || parseFloat(val) >= 0, { message: 'Não pode ser negativo' }),
      items: z
        .array(
            z.object({
                id: z.any().optional(), // ID do item existente
                product_id: z.string().optional().nullable(),
                product_variant_id: z.string().optional().nullable(),
                warehouse_id: z.string().optional().nullable(),
                name: z.string().min(1, { message: 'Nome é obrigatório' }),
                // description: z.null().optional(),
                quantity: z
                    .string()
                    .min(1, { message: 'Quantidade é obrigatória' })
                    .refine((val) => !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
                    .refine((val) => parseFloat(val) > 0, { message: 'Deve ser maior que zero' }),
                unit: z.string().optional(),
                unit_price: z
                    .string()
                    .min(1, { message: 'Preço é obrigatório' })
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
            }),
        )
        .min(1, { message: 'Adicione pelo menos 1 item à venda' }),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
    sale: Sale; // A prop principal agora é a venda
    customers: any[];
    products: any[];
    warehouses: any[];
    currencies: any[];
    defaultCurrency: any;
    taxRates: any[];
    units: { value: string; label: string }[];
    statuses: any[];
    discountTypes: any[];
    paymentMethods: { value: string; label: string }[];
}

export default function Edit({
    sale, // Recebe a venda a ser editada
    customers,
    products,
    warehouses,
    currencies,
    defaultCurrency,
    taxRates,
    statuses,
    units,
    discountTypes,
    paymentMethods,
}: Props) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeView, setActiveView] = useState<'products' | 'details'>('details');
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(warehouses.length > 0 ? warehouses[0].id.toString() : '');
    const [itemBeingEdited, setItemBeingEdited] = useState<any | null>(null);
    const [itemEditDialogOpen, setItemEditDialogOpen] = useState(false);
    const [manualItemDialogOpen, setManualItemDialogOpen] = useState(false);
    const { errors } = usePage().props as any;

    // Breadcrumbs dinâmicos para a página de edição
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Vendas', href: '/admin/sales' },
        { title: `Editar Venda #${sale.sale_number}`, href: `/admin/sales/${sale.id}/edit` },
    ];

    // Configuração do formulário com os valores da venda existente
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...sale,
            customer_id: sale.customer_id?.toString() || '',
            issue_date: sale.issue_date ? parseISO(sale.issue_date) : new Date(),
            due_date: sale.due_date ? parseISO(sale.due_date) : null,
            exchange_rate: sale.exchange_rate?.toString() || '1',
            shipping_amount: sale.shipping_amount?.toString() || '0',
            amount_paid: sale.amount_paid?.toString() || '0',
            shipping_address: sale.shipping_address || '',
            billing_address: sale.billing_address || '',
            notes: sale.notes || '',
            terms: sale.terms || '',
            items:
                sale.items?.map((item: any) => ({
                    ...item,
                    id: item.id, // Manter o ID do item existente
                    product_id: item.product_id ? item.product_id.toString() : undefined,
                    product_variant_id: item.product_variant_id ? item.product_variant_id.toString() : undefined,
                    warehouse_id: item.warehouse_id ? item.warehouse_id.toString() : undefined,
                    quantity: item.quantity.toString(),
                    unit_price: item.unit_price.toString(),
                    discount_percentage: item.discount_percentage?.toString() || '0',
                    tax_percentage: item.tax_percentage?.toString() || '0',
                })) || [],
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: 'items',
    });

    const watchCurrency = form.watch('currency_code');
    const watchPaymentAmount = form.watch('amount_paid');
    const watchPaymentMethod = form.watch('payment_method');

    // Lógica para lidar com erros e atualização de moeda (idêntica ao Create)
    useEffect(() => {
        const selectedCurrency = currencies.find((c) => c.code === watchCurrency);
        if (selectedCurrency) {
            form.setValue('exchange_rate', selectedCurrency.exchange_rate.toString());
        }
    }, [watchCurrency, currencies, form]);

    useEffect(() => {
        if (errors) {
            Object.keys(errors).forEach((key) => {
                if (key.startsWith('items.')) {
                    const [_, index, field] = key.split('.');
                    form.setError(`items.${index}.${field}` as any, {
                        type: 'manual',
                        message: errors[key],
                    });
                } else {
                    form.setError(key as any, {
                        type: 'manual',
                        message: errors[key],
                    });
                }
            });
            if (Object.keys(errors).some((key) => !key.startsWith('items.'))) {
                setActiveView('details');
            }
        }
    }, [errors, form]);

    const addProductToCart = async (productId: string, warehouseId?: string) => {
        const selectedProduct = products.find((p) => p.id.toString() === productId);
        if (!selectedProduct) return;

        try {
            let unitPrice = selectedProduct.price.toString();
            if (warehouseId) {
                // Lógica para buscar preço do inventário (pode ser extraída para uma função helper)
            }

            const existingItemIndex = fields.findIndex(
                (item) => item.product_id === productId && item.warehouse_id === (warehouseId || selectedWarehouseId),
            );

            if (existingItemIndex >= 0) {
                const currentItem = fields[existingItemIndex];
                const newQuantity = (parseFloat(currentItem.quantity) + 1).toString();
                update(existingItemIndex, { ...currentItem, quantity: newQuantity });
                toast({ title: 'Quantidade atualizada' });
            } else {
                append({
                    id: undefined, // Novo item não tem ID
                    product_id: productId,
                    name: selectedProduct.name,
                    description: selectedProduct.description || '',
                    quantity: '1',
                    unit: selectedProduct.unit || 'unit',
                    unit_price: unitPrice,
                    warehouse_id: warehouseId || selectedWarehouseId,
                    discount_percentage: '0',
                    tax_percentage: taxRates.find((tax) => tax.is_default)?.value.toString() || '16',
                });
                toast({ title: 'Produto adicionado', variant: 'success' });
            }
        } catch (error) {
            toast({ title: 'Erro', description: 'Ocorreu um erro ao adicionar o produto.', variant: 'destructive' });
        }
    };

    const handleUpdateItem = (index: number, field: string, value: string) => {
        const currentItem = { ...fields[index] };
        update(index, { ...currentItem, [field]: value });
    };

    const handleEditItem = (index: number) => {
        setItemBeingEdited({ ...fields[index], index });
        setItemEditDialogOpen(true);
    };

    const handleSaveItemEdit = (editedItem: any) => {
        const { index, ...itemToUpdate } = editedItem;
        update(index, itemToUpdate);
        setItemBeingEdited(null);
    };

    const handleAddManualItem = (item: any) => append({ ...item, product_id: undefined, id: undefined });

    const calculateItemValues = (item: any) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        const discountPercentage = parseFloat(item.discount_percentage) || 0;
        const taxPercentage = parseFloat(item.tax_percentage) || 0;
        const subtotal = quantity * unitPrice;
        const discountAmount = subtotal * (discountPercentage / 100);
        const taxAmount = (subtotal - discountAmount) * (taxPercentage / 100);
        const total = subtotal - discountAmount + taxAmount;
        return { subtotal, discount_amount: discountAmount, tax_amount: taxAmount, total };
    };

    const calculateTotals = () => {
        let subtotal = 0,
            taxAmount = 0,
            discountAmount = 0;
        fields.forEach((item) => {
            const values = calculateItemValues(item);
            subtotal += values.subtotal;
            taxAmount += values.tax_amount;
            discountAmount += values.discount_amount;
        });
        const shippingAmount = parseFloat(form.watch('shipping_amount') || '0');
        let total = subtotal - discountAmount;
        if (form.watch('include_tax')) {
            total += taxAmount;
        }
        total += shippingAmount;
        return { subtotal, taxAmount, discountAmount, shippingAmount, total };
    };

    const formatCurrency = (value: number) => {
        if (value === null || value === undefined) return 'N/A';
        const selectedCurrencyCode = form.getValues('currency_code');
        const selectedCurrency = currencies.find((c) => c.code === selectedCurrencyCode) || defaultCurrency;
        return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: selectedCurrency?.code || 'MZN' }).format(value);
    };

    const handlePaymentMethodChange = (method: string) => form.setValue('payment_method', method);
    const handlePaymentAmountChange = (amount: string) => form.setValue('amount_paid', amount);

    const processSubmit = (values: FormValues) => {
        setIsSubmitting(true);
        const data = {
            ...values,
            _method: 'PUT', // Adiciona o método para o Laravel
            customer_id: values.customer_id || null,
            exchange_rate: parseFloat(values.exchange_rate),
            issue_date: format(values.issue_date, 'yyyy-MM-dd'),
            due_date: values.due_date ? format(values.due_date, 'yyyy-MM-dd') : null,
            shipping_amount: values.shipping_amount ? parseFloat(values.shipping_amount) : 0,
            amount_paid: values.amount_paid ? parseFloat(values.amount_paid) : 0,
            items: values.items.map((item) => ({
                ...item,
                id: item.id || null, // Envia o ID do item se existir
                product_id: item.product_id || null,
                product_variant_id: item.product_variant_id || null,
                warehouse_id: item.warehouse_id || null,
                quantity: parseFloat(item.quantity),
                unit_price: parseFloat(item.unit_price),
                discount_percentage: item.discount_percentage ? parseFloat(item.discount_percentage) : 0,
                tax_percentage: item.tax_percentage ? parseFloat(item.tax_percentage) : 0,
            })),
        };

        router.post(`/admin/sales/${sale.id}`, data, {
            onSuccess: () => toast({ title: 'Venda Atualizada', description: 'As alterações foram salvas com sucesso.', variant: 'success' }),
            onError: (e) => {
                console.error(e);
                toast({ title: 'Erro', description: 'Verifique os erros no formulário.', variant: 'destructive' });
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const onInvalid = (errors: FieldErrors<FormValues>) => {
        toast({ title: 'Erro de Validação', description: 'Corrija os erros antes de continuar.', variant: 'destructive' });
        console.log(errors);
    };

    const totals = calculateTotals();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Venda #${sale.sale_number}`} />
            <div className="container px-4 py-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={`/admin/sales/${sale.id}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Editar Venda</h1>
                            <p className="text-muted-foreground">Número da Fatura: #{sale.sale_number}</p>
                        </div>
                    </div>
                    <div>
                        <Button
                            variant={activeView === 'products' ? 'default' : 'outline'}
                            onClick={() => setActiveView('products')}
                            className="mr-2"
                            type="button"
                        >
                            Produtos
                        </Button>
                        <Button variant={activeView === 'details' ? 'default' : 'outline'} onClick={() => setActiveView('details')} type="button">
                            Detalhes da Venda
                        </Button>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(processSubmit, onInvalid)} className="space-y-8">
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 lg:col-span-8">
                                {activeView === 'products' ? (
                                    <div>
                                        <ProductCatalog
                                            products={products}
                                            categories={products.reduce(
                                                (acc: any[], p) =>
                                                    !p.category || acc.some((c) => c.id === p.category.id) ? acc : [...acc, p.category],
                                                [],
                                            )}
                                            onProductSelect={addProductToCart}
                                            warehouses={warehouses}
                                            selectedWarehouseId={selectedWarehouseId}
                                            onWarehouseChange={setSelectedWarehouseId}
                                            className="mb-6"
                                        />
                                        <div className="mb-4 flex justify-end">
                                            <Button variant="outline" onClick={() => setManualItemDialogOpen(true)} type="button">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Adicionar Item Manual
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <SaleDetails control={form.control} customers={customers} currencies={currencies} statuses={statuses} />
                                )}
                                <div className="mt-6">
                                    <h2 className="mb-3 text-lg font-semibold">Carrinho de Compras</h2>
                                    <ShoppingCartComponent
                                        items={fields}
                                        warehouses={warehouses}
                                        onUpdateItem={handleUpdateItem}
                                        onRemoveItem={remove}
                                        formatCurrency={formatCurrency}
                                        calculateItemValues={calculateItemValues}
                                        onEditItem={handleEditItem}
                                    />
                                </div>
                            </div>

                            <div className="col-span-12 space-y-6 lg:col-span-4">
                                <SaleSummary
                                    totals={totals}
                                    itemCount={fields.length}
                                    status={form.watch('status')}
                                    isSubmitting={isSubmitting}
                                    formatCurrency={formatCurrency}
                                    paymentMethods={paymentMethods}
                                    onPaymentMethodChange={handlePaymentMethodChange}
                                    onPaymentAmountChange={handlePaymentAmountChange}
                                    paymentMethod={watchPaymentMethod}
                                    paymentAmount={watchPaymentAmount}
                                    submitButtonText="Atualizar Venda"
                                />
                            </div>
                        </div>
                    </form>
                </Form>

                {itemBeingEdited && (
                    <ItemEditDialog
                        open={itemEditDialogOpen}
                        onOpenChange={setItemEditDialogOpen}
                        item={itemBeingEdited}
                        onSave={handleSaveItemEdit}
                        warehouses={warehouses}
                        taxRates={taxRates}
                        units={units}
                    />
                )}
                <ManualItemDialog
                    open={manualItemDialogOpen}
                    onOpenChange={setManualItemDialogOpen}
                    onSubmit={handleAddManualItem}
                    taxRates={taxRates}
                    units={units}
                    warehouses={warehouses}
                    selectedWarehouseId={selectedWarehouseId}
                />
            </div>
        </AppLayout>
    );
}
