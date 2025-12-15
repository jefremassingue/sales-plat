import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { Currency, Customer, DiscountType, Product, QuotationStatusOption, TaxRate, User, Warehouse } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Check, Copy, Loader2, Plus, Trash, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { formSchema, FormValues } from './_components/schema';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check as CheckIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
    quotationNumber: string;
    customers: Customer[];
    products: Product[];
    warehouses: Warehouse[];
    currencies: Currency[];
    defaultCurrency: Currency;
    taxRates: TaxRate[];
    statuses: QuotationStatusOption[];
    discountTypes: DiscountType[];
    users: User[];
}

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Cotações',
        href: '/admin/quotations',
    },
    {
        title: 'Nova Cotação (Alt)',
        href: '/admin/quotations/create-alternative',
    },
];

export default function CreateAlternative({
    quotationNumber,
    customers,
    products,
    warehouses,
    currencies,
    defaultCurrency,
    taxRates,
    users,
}: Props) {
    const { defaultWarehouse, auth } = usePage().props as any;
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { errors } = usePage().props as { errors?: Record<string, string | string[]> };

    // Dynamic lists for async search
    const [customerList, setCustomerList] = useState<Customer[]>(customers);
    const [productList, setProductList] = useState<Product[]>(products);
    const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
    const [productSearchLoading, setProductSearchLoading] = useState(false);

    // Search customers via API
    const searchCustomers = async (query: string) => {
        if (query.length < 1) {
            setCustomerList(customers);
            return;
        }
        setCustomerSearchLoading(true);
        try {
            const response = await fetch(`/admin/api/customers/search?search=${encodeURIComponent(query)}`);
            const data = await response.json();
            setCustomerList(data);
        } catch (error) {
            console.error('Error searching customers:', error);
        } finally {
            setCustomerSearchLoading(false);
        }
    };

    // Search products via API
    const searchProducts = async (query: string) => {
        if (query.length < 1) {
            setProductList(products);
            return;
        }
        setProductSearchLoading(true);
        try {
            const response = await fetch(`/admin/api/products/search?search=${encodeURIComponent(query)}`);
            const data = await response.json();
            setProductList(data);
        } catch (error) {
            console.error('Error searching products:', error);
        } finally {
            setProductSearchLoading(false);
        }
    };

    // Default dates
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + 7);

    const defaultTaxRate = taxRates.find((tax) => tax.is_default)?.value?.toString() || '16';
    const defaultWarehouseId = defaultWarehouse?.id?.toString() || (warehouses.length > 0 ? warehouses[0].id.toString() : "");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            quotation_number: quotationNumber,
            customer_id: '',
            user_id: auth.user.id.toString(),
            issue_date: today,
            expiry_date: expiryDate,
            status: 'draft',
            currency_code: defaultCurrency?.code || 'MZN',
            exchange_rate: defaultCurrency ? defaultCurrency.exchange_rate.toString() : '1.0000',
            include_tax: true,
            notes: '',
            terms: 'Esta cotação é válida por 7 dias. Pagamento 100% no acto da encomenda.',
            items: [
                {
                    product_id: '',
                    name: 'Novo Item',
                    quantity: '1',
                    unit_price: '0',
                    discount_percentage: '0',
                    tax_percentage: defaultTaxRate,
                    warehouse_id: defaultWarehouseId,
                    unit: 'un',
                }
            ],
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: 'items',
    });

    const watchCurrency = form.watch('currency_code');
    const watchItems = form.watch('items');

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
                    form.setError(`items.${parseInt(index)}.${field}` as any, {
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
            if (Object.keys(errors).length > 0) {
                 toast({
                    title: 'Erro',
                    description: 'Verifique os campos com erro.',
                    variant: 'destructive',
                });
            }
        }
    }, [errors, form, toast]);


    const calculateRawValues = (item: any) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        const discountPercentage = parseFloat(item.discount_percentage) || 0;
        const taxPercentage = parseFloat(item.tax_percentage) || 0;

        const subtotal = quantity * unitPrice;
        const discountAmount = subtotal * (discountPercentage / 100);
        const taxAmount = (subtotal - discountAmount) * (taxPercentage / 100);
        const total = subtotal - discountAmount + taxAmount;

        return { subtotal, discountAmount, taxAmount, total };
    };

    const calculateTotals = () => {
        let subtotal = 0;
        let taxAmount = 0;
        let discountAmount = 0;
        let total = 0;
        const includeTax = form.getValues('include_tax');

        watchItems.forEach((item) => {
             const values = calculateRawValues(item);
             subtotal += values.subtotal;
             taxAmount += values.taxAmount;
             discountAmount += values.discountAmount;
        });

        total = subtotal - discountAmount;
        if (includeTax) {
            total += taxAmount;
        }

        return { subtotal, taxAmount, discountAmount, total };
    };

    const totals = calculateTotals();

    const formatCurrency = (value: number) => {
         const selectedCurrencyCode = form.getValues('currency_code');
         const selectedCurrency = currencies.find((c) => c.code === selectedCurrencyCode) || defaultCurrency;

         if (!selectedCurrency) return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN' }).format(value);

        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: selectedCurrencyCode,
        }).format(value).replace('MZN', 'MT'); // Custom override if needed
    };

    const handleProductSelect = (index: number, productId: string) => {
        const selectedProduct = products.find((p) => p.id.toString() === productId);
        if (!selectedProduct) return;

        const currentItem = form.getValues(`items.${index}`);
        update(index, {
            ...currentItem,
            product_id: productId,
            name: selectedProduct.name, // Auto-fill name
            description: selectedProduct.description || '', // Auto-fill description if exists
            unit_price: selectedProduct.price.toString(),
            unit: selectedProduct.unit || 'un',
             // Keep existing tax rate, or update from product if product has specific tax logic (not here)
        });
    };

    const handleAddItem = () => {
        append({
            product_id: '',
            name: '',
            quantity: '1',
            unit_price: '0',
            discount_percentage: '0',
            tax_percentage: defaultTaxRate,
            warehouse_id: defaultWarehouseId,
            unit: 'un',
        });
    };

    const onSubmit = (values: FormValues) => {
        setIsSubmitting(true);
        if (values.items.length === 0) {
            toast({ title: 'Erro', description: 'Adicione pelo menos um item', variant: 'destructive' });
            setIsSubmitting(false);
            return;
        }

         const data = {
            ...values,
            user_id: values.user_id || null, // Ensure empty string becomes null
            exchange_rate: parseFloat(values.exchange_rate),
            issue_date: format(values.issue_date, 'yyyy-MM-dd'),
            expiry_date: values.expiry_date ? format(values.expiry_date, 'yyyy-MM-dd') : null,
            items: values.items.map((item) => {
                const calcs = calculateRawValues(item);
                return {
                ...item,
                quantity: parseFloat(item.quantity),
                unit_price: parseFloat(item.unit_price),
                discount_percentage: item.discount_percentage ? parseFloat(item.discount_percentage) : 0,
                tax_percentage: item.tax_percentage ? parseFloat(item.tax_percentage) : 0,
                // Include calculated values for backend convenience if needed, though usually backend recalculates
                subtotal: calcs.subtotal.toFixed(2),
                discount_amount: calcs.discountAmount.toFixed(2),
                tax_amount: calcs.taxAmount.toFixed(2),
                total: calcs.total.toFixed(2),
            }}),
        };

        router.post('/admin/quotations', data as any, {
            onSuccess: () => {
                setIsSubmitting(false);
                toast({ title: 'Sucesso', description: 'Cotação criada com sucesso.', variant: 'success' });
            },
            onError: () => {
                setIsSubmitting(false);
                toast({ title: 'Erro', description: 'Verifique os erros no formulário.', variant: 'destructive' });
            },
        });
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nova Cotação Alternativa" />
            <div className="flex h-[calc(100vh-65px)] flex-col">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
                        
                        {/* Header Section - Always visible */}
                        <div className="bg-background border-b p-4">
                            <div className="mb-4 flex items-center gap-4">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href="/admin/quotations">
                                        <ArrowLeft className="h-5 w-5" />
                                    </Link>
                                </Button>
                                <h1 className="text-xl font-bold">Nova Cotação</h1>
                                <div className="ml-auto flex items-center gap-2">
                                     <span className="text-sm text-muted-foreground hidden sm:inline-block">Cotação #:</span>
                                     <span className="font-mono bg-muted px-2 py-1 rounded text-sm">{quotationNumber || 'AUTO'}</span>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-4">
                                <FormField
                                    control={form.control}
                                    name="customer_id"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={cn(
                                                                "w-full justify-between",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value
                                                                ? customerList.find((customer) => customer.id.toString() === field.value)?.name || customers.find((c) => c.id.toString() === field.value)?.name
                                                                : "Selecionar Cliente"}
                                                            <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[300px] p-0">
                                                    <Command shouldFilter={false}>
                                                        <CommandInput 
                                                            placeholder="Buscar cliente..." 
                                                            onValueChange={(value) => searchCustomers(value)}
                                                        />
                                                        <CommandList>
                                                            {customerSearchLoading ? (
                                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                                                    Carregando...
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {customerList.map((customer) => (
                                                                            <CommandItem
                                                                                value={customer.name}
                                                                                key={customer.id}
                                                                                onSelect={() => {
                                                                                    form.setValue("customer_id", customer.id.toString());
                                                                                }}
                                                                            >
                                                                                <CheckIcon
                                                                                    className={cn(
                                                                                        "mr-2 h-4 w-4",
                                                                                        customer.id.toString() === field.value ? "opacity-100" : "opacity-0"
                                                                                    )}
                                                                                />
                                                                                {customer.name}
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </>
                                                            )}
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="issue_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input type="date" value={field.value ? format(field.value, 'yyyy-MM-dd') : ''} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="currency_code"
                                    render={({ field }) => (
                                        <FormItem>
                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Moeda" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {currencies.map((currency) => (
                                                        <SelectItem key={currency.code} value={currency.code}>
                                                            {currency.code}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                         {/* Scrollable Items Area */}
                        <div className="flex-1 overflow-auto bg-muted/10 p-2 md:p-4">
                            {/* Desktop Table Header */}
                             <div className="hidden md:grid grid-cols-12 gap-2 mb-2 px-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                <div className="col-span-4">Produto/Descrição</div>
                                <div className="col-span-1 text-center">Qtd</div>
                                <div className="col-span-2 text-right">Preço Un.</div>
                                <div className="col-span-1 text-center">% Desc</div>
                                <div className="col-span-1 text-center">% Imp</div>
                                <div className="col-span-2 text-right">Total</div>
                                <div className="col-span-1 text-center"></div>
                            </div>

                            <div className="space-y-2">
                                {fields.map((item, index) => {
                                     const currentItem = watchItems?.[index] || item;
                                     const rawValues = calculateRawValues(currentItem);
                                    return (
                                        <div key={item.id} className="group relative bg-background border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                            {/* Desktop Layout */}
                                            <div className="hidden md:grid grid-cols-12 gap-2 p-2 items-center">
                                                 <div className="col-span-4 flex flex-col gap-1">
                                                     {/* Product Select Combo */}
                                                     <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                role="combobox"
                                                                className={cn(
                                                                    "w-full justify-start h-8 px-2 font-normal truncate",
                                                                    !watchItems[index]?.product_id && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {watchItems[index]?.product_id
                                                                    ? productList.find(p => p.id.toString() === watchItems[index].product_id)?.name || products.find(p => p.id.toString() === watchItems[index].product_id)?.name || watchItems[index].name
                                                                    : (watchItems[index].name || "Buscar Produto...")}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[400px] p-0" align="start">
                                                            <Command shouldFilter={false}>
                                                                <CommandInput 
                                                                    placeholder="Buscar produto..." 
                                                                    onValueChange={(value) => searchProducts(value)}
                                                                />
                                                                <CommandList>
                                                                    {productSearchLoading ? (
                                                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                                                            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                                                            Carregando...
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                                                                            <CommandGroup>
                                                                                {productList.map((product) => (
                                                                                    <CommandItem
                                                                                        key={product.id}
                                                                                        value={product.name}
                                                                                        onSelect={() => handleProductSelect(index, product.id.toString())}
                                                                                    >
                                                                                        <div className="flex flex-col">
                                                                                            <span>{product.name}</span>
                                                                                            <span className="text-xs text-muted-foreground">{product.sku} - {product.price}</span>
                                                                                        </div>
                                                                                    </CommandItem>
                                                                                ))}
                                                                            </CommandGroup>
                                                                        </>
                                                                    )}
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                    {/* Textarea for details/name override */}
                                                    <Input
                                                        {...form.register(`items.${index}.name`)}
                                                        placeholder="Nome/Descrição do item"
                                                        className="h-7 border-0 bg-transparent focus-visible:ring-0 focus-visible:bg-muted/50 px-2"
                                                    />
                                                 </div>
                                                 <div className="col-span-1">
                                                     <Input
                                                        type="number"
                                                        {...form.register(`items.${index}.quantity`)}
                                                        className="h-8 text-center"
                                                        min="0"
                                                        step="0.01"
                                                     />
                                                 </div>
                                                 <div className="col-span-2">
                                                     <Input
                                                        type="number"
                                                        {...form.register(`items.${index}.unit_price`)}
                                                        className="h-8 text-right"
                                                        min="0"
                                                        step="0.01"
                                                     />
                                                 </div>
                                                  <div className="col-span-1">
                                                     <Input
                                                        type="number"
                                                        {...form.register(`items.${index}.discount_percentage`)}
                                                        className="h-8 text-center"
                                                        min="0"
                                                        max="100"
                                                     />
                                                 </div>
                                                 <div className="col-span-1">
                                                     <Input
                                                        type="number"
                                                        {...form.register(`items.${index}.tax_percentage`)}
                                                        className="h-8 text-center"
                                                        min="0"
                                                     />
                                                 </div>
                                                 <div className="col-span-2 text-right font-medium px-2">
                                                     {formatCurrency(rawValues.total)}
                                                 </div>
                                                 <div className="col-span-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(index)} type="button">
                                                         <Trash className="h-4 w-4" />
                                                     </Button>
                                                 </div>
                                            </div>

                                            {/* Mobile Layout (Card) */}
                                            <div className="md:hidden p-3 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 mr-2">
                                                        <Label className="text-xs text-muted-foreground">Produto / Descrição</Label>
                                                          <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    role="combobox"
                                                                    className={cn(
                                                                        "w-full justify-start h-9 text-left font-normal mb-1",
                                                                        !watchItems[index]?.product_id && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    <span className="truncate">
                                                                       {watchItems?.[index]?.product_id
                                                                        ? productList.find(p => p.id.toString() === watchItems[index].product_id)?.name || products.find(p => p.id.toString() === watchItems[index].product_id)?.name || watchItems[index].name
                                                                        : "Buscar Produto..."}
                                                                    </span>
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-[300px] p-0" align="start">
                                                                <Command shouldFilter={false}>
                                                                    <CommandInput 
                                                                        placeholder="Buscar produto..." 
                                                                        onValueChange={(value) => searchProducts(value)}
                                                                    />
                                                                    <CommandList>
                                                                        {productSearchLoading ? (
                                                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                                                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                                                                Carregando...
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                                                                                <CommandGroup>
                                                                                    {productList.map((product) => (
                                                                                        <CommandItem
                                                                                            key={product.id}
                                                                                            value={product.name}
                                                                                            onSelect={() => handleProductSelect(index, product.id.toString())}
                                                                                        >
                                                                                           {product.name}
                                                                                        </CommandItem>
                                                                                    ))}
                                                                                </CommandGroup>
                                                                            </>
                                                                        )}
                                                                    </CommandList>
                                                                </Command>
                                                            </PopoverContent>
                                                        </Popover>
                                                        <Input {...form.register(`items.${index}.name`)} placeholder="Nome do item" className="h-8" />
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive -mt-1 -mr-1" onClick={() => remove(index)} type="button">
                                                         <X className="h-4 w-4" />
                                                     </Button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Qtd</Label>
                                                        <Input type="number" {...form.register(`items.${index}.quantity`)} className="h-9" step="0.01" />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Preço Un.</Label>
                                                        <Input type="number" {...form.register(`items.${index}.unit_price`)} className="h-9" step="0.01" />
                                                    </div>
                                                </div>

                                                 <div className="grid grid-cols-3 gap-2">
                                                     <div>
                                                        <Label className="text-xs text-muted-foreground">Desc %</Label>
                                                        <Input type="number" {...form.register(`items.${index}.discount_percentage`)} className="h-8 px-1 text-center" />
                                                    </div>
                                                     <div>
                                                        <Label className="text-xs text-muted-foreground">IVA %</Label>
                                                        <Input type="number" {...form.register(`items.${index}.tax_percentage`)} className="h-8 px-1 text-center" />
                                                    </div>
                                                    <div className="flex flex-col justify-end text-right">
                                                         <span className="text-xs text-muted-foreground">Total</span>
                                                         <span className="font-bold">{formatCurrency(rawValues.total)}</span>
                                                    </div>
                                                 </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full mt-4 border-dashed"
                                onClick={handleAddItem}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Adicionar Item
                            </Button>

                             {/* Mobile Totals Card */}
                            <div className="md:hidden mt-6 bg-card rounded-lg border p-4">
                                 <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{formatCurrency(totals.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Descontos</span>
                                        <span>{formatCurrency(totals.discountAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Impostos</span>
                                        <span>{formatCurrency(totals.taxAmount)}</span>
                                    </div>
                                    <Separator className="my-2"/>
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>{formatCurrency(totals.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Footer Section - Sticky at bottom */}
                        <div className="bg-background border-t p-4 z-10 shadow-lg">
                            <div className="flex flex-col md:flex-row gap-4 md:items-start">
                                {/* Desktop Totals & Notes */}
                                <div className="hidden md:flex flex-1 gap-6">
                                     <div className="flex-1">
                                         <Label>Notas/Termos</Label>
                                         <Textarea 
                                            {...form.register('notes')} 
                                            placeholder="Notas internas ou visíveis para o cliente..." 
                                            className="h-20 resize-none mt-1"
                                         />
                                     </div>
                                     <div className="w-64 space-y-1 text-right">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal:</span>
                                            <span>{formatCurrency(totals.subtotal)}</span>
                                        </div>
                                         <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Desconto:</span>
                                            <span>{formatCurrency(totals.discountAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Imposto:</span>
                                            <span>{formatCurrency(totals.taxAmount)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                            <span>Total:</span>
                                            <span>{formatCurrency(totals.total)}</span>
                                        </div>
                                     </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 md:self-end">
                                     <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 md:flex-none"
                                        onClick={() => router.visit('/admin/quotations')}
                                        disabled={isSubmitting}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="flex-1 md:flex-none min-w-[150px]" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                        Salvar Cotação
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                 </Form>
            </div>
        </AppLayout>
    );
}
