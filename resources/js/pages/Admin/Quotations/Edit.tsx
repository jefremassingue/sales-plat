import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Customer, type SaleStatus as QuotationStatus, type User, type Warehouse } from '@/types/index';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Check, CreditCard, Loader2, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import DetailsTab from './_components/DetailsTab';
import ItemForm, { ItemFormValues } from './_components/ItemForm';
import ItemsTab from './_components/ItemsTab';
import NotesTab from './_components/NotesTab';
import ProductSelector from './_components/ProductSelector';
import { Currency, DiscountType, Product, TaxRate, QuotationStatusOption } from '@/types';

interface Props {
    quotation: {
        id: string;
        quotation_number: string;
        customer_id: string | null;
        user_id: string | null;
        issue_date: string;
        expiry_date: string | null;
        status: string;
        currency_code: string;
        exchange_rate: number;
        include_tax: boolean;
        notes: string | null;
        terms: string | null;
        items: {
            id: string;
            product_id: string | null;
            product_variant_id: string | null;
            product_color_id: string | null;
            product_size_id: string | null;
            warehouse_id: string | null;
            name: string;
            description: string | null;
            quantity: string;
            unit: string | null;
            unit_price: string;
            discount_percentage: string;
            tax_percentage: string;
        }[];
    };
    customers: Customer[];
    products: Product[];
    warehouses: Warehouse[];
    currencies: Currency[];
    defaultCurrency: Currency;
    taxRates: TaxRate[];
    units: { value: string; label: string }[];
    statuses: QuotationStatusOption[];
    discountTypes: DiscountType[];
    users: User[];
}

// Schema de validação do formulário
import { formSchema, FormValues } from './_components/schema';

export default function Edit({
    quotation,
    customers,
    products,
    warehouses,
    currencies,
    defaultCurrency,
    taxRates,
    statuses,
    units,
    discountTypes,
    users,
}: Props) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productSelectorOpen, setProductSelectorOpen] = useState(false);
    const [itemFormOpen, setItemFormOpen] = useState(false);
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState('items');
    const { errors } = usePage().props as any;

    // Construir breadcrumbs com base na cotação atual
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
            title: `#${quotation.quotation_number}`,
            href: `/admin/quotations/${quotation.id}/edit`,
        },
    ];

    // Preparar dados iniciais do formulário
    const issueDate = new Date(quotation.issue_date);
    const expiryDate = quotation.expiry_date ? new Date(quotation.expiry_date) : null;

    // Inicializar o formulário
    // Garantir que status seja sempre um dos valores válidos
    const validStatuses = ['draft', 'sent', 'approved', 'rejected'];
    const initialStatus = validStatuses.includes(quotation.status) ? quotation.status : 'draft';
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quotation_number: quotation.quotation_number,
            customer_id: quotation.customer_id ? quotation.customer_id : '',
            user_id: quotation.user_id ? quotation.user_id : '',
            issue_date: issueDate,
            expiry_date: expiryDate,
            status: initialStatus as any,
            currency_code: quotation.currency_code,
            exchange_rate: quotation.exchange_rate.toString(),
            include_tax: quotation.include_tax,
            notes: quotation.notes,
            terms: quotation.terms,
            items: quotation.items.map((item) => ({
                id: item.id,
                product_id: item.product_id ? item.product_id : undefined,
                product_color_id: item.product_color_id ? item.product_color_id : undefined,
                product_size_id: item.product_size_id ? item.product_size_id : undefined,
                product_variant_id: item.product_variant_id ? item.product_variant_id : undefined,
                warehouse_id: item.warehouse_id ? item.warehouse_id : undefined,
                name: item.name,
                description: item.description || '',
                quantity: item.quantity.toString(),
                unit: item.unit || undefined,
                unit_price: item.unit_price.toString(),
                discount_percentage: item.discount_percentage.toString(),
                tax_percentage: item.tax_percentage.toString(),
            })),
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
                    form.setError(`items.${parseInt(index)}.${field}` as any, {
                        type: 'manual',
                        message: Array.isArray(errors[key]) ? errors[key][0] : errors[key],
                    });
                } else {
                    form.setError(key as any, {
                        type: 'manual',
                        message: Array.isArray(errors[key]) ? errors[key][0] : errors[key],
                    });
                }
            });
        }
    }, [errors, form]);

    // Lidar com a seleção de um produto no seletor
    const handleProductSelect = (productId: string) => {
        setProductSelectorOpen(false);

        // Obter o produto selecionado
        const selectedProduct = products.find((p) => p.id.toString() === productId);
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
            const newItem = {
                product_id: productId,
                name: selectedProduct.name,
                quantity: '1',
                unit_price: selectedProduct.price.toString(),
                unit: selectedProduct.unit || 'unit', // Usar a unidade do produto
                discount_percentage: '0',
                tax_percentage: String(taxRates.find((tax) => tax.is_default == true)?.value || 16), // Taxa padrão de IVA em Moçambique
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
        // Sanitize item to convert nulls to undefined for useFieldArray compatibility
        const cleanItem = Object.fromEntries(
            Object.entries(item).map(([key, value]) => [key, value === null ? undefined : value])
        ) as ItemFormValues;

        if (editingItemIndex !== null) {
            // Atualizar item existente
            update(editingItemIndex, cleanItem);
            setEditingItemIndex(null);
        } else {
            // Adicionar novo item
            append(cleanItem);
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

        try {
            // Converter tipos de dados antes de enviar
            const data = {
                ...values,
                customer_id: values.customer_id ? values.customer_id : null,
                user_id: values.user_id ? values.user_id : null,
                exchange_rate: parseFloat(values.exchange_rate),
                issue_date: format(values.issue_date, 'yyyy-MM-dd'),
                expiry_date: values.expiry_date ? format(values.expiry_date, 'yyyy-MM-dd') : null,
                notes: values.notes ?? '',
                terms: values.terms ?? '',
                items: values.items.map((item) => {
                    const mappedItem = {
                        ...item,
                        product_id: item.product_id ? item.product_id : null,
                        product_variant_id: item.product_variant_id ? item.product_variant_id : null,
                        product_color_id: item.product_color_id ? item.product_color_id : null,
                        product_size_id: item.product_size_id ? item.product_size_id : null,
                        warehouse_id: item.warehouse_id ? item.warehouse_id : null,
                        description: item.description ?? '',
                        quantity: parseFloat(item.quantity),
                        unit_price: parseFloat(item.unit_price),
                        discount_percentage: item.discount_percentage ? parseFloat(item.discount_percentage) : 0,
                        tax_percentage: item.tax_percentage ? parseFloat(item.tax_percentage) : 0,
                        // Incluir os valores calculados
                        ...calculateItemValues(item),
                    };
                    // Só incluir id se existir
                    if (item.id) mappedItem.id = item.id;
                    return mappedItem;
                }),
            };

            router.put(`/admin/quotations/${quotation.id}`, data, {
                onSuccess: () => {
                    setIsSubmitting(false);
                    toast({
                        title: 'Cotação atualizada',
                        description: 'A cotação foi atualizada com sucesso.',
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
        } catch (error) {
            setIsSubmitting(false);
            toast({
                title: 'Erro',
                description: 'Ocorreu um erro ao processar o formulário.',
                variant: 'destructive',
            });
            console.error('Erro ao submeter formulário:', error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Cotação #${quotation.quotation_number}`} />

            <div className="container px-4 py-6">
                <div className="mb-6 flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/quotations">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Editar Cotação #{quotation.quotation_number}</h1>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit, (formErrors) => {
                            // Mostrar todos os erros no console
                            console.log('Zod validation errors:', formErrors);
                            // Extrair a primeira mensagem de erro
                            const errorList = Object.values(formErrors);
                            let firstMessage = 'Preencha todos os campos obrigatórios.';
                            if (errorList.length > 0) {
                                const firstError = errorList[0];
                                if (firstError && typeof firstError === 'object' && 'message' in firstError) {
                                    firstMessage = (firstError as { message: string }).message;
                                }
                            }
                            toast({
                                title: 'Erro de validação',
                                description: firstMessage,
                                variant: 'destructive',
                            });
                        })}
                        className="space-y-8"
                    >
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
                                <DetailsTab control={form.control} customers={customers} currencies={currencies} statuses={statuses} users={users} />
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
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />A guardar...
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

                {/* Modal de Seleção de Produto */}
                <ProductSelector
                    open={productSelectorOpen}
                    onOpenChange={setProductSelectorOpen}
                    products={products}
                    onSelect={handleProductSelect}
                    onAddItemManual={() => {
                        setProductSelectorOpen(false);
                        setEditingItemIndex(null);
                        setItemFormOpen(true);
                    }}
                    setOnSearch={() => {}} // Placeholder as we might not need search state here or use a local state
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
                    initialValues={editingItemIndex !== null ? (fields[editingItemIndex] as any) : undefined}
                    title={editingItemIndex !== null ? 'Editar Item' : 'Adicionar Item'}
                    isManualItemMode={editingItemIndex === null && !productSelectorOpen}
                    setOnSearch={() => {}} 
                />
            </div>
        </AppLayout>
    );
}
