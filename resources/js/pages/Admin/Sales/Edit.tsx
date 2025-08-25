import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type Sale, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Plus, User, Package, CreditCard, Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray, FieldErrors } from 'react-hook-form';
import { z } from 'zod';

// Importar os componentes
import SaleDetails from './_components/SaleDetails';
import SaleSummary from './_components/SaleSummary';
// Importar componentes das cotações para reutilizar
import ProductSelector from '../Quotations/_components/ProductSelector';
import ItemForm, { ItemFormValues } from '../Quotations/_components/ItemForm';
import ItemsTab from '../Quotations/_components/ItemsTab';

// Schema de validação para o formulário
const formSchema = z.object({
  sale_number: z.string().optional().nullable(),
  customer_id: z.string().optional(),
  issue_date: z.date({ required_error: "Data de emissão é obrigatória" }),
  due_date: z.date().optional().nullable(),
  status: z.enum(['draft', 'pending', 'paid', 'partial', 'cancelled']),
  currency_code: z.string().min(1, { message: "Moeda é obrigatória" }),
  exchange_rate: z.string().min(1, { message: "Taxa de câmbio é obrigatória" })
    .refine(val => !isNaN(parseFloat(val)), { message: "Deve ser um número válido" })
    .refine(val => parseFloat(val) > 0, { message: "Deve ser maior que zero" }),
  include_tax: z.boolean().default(true),
  notes: z.string().optional(),
  terms: z.string().optional(),
  shipping_amount: z.string().optional()
    .refine(val => val === '' || !isNaN(parseFloat(val)), { message: "Deve ser um número válido" })
    .refine(val => val === '' || parseFloat(val) >= 0, { message: "Não pode ser negativo" }),
  shipping_address: z.string().optional(),
  billing_address: z.string().optional(),
  payment_method: z.string().optional(),
  amount_paid: z.string().optional()
    .refine(val => val === '' || !isNaN(parseFloat(val)), { message: "Deve ser um número válido" })
    .refine(val => val === '' || parseFloat(val) >= 0, { message: "Não pode ser negativo" }),
  reference: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string().optional(),
      product_id: z.string().optional(),
      product_variant_id: z.string().optional(),
            product_color_id: z.string().optional(),
            product_size_id: z.string().optional(),
      warehouse_id: z.string().optional(),
      name: z.string().min(1, { message: "Nome é obrigatório" }),
      description: z.string().optional(),
      quantity: z.string().min(1, { message: "Quantidade é obrigatória" })
                .refine(val => val !== undefined && !isNaN(parseFloat(val)), { message: "Deve ser um número válido" })
                .refine(val => val !== undefined && parseFloat(val) > 0, { message: "Deve ser maior que zero" }),
      unit: z.string().optional(),
      unit_price: z.string().min(1, { message: "Preço é obrigatório" })
                .refine(val => val !== undefined && !isNaN(parseFloat(val)), { message: "Deve ser um número válido" })
                .refine(val => val !== undefined && parseFloat(val) >= 0, { message: "Não pode ser negativo" }),
      discount_percentage: z.string().optional()
                .refine(val => val === '' || (val !== undefined && !isNaN(parseFloat(val))), { message: "Deve ser um número válido" })
                .refine(val => val === '' || (val !== undefined && parseFloat(val) >= 0), { message: "Não pode ser negativo" })
                .refine(val => val === '' || (val !== undefined && parseFloat(val) <= 100), { message: "Deve ser no máximo 100%" }),
      tax_percentage: z.string().optional()
                .refine(val => val === '' || (val !== undefined && !isNaN(parseFloat(val))), { message: "Deve ser um número válido" })
                .refine(val => val === '' || (val !== undefined && parseFloat(val) >= 0), { message: "Não pode ser negativo" }),
    })
  ).min(1, { message: "Adicione pelo menos 1 item à venda" }),
});

type FormValues = z.infer<typeof formSchema>;


interface SaleItem {
    id?: string;
    product_id?: string;
    product_variant_id?: string;
    product_color_id?: string;
    product_size_id?: string;
    warehouse_id?: string;
    name: string;
    description?: string;
    quantity: string;
    unit?: string;
    unit_price: string;
    discount_percentage?: string;
    tax_percentage?: string;
}

interface Customer { id: string; name: string; }
interface Product { id: string; name: string; price: number; unit?: string; description?: string; category?: { id: string; name: string }; }
interface Warehouse { id: string; name: string; }
interface Currency { code: string; exchange_rate: number; decimal_separator: string; thousand_separator: string; decimal_places: number; symbol: string; }
interface TaxRate { value: number; is_default?: boolean; }
interface PaymentMethod { value: string; label: string; }

interface Props {
    sale: Sale;
    customers: Customer[];
    products: Product[];
    warehouses: Warehouse[];
    currencies: Currency[];
    defaultCurrency: Currency;
    taxRates: TaxRate[];
    units: { value: string; label: string }[];
    statuses: string[];
    paymentMethods: PaymentMethod[];
}

export default function Edit({
    sale,
    customers,
    products,
    warehouses,
    currencies,
    defaultCurrency,
    taxRates,
    statuses,
    units,
    paymentMethods,
}: Props) {
    const { toast } = useToast();

    const { errors } = usePage().props as { errors?: Record<string, string | string[]> };
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('items');
    const [productSelectorOpen, setProductSelectorOpen] = useState(false);
    const [itemFormOpen, setItemFormOpen] = useState(false);
    const [onSearch, setOnSearch] = useState('');
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

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
            reference: sale.reference || '',
            include_tax: sale.include_tax ?? true,
                items:
                    sale.items?.map((item) => ({
                        ...item,
                        id: item.id?.toString(), // Manter o ID do item existente
                        product_id: item.product_id ? item.product_id.toString() : undefined,
                        product_variant_id: item.product_variant_id ? item.product_variant_id.toString() : undefined,
                        product_color_id: item.product_color_id ? item.product_color_id.toString() : undefined,
                        product_size_id: item.product_size_id ? item.product_size_id.toString() : undefined,
                        warehouse_id: item.warehouse_id ? item.warehouse_id.toString() : undefined,
                        quantity: item.quantity.toString(),
                        unit_price: item.unit_price.toString(),
                        discount_percentage: item.discount_percentage?.toString() || '0',
                        tax_percentage: item.tax_percentage?.toString() || '0',
                        description: item.description || '',
                        unit: item.unit || 'unit',
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

    // Lógica para lidar com erros e atualização de moeda
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
                    const parts = key.split('.');
                    const index = parts[1];
                    const field = parts[2];
                    form.setError(`items.${index}.${field}` as keyof FormValues, {
                        type: 'manual',
                        message: Array.isArray(errors[key]) ? errors[key][0] : errors[key],
                    });
                } else {
                    form.setError(key as keyof FormValues, {
                        type: 'manual',
                        message: Array.isArray(errors[key]) ? errors[key][0] : errors[key],
                    });
                }
            });
            if (Object.keys(errors).some((key) => !key.startsWith('items.'))) {
                setActiveTab('details');
            }
        }
    }, [errors, form]);

    // Lidar com a seleção de um produto no seletor
    const handleProductSelect = (productId: string) => {
        setProductSelectorOpen(false);

        // Obter o produto selecionado
        const selectedProduct = products.find((p) => p.id === productId);
        if (!selectedProduct) return;

        // Se estiver editando um item existente
        if (editingItemIndex !== null) {
            // Atualizar o item existente com os dados do produto
            const currentItem = { ...fields[editingItemIndex] };
            update(editingItemIndex, {
                ...currentItem,
                product_id: productId,
                // name: selectedProduct.name,
                unit_price: selectedProduct.price.toString(),
                unit: selectedProduct.unit || 'unit',
            });
        } else {
                // Criar um novo item com os dados do produto
                const newItem: SaleItem = {
                    product_id: productId,
                    product_variant_id: undefined,
                    product_color_id: undefined,
                    product_size_id: undefined,
                    warehouse_id: warehouses.length > 0 ? warehouses[0].id.toString() : "",
                    name: selectedProduct.name,
                    description: selectedProduct.description || '',
                    quantity: '1',
                    unit: selectedProduct.unit || 'unit',
                    unit_price: selectedProduct.price.toString(),
                    discount_percentage: '0',
                    tax_percentage: taxRates.find((tax) => tax.is_default === true)?.value?.toString() || '16',
                };

                append(newItem);

                setTimeout(() => {
                    setEditingItemIndex(fields.length);
                    setItemFormOpen(true);
                }, 0);
        }
    };

    // Adicionar um novo item
    const handleAddItem = (item: ItemFormValues) => {
        if (editingItemIndex !== null) {
            // Atualizar item existente
            update(editingItemIndex, { ...item, id: fields[editingItemIndex].id });
            setEditingItemIndex(null);
            toast({ title: 'Item atualizado com sucesso', variant: 'success' });
        } else {
            // Adicionar novo item
            append(item);
            toast({ title: 'Item adicionado com sucesso', variant: 'success' });
        }
        setItemFormOpen(false);
    };

    // Editar um item existente
    const handleEditItem = (index: number) => {
        setEditingItemIndex(index);
        setItemFormOpen(true);
    };

    const handleDuplicateItem = (index: number) => {
        const itemToDuplicate = fields[index];
        if (itemToDuplicate) {
            // Create a shallow copy of the item without ID
            const duplicatedItem = { ...itemToDuplicate };
            if ('id' in duplicatedItem) {
                delete (duplicatedItem as any).id;
            }
            // Append the duplicated item to the end of the array
            append(duplicatedItem);
            toast({ title: 'Item duplicado com sucesso', variant: 'success' });
        }
    };

    // Remover um item
    const handleRemoveItem = (index: number) => {
        remove(index);
        toast({ title: 'Item removido com sucesso', variant: 'success' });
    };

    const calculateItemValues = (item: any) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        const discountPercentage = parseFloat(item.discount_percentage || '0') || 0;
        const taxPercentage = parseFloat(item.tax_percentage || '0') || 0;

        // Calcular subtotal (quantidade * preço unitário)
        const subtotal = quantity * unitPrice;

        // Calcular valor do desconto
        const discountAmount = subtotal * (discountPercentage / 100);

        // Calcular valor do imposto (após descontos)
        const taxAmount = (subtotal - discountAmount) * (taxPercentage / 100);

        // Calcular total
        const total = subtotal - discountAmount + taxAmount;

        return {
            subtotal: subtotal.toFixed(2),
            discount_amount: discountAmount.toFixed(2),
            tax_amount: taxAmount.toFixed(2),
            total: total.toFixed(2),
        };
    };

    const calculateTotals = () => {
        let subtotal = 0, taxAmount = 0, discountAmount = 0;
        fields.forEach(item => {
            const values = calculateItemValues(item);
            subtotal += parseFloat(values.subtotal);
            taxAmount += parseFloat(values.tax_amount);
            discountAmount += parseFloat(values.discount_amount);
        });
        const shippingAmount = parseFloat(form.watch('shipping_amount') || '0');
        let total = subtotal - discountAmount;
        if (form.watch('include_tax')) {
            total += taxAmount;
        }
        total += shippingAmount;
        return { subtotal, taxAmount, discountAmount, shippingAmount, total };
    };

    const formatCurrency = (value: number | null | undefined, withSymbol = true) => {
        if (value === null || value === undefined) return 'N/A';
        const selectedCurrencyCode = form.getValues('currency_code');
        const selectedCurrency = currencies.find(c => c.code === selectedCurrencyCode) || defaultCurrency;
        if (!selectedCurrency) {
            return new Intl.NumberFormat('pt-PT', { style: withSymbol ? 'currency' : 'decimal', currency: 'MZN' }).format(value);
        }
        const { decimal_separator, thousand_separator, decimal_places, symbol } = selectedCurrency;
        const formattedValue = value
            .toFixed(decimal_places)
            .replace('.', 'DECIMAL')
            .replace(/\B(?=(\d{3})+(?!\d))/g, thousand_separator)
            .replace('DECIMAL', decimal_separator);
        return withSymbol ? `${symbol} ${formattedValue}` : formattedValue;
    };

    const handlePaymentMethodChange = (method: string) => form.setValue('payment_method', method);

    const handlePaymentAmountChange = (amount: string) => {
        form.setValue('amount_paid', amount);
        const amountValue = parseFloat(amount) || 0;
        const total = calculateTotals().total;
        if (total > 0 && amountValue >= total) form.setValue('status', 'paid');
        else if (amountValue > 0) form.setValue('status', 'partial');
        else form.setValue('status', 'pending');
    };

    const processSubmit = (values: FormValues) => {
        setIsSubmitting(true);
        const data = {
            ...values,
            _method: 'PUT',
            customer_id: values.customer_id || null,
            exchange_rate: parseFloat(values.exchange_rate),
            issue_date: format(values.issue_date, 'yyyy-MM-dd'),
            due_date: values.due_date ? format(values.due_date, 'yyyy-MM-dd') : null,
            shipping_amount: values.shipping_amount ? parseFloat(values.shipping_amount) : 0,
            amount_paid: values.amount_paid ? parseFloat(values.amount_paid) : 0,
                items: values.items.map((item) => ({
                    ...item,
                    id: item.id || null,
                    product_id: item.product_id || null,
                    product_variant_id: item.product_variant_id || null,
                    product_color_id: item.product_color_id || null,
                    product_size_id: item.product_size_id || null,
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
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(processSubmit, onInvalid)} className="space-y-8">
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 lg:col-span-8">
                                <Tabs defaultValue="items" value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList>
                                        <TabsTrigger value="details">
                                            <User className="mr-2 h-4 w-4" />
                                            Dados Gerais
                                        </TabsTrigger>
                                        <TabsTrigger value="items">
                                            <Package className="mr-2 h-4 w-4" />
                                            Produtos {fields.length > 0 && `(${fields.length})`}
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Tab de Dados Gerais */}
                                    <TabsContent value="details" className="mt-6">
                                        <SaleDetails control={form.control} customers={customers} currencies={currencies} statuses={statuses} />
                                    </TabsContent>

                                    {/* Tab de Produtos */}
                                    <TabsContent value="items" className="mt-6">
                                        <ItemsTab
                                            fieldArray={{ fields, append, remove, update }}
                                            products={products}
                                            warehouses={warehouses}
                                            taxRates={taxRates}
                                            units={units}
                                            form={form}
                                            currencies={currencies}
                                            calculateItemValues={calculateItemValues}
                                            formatCurrency={formatCurrency}
                                            onAddItemManual={() => {
                                                setEditingItemIndex(null);
                                                setItemFormOpen(true);
                                            }}
                                            onAddProduct={() => {
                                                setEditingItemIndex(null);
                                                setProductSelectorOpen(true);
                                            }}
                                            onEditItem={handleEditItem}
                                            onDuplicateItem={handleDuplicateItem}
                                            onRemoveItem={handleRemoveItem}
                                        />
                                    </TabsContent>
                                </Tabs>
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
                                    paymentMethod={watchPaymentMethod || ''}
                                    paymentAmount={watchPaymentAmount || ''}
                                />
                            </div>
                        </div>

                        {/* Botões na parte inferior */}
                        <div className="bg-background sticky bottom-0 flex items-center justify-between border-t p-4 shadow-lg">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.get(`/admin/sales/${sale.id}`)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        A atualizar...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Atualizar Venda
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>

                {/* Modal de Seleção de Produto */}
                <ProductSelector
                    open={productSelectorOpen}
                    onOpenChange={setProductSelectorOpen}
                    onAddItemManual={() => {
                        setProductSelectorOpen(false)
                        setEditingItemIndex(null);
                        setItemFormOpen(true);
                    }}
                    setOnSearch={setOnSearch}
                    products={products}
                    onSelect={handleProductSelect}
                />

                {/* Formulário de Item */}
                <ItemForm
                    open={itemFormOpen}
                    onOpenChange={setItemFormOpen}
                    onSubmit={handleAddItem}
                    products={products}
                    name={onSearch || ''}
                    warehouses={warehouses}
                    taxRates={taxRates}
                    units={units}
                    setOnSearch={setOnSearch}
                    initialValues={editingItemIndex !== null ? fields[editingItemIndex] : undefined}
                    title={editingItemIndex !== null ? 'Editar Item' : 'Adicionar Item'}
                    isManualItemMode={editingItemIndex === null && !productSelectorOpen}
                />
            </div>
        </AppLayout>
    );
}
