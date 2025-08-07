import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Check, CreditCard, Loader2, Package, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import DetailsTab from './_components/DetailsTab';
import ItemForm, { ItemFormValues } from './_components/ItemForm';
import ItemsTab from './_components/ItemsTab';
import NotesTab from './_components/NotesTab';
import ProductSelector from './_components/ProductSelector';
import { Currency, Customer, DiscountType, Product, QuotationStatus, TaxRate, Warehouse } from './_components/types';

interface Props {
    quotationNumber: string;
    customers: Customer[];
    products: Product[];
    warehouses: Warehouse[];
    currencies: Currency[];
    defaultCurrency: Currency;
    taxRates: TaxRate[];
    units: { value: string; label: string }[];
    statuses: QuotationStatus[];
    discountTypes: DiscountType[];
}

// Schema de validação do formulário
const formSchema = z.object({
    quotation_number: z.string().optional().nullable(),
    customer_id: z.string().optional(),
    issue_date: z.date({ required_error: 'Data de emissão é obrigatória' }),
    expiry_date: z.date().optional().nullable(),
    status: z.enum(['draft', 'sent', 'approved', 'rejected']),
    currency_code: z.string().min(1, { message: 'Moeda é obrigatória' }),
    exchange_rate: z
        .string()
        .min(1, { message: 'Taxa de câmbio é obrigatória' })
        .refine((val) => !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
        .refine((val) => parseFloat(val) > 0, { message: 'Deve ser maior que zero' }),
    include_tax: z.boolean().default(true),
    notes: z.string().optional(),
    terms: z.string().optional(),
    items: z
        .array(
            z.object({
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
        .min(1, { message: 'Adicione pelo menos 1 item à cotação' }),
});

type FormValues = z.infer<typeof formSchema>;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Cotações',
        href: '/admin/quotations',
    },
    {
        title: 'Nova Cotação',
        href: '/admin/quotations/create',
    },
];

export default function Create({
    quotationNumber,
    customers,
    products,
    warehouses,
    currencies,
    defaultCurrency,
    taxRates,
    statuses,
    units,
    discountTypes,
}: Props) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productSelectorOpen, setProductSelectorOpen] = useState(false);
    const [itemFormOpen, setItemFormOpen] = useState(false);
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState('items');
    const { errors } = usePage().props as any;

    // Calcular datas padrão
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + 30); // Validade padrão de 30 dias

    // Inicializar o formulário
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quotation_number: quotationNumber,
            customer_id: '',
            issue_date: today,
            expiry_date: expiryDate,
            status: 'draft',
            currency_code: defaultCurrency?.code || 'MZN',
            exchange_rate: defaultCurrency ? defaultCurrency.exchange_rate.toString() : '1.0000',
            include_tax: true,
            notes: '',
            terms: '',
            items: [],
        },
    });

    // Field array para manipular os itens da cotação
    const fieldArray = useFieldArray({
        control: form.control,
        name: 'items',
    });

    const { fields, append, remove, update } = fieldArray;

    // Selecionar a taxa de câmbio quando a moeda muda
    const watchCurrency = form.watch('currency_code');

    useEffect(() => {
        const selectedCurrency = currencies.find((c) => c.code === watchCurrency);
        if (selectedCurrency) {
            form.setValue('exchange_rate', selectedCurrency.exchange_rate.toString());
        }
    }, [watchCurrency, currencies, form]);

    // Mapear erros do Laravel para os erros do formulário
    useEffect(() => {
        if (errors) {
            Object.keys(errors).forEach((key) => {
                // Verificar se o erro é em um campo de item
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
                name: selectedProduct.name,
                unit_price: selectedProduct.price.toString(),
                unit: selectedProduct.unit || 'unit', // Usar a unidade do produto
            });
        } else {
            // Criar um novo item com os dados do produto
            // console.log('vvv', productId);
            const newItem = {
                product_id: productId,
                name: selectedProduct.name,
                quantity: '1',
                unit_price: selectedProduct.price.toString(),
                unit: selectedProduct.unit || 'unit', // Usar a unidade do produto
                discount_percentage: '0',
                tax_percentage: taxRates.find((tax) => tax.is_default == true)?.value || '16', // Taxa padrão de IVA em Moçambique
            };

            // Adicionar diretamente no form
            append(newItem);

            // Definir o item recém adicionado como item em edição
            setTimeout(() => {
                setEditingItemIndex(fields.length);
                // Abrir formulário de item para editar detalhes adicionais
                setItemFormOpen(true);
            }, 0);
        }
    };

    // Adicionar um novo item
    const handleAddItem = (item: ItemFormValues) => {
        if (editingItemIndex !== null) {
            // Atualizar item existente
            update(editingItemIndex, item);
            setEditingItemIndex(null);
        } else {
            // Adicionar novo item
            append(item);
        }
        setItemFormOpen(false);
    };

    // Editar um item existente
    const handleEditItem = (index: number) => {
        setEditingItemIndex(index);
        setItemFormOpen(true);
    };

    // Remover um item
    const handleRemoveItem = (index: number) => {
        remove(index);
    };

    // Calcular valores do item
    const calculateItemValues = (item: any) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        const discountPercentage = parseFloat(item.discount_percentage) || 0;
        const taxPercentage = parseFloat(item.tax_percentage) || 0;

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

    // Formatar valor monetário baseado na moeda selecionada
    const formatCurrency = (value: number | null | undefined, withSymbol = true) => {
        if (value === null || value === undefined) return 'N/A';

        const selectedCurrencyCode = form.getValues('currency_code');
        const selectedCurrency = currencies.find((c) => c.code === selectedCurrencyCode) || defaultCurrency;

        if (!selectedCurrency) {
            return new Intl.NumberFormat('pt-PT', {
                style: withSymbol ? 'currency' : 'decimal',
                currency: 'MZN',
            }).format(value);
        }

        const { decimal_separator, thousand_separator, decimal_places, symbol } = selectedCurrency;

        const formattedValue = value
            .toFixed(decimal_places)
            .replace('.', 'DECIMAL')
            .replace(/\B(?=(\d{3})+(?!\d))/g, thousand_separator)
            .replace('DECIMAL', decimal_separator);

        return withSymbol ? `${symbol} ${formattedValue}` : formattedValue;
    };

    // Função para submeter o formulário
    const onSubmit = (values: FormValues) => {
        setIsSubmitting(true);

        if (values.items.length === 0) {
            toast({
                title: 'Erro',
                description: 'Adicione pelo menos um item à cotação',
                variant: 'destructive',
            });
            setIsSubmitting(false);
            return;
        }

        // Converter tipos de dados antes de enviar
        const data = {
            ...values,
            customer_id: values.customer_id,
            exchange_rate: parseFloat(values.exchange_rate),
            issue_date: format(values.issue_date, 'yyyy-MM-dd'),
            expiry_date: values.expiry_date ? format(values.expiry_date, 'yyyy-MM-dd') : null,
            items: values.items.map((item) => ({
                ...item,
                product_id: item.product_id,
                product_variant_id: item.product_variant_id,
                warehouse_id: item.warehouse_id,
                quantity: parseFloat(item.quantity),
                unit_price: parseFloat(item.unit_price),
                discount_percentage: item.discount_percentage ? parseFloat(item.discount_percentage) : 0,
                tax_percentage: item.tax_percentage ? parseFloat(item.tax_percentage) : 0,
                // Incluir os valores calculados
                ...calculateItemValues(item),
            })),
        };

        router.post('/admin/quotations', data, {
            onSuccess: () => {
                setIsSubmitting(false);
                toast({
                    title: 'Cotação criada',
                    description: 'A cotação foi criada com sucesso.',
                    variant: 'success',
                });
            },
            onError: () => {
                setIsSubmitting(false);
                toast({
                    title: 'Erro',
                    description: 'Verifique os erros no formulário.',
                    variant: 'destructive',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nova Cotação" />

            <div className="container px-4 py-6">
                <div className="mb-6 flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/quotations">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Nova Cotação</h1>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Tabs defaultValue="items" value={activeTab} onValueChange={setActiveTab}>
                            <TabsList>
                                <TabsTrigger value="details">
                                    <User className="mr-2 h-4 w-4" />
                                    Dados Gerais
                                </TabsTrigger>
                                <TabsTrigger value="items">
                                    <Package className="mr-2 h-4 w-4" />
                                    Itens {fields.length > 0 && `(${fields.length})`}
                                </TabsTrigger>
                                <TabsTrigger value="notes">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Notas e Termos
                                </TabsTrigger>
                            </TabsList>

                            {/* Tab de Dados Gerais */}
                            <TabsContent value="details" className="mt-6">
                                <DetailsTab control={form.control} customers={customers} currencies={currencies} statuses={statuses} />
                            </TabsContent>

                            {/* Tab de Itens */}
                            <TabsContent value="items" className="mt-6">
                                <ItemsTab
                                    fieldArray={fieldArray}
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
                                    onRemoveItem={handleRemoveItem}
                                />
                            </TabsContent>

                            {/* Tab de Notas e Termos */}
                            <TabsContent value="notes" className="mt-6">
                                <NotesTab control={form.control} />
                            </TabsContent>
                        </Tabs>

                        <div className="bg-background sticky bottom-0 flex items-center justify-between border-t p-4 shadow-lg">
                            <Button type="button" variant="outline" onClick={() => router.get('/admin/quotations')}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />A criar...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Criar Cotação
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
                    products={products}
                    onSelect={handleProductSelect}
                />

                {/* Formulário de Item */}
                <ItemForm
                    open={itemFormOpen}
                    onOpenChange={setItemFormOpen}
                    onSubmit={handleAddItem}
                    products={products}
                    warehouses={warehouses}
                    taxRates={taxRates}
                    units={units}
                    initialValues={editingItemIndex !== null ? fields[editingItemIndex] : undefined}
                    title={editingItemIndex !== null ? 'Editar Item' : 'Adicionar Item'}
                    isManualItemMode={editingItemIndex === null && !productSelectorOpen}
                />
            </div>
        </AppLayout>
    );
}
