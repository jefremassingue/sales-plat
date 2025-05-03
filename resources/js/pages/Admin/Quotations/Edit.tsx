import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ArrowLeft, CalendarIcon, Check, CreditCard, Loader2, Minus, Package, Plus, Trash, User } from 'lucide-react';
import Pencil from './_components/Pencil';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Customer, Currency, Product, ProductVariant, Warehouse, QuotationStatus, TaxRate, DiscountType, Quotation } from './_components/types';
import ProductSelector from './_components/ProductSelector';
import ItemForm, { ItemFormValues } from './_components/ItemForm';

interface Props {
  quotation: Quotation;
  customers: Customer[];
  products: Product[];
  warehouses: Warehouse[];
  currencies: Currency[];
  taxRates: TaxRate[];
  statuses: QuotationStatus[];
  discountTypes: DiscountType[];
}

// Schema de validação do formulário (mesmo do Create)
const formSchema = z.object({
  quotation_number: z.string().min(1, { message: "Número da cotação é obrigatório" }),
  customer_id: z.string().optional(),
  issue_date: z.date({ required_error: "Data de emissão é obrigatória" }),
  expiry_date: z.date().optional().nullable(),
  status: z.enum(['draft', 'sent', 'approved', 'rejected']),
  currency_code: z.string().min(1, { message: "Moeda é obrigatória" }),
  exchange_rate: z.string().min(1, { message: "Taxa de câmbio é obrigatória" })
    .refine(val => !isNaN(parseFloat(val)), { message: "Deve ser um número válido" })
    .refine(val => parseFloat(val) > 0, { message: "Deve ser maior que zero" }),
  include_tax: z.boolean().default(true),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(
    z.object({
      id: z.number().optional(),
      product_id: z.string().optional(),
      product_variant_id: z.string().optional(),
      warehouse_id: z.string().optional(),
      name: z.string().min(1, { message: "Nome é obrigatório" }),
      description: z.string().optional(),
      quantity: z.string().min(1, { message: "Quantidade é obrigatória" })
        .refine(val => !isNaN(parseFloat(val)), { message: "Deve ser um número válido" })
        .refine(val => parseFloat(val) > 0, { message: "Deve ser maior que zero" }),
      unit: z.string().optional(),
      unit_price: z.string().min(1, { message: "Preço é obrigatório" })
        .refine(val => !isNaN(parseFloat(val)), { message: "Deve ser um número válido" })
        .refine(val => parseFloat(val) >= 0, { message: "Não pode ser negativo" }),
      discount_percentage: z.string().optional()
        .refine(val => val === '' || !isNaN(parseFloat(val)), { message: "Deve ser um número válido" })
        .refine(val => val === '' || parseFloat(val) >= 0, { message: "Não pode ser negativo" })
        .refine(val => val === '' || parseFloat(val) <= 100, { message: "Deve ser no máximo 100%" }),
      tax_percentage: z.string().optional()
        .refine(val => val === '' || !isNaN(parseFloat(val)), { message: "Deve ser um número válido" })
        .refine(val => val === '' || parseFloat(val) >= 0, { message: "Não pode ser negativo" }),
    })
  ).min(1, { message: "Adicione pelo menos 1 item à cotação" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Edit({
  quotation,
  customers,
  products,
  warehouses,
  currencies,
  taxRates,
  statuses,
  discountTypes
}: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productSelectorOpen, setProductSelectorOpen] = useState(false);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("items");
  const { errors } = usePage().props as any;

  // Breadcrumbs dinâmicos
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
      title: quotation.quotation_number,
      href: `/admin/quotations/${quotation.id}`,
    },
    {
      title: 'Editar',
      href: `/admin/quotations/${quotation.id}/edit`,
    },
  ];

  // Mapear os itens da cotação para o formato do formulário
  const mapItemsToFormValues = () => {
    return quotation.items?.map(item => ({
      id: item.id,
      product_id: item.product_id ? item.product_id.toString() : undefined,
      product_variant_id: item.product_variant_id ? item.product_variant_id.toString() : undefined,
      warehouse_id: item.warehouse_id ? item.warehouse_id.toString() : undefined,
      name: item.name,
      description: item.description || '',
      quantity: item.quantity.toString(),
      unit: item.unit || 'unit',
      unit_price: item.unit_price.toString(),
      discount_percentage: item.discount_percentage ? item.discount_percentage.toString() : '0',
      tax_percentage: item.tax_percentage ? item.tax_percentage.toString() : '0',
    })) || [];
  };

  // Inicializar o formulário com os dados da cotação
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quotation_number: quotation.quotation_number,
      customer_id: quotation.customer_id ? quotation.customer_id.toString() : '',
      issue_date: new Date(quotation.issue_date),
      expiry_date: quotation.expiry_date ? new Date(quotation.expiry_date) : null,
      status: quotation.status,
      currency_code: quotation.currency_code,
      exchange_rate: quotation.exchange_rate.toString(),
      include_tax: quotation.include_tax,
      notes: quotation.notes || '',
      terms: quotation.terms || '',
      items: mapItemsToFormValues(),
    },
  });

  // Field array para manipular os itens da cotação
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Selecionar a taxa de câmbio quando a moeda muda
  const watchCurrency = form.watch('currency_code');

  useEffect(() => {
    const selectedCurrency = currencies.find(c => c.code === watchCurrency);
    if (selectedCurrency) {
      form.setValue('exchange_rate', selectedCurrency.exchange_rate.toString());
    }
  }, [watchCurrency, currencies, form]);

  // Mapear erros do Laravel para os erros do formulário
  useEffect(() => {
    if (errors) {
      Object.keys(errors).forEach(key => {
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
    const selectedProduct = products.find(p => p.id.toString() === productId);
    if (!selectedProduct) return;

    // Abrir o formulário de item com valores pré-preenchidos
    const initialValues: ItemFormValues = {
      product_id: productId,
      name: selectedProduct.name,
      quantity: '1',
      unit_price: selectedProduct.price.toString(),
      unit: 'unit',
      discount_percentage: '0',
      tax_percentage: '17', // Taxa padrão de IVA em Moçambique
    };

    // Se estiver editando um item existente
    if (editingItemIndex !== null) {
      update(editingItemIndex, initialValues);
    } else {
      // Adicionar novo item
      append(initialValues);
    }

    setItemFormOpen(true);
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

  // Calcular totais da cotação
  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;
    let total = 0;

    fields.forEach((item) => {
      const values = calculateItemValues(item);
      subtotal += parseFloat(values.subtotal);
      taxAmount += parseFloat(values.tax_amount);
      discountAmount += parseFloat(values.discount_amount);
    });

    total = subtotal - discountAmount;
    if (form.getValues('include_tax')) {
      total += taxAmount;
    }

    return {
      subtotal,
      taxAmount,
      discountAmount,
      total,
    };
  };

  const totals = calculateTotals();

  // Função para submeter o formulário
  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);

    // Converter tipos de dados antes de enviar
    const data = {
      ...values,
      _method: 'PUT',
      customer_id: values.customer_id ? parseInt(values.customer_id) : null,
      exchange_rate: parseFloat(values.exchange_rate),
      issue_date: format(values.issue_date, 'yyyy-MM-dd'),
      expiry_date: values.expiry_date ? format(values.expiry_date, 'yyyy-MM-dd') : null,
      items: values.items.map(item => ({
        ...item,
        product_id: item.product_id ? parseInt(item.product_id) : null,
        product_variant_id: item.product_variant_id ? parseInt(item.product_variant_id) : null,
        warehouse_id: item.warehouse_id ? parseInt(item.warehouse_id) : null,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
        discount_percentage: item.discount_percentage ? parseFloat(item.discount_percentage) : 0,
        tax_percentage: item.tax_percentage ? parseFloat(item.tax_percentage) : 0,
        // Incluir os valores calculados
        ...calculateItemValues(item)
      })),
    };

    router.post(`/admin/quotations/${quotation.id}`, data, {
      onSuccess: () => {
        setIsSubmitting(false);
        toast({
          title: "Cotação atualizada",
          description: "A cotação foi atualizada com sucesso.",
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

  // Formatar valor monetário baseado na moeda selecionada
  const formatCurrency = (value: number | null | undefined, withSymbol = true) => {
    if (value === null || value === undefined) return 'N/A';

    const selectedCurrencyCode = form.getValues('currency_code');
    const selectedCurrency = currencies.find(c => c.code === selectedCurrencyCode);

    if (!selectedCurrency) {
      return new Intl.NumberFormat('pt-PT', {
        style: withSymbol ? 'currency' : 'decimal',
        currency: 'MZN'
      }).format(value);
    }

    const { decimal_separator, thousand_separator, decimal_places, symbol } = selectedCurrency;

    const formattedValue = value.toFixed(decimal_places)
      .replace('.', 'DECIMAL')
      .replace(/\B(?=(\d{3})+(?!\d))/g, thousand_separator)
      .replace('DECIMAL', decimal_separator);

    return withSymbol ? `${symbol} ${formattedValue}` : formattedValue;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar Cotação ${quotation.quotation_number}`} />

      <div className="container px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/quotations/${quotation.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Editar Cotação {quotation.quotation_number}</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
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
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cliente e Datas</CardTitle>
                      <CardDescription>
                        Informações do cliente e datas da cotação
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="quotation_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número da Cotação <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Número único de identificação da cotação
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customer_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cliente</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um cliente (opcional)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {customers.map(customer => (
                                  <SelectItem key={customer.id} value={customer.id.toString()}>
                                    {customer.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Cliente para quem esta cotação é direcionada
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="issue_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Data de Emissão <span className="text-destructive">*</span></FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "dd/MM/yyyy", { locale: pt })
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
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                Data em que a cotação foi emitida
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

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
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "dd/MM/yyyy", { locale: pt })
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
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                Data até quando a cotação é válida
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Informações Adicionais</CardTitle>
                      <CardDescription>
                        Configurações de moeda e status da cotação
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado da Cotação <span className="text-destructive">*</span></FormLabel>
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
                                {statuses.filter(s => ['draft', 'sent', 'approved', 'rejected'].includes(s.value)).map(status => (
                                  <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Estado atual desta cotação
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currency_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Moeda <span className="text-destructive">*</span></FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma moeda" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {currencies.map(currency => (
                                  <SelectItem key={currency.code} value={currency.code}>
                                    {currency.name} ({currency.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Moeda utilizada nesta cotação
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="exchange_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Taxa de Câmbio <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0.0001" step="0.0001" />
                            </FormControl>
                            <FormDescription>
                              Taxa de câmbio em relação à moeda base
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="include_tax"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Incluir Imposto</FormLabel>
                              <FormDescription>
                                Incluir o valor do imposto no total da cotação
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab de Itens */}
              <TabsContent value="items" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Itens da Cotação</CardTitle>
                        <CardDescription>
                          Produtos ou serviços incluídos nesta cotação
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => {
                            setEditingItemIndex(null);
                            setItemFormOpen(true);
                          }}
                          variant="outline"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Item Manual
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setEditingItemIndex(null);
                            setProductSelectorOpen(true);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Produto
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[300px]">Produto</TableHead>
                            <TableHead>Armazém</TableHead>
                            <TableHead className="text-right">Quantidade</TableHead>
                            <TableHead className="text-right">Preço</TableHead>
                            <TableHead className="text-right">Desconto</TableHead>
                            <TableHead className="text-right">Imposto</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-center w-[100px]">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fields.length > 0 ? (
                            fields.map((item, index) => {
                              const values = calculateItemValues(item);
                              return (
                                <TableRow key={item.id}>
                                  <TableCell className="font-medium">
                                    {item.name}
                                    {item.description && (
                                      <div className="text-sm text-muted-foreground">
                                        {item.description.length > 50
                                          ? `${item.description.substring(0, 50)}...`
                                          : item.description}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {item.warehouse_id ? (
                                      warehouses.find(w => w.id.toString() === item.warehouse_id)?.name || 'N/A'
                                    ) : (
                                      <span className="text-muted-foreground">Não definido</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {parseFloat(item.quantity).toFixed(2)} {item.unit || 'un'}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(parseFloat(item.unit_price))}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {item.discount_percentage && parseFloat(item.discount_percentage) > 0
                                      ? `${parseFloat(item.discount_percentage).toFixed(2)}%`
                                      : '-'}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {item.tax_percentage && parseFloat(item.tax_percentage) > 0
                                      ? `${parseFloat(item.tax_percentage).toFixed(2)}%`
                                      : '-'}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatCurrency(parseFloat(values.total))}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex justify-center gap-1">
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleEditItem(index)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleRemoveItem(index)}
                                        className="text-destructive"
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} className="h-24 text-center">
                                Nenhum item adicionado à cotação.
                                <div className="mt-2 flex justify-center gap-2">
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      setEditingItemIndex(null);
                                      setItemFormOpen(true);
                                    }}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Item Manual
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      setEditingItemIndex(null);
                                      setProductSelectorOpen(true);
                                    }}
                                    size="sm"
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Adicionar Produto
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Totais */}
                    {fields.length > 0 && (
                      <div className="mt-4 flex justify-end">
                        <div className="w-64">
                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatCurrency(totals.subtotal)}</span>
                          </div>

                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Desconto</span>
                            <span>{formatCurrency(totals.discountAmount)}</span>
                          </div>

                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">
                              IVA ({form.getValues('include_tax') ? "incluído" : "excluído"})
                            </span>
                            <span>{formatCurrency(totals.taxAmount)}</span>
                          </div>

                          <div className="flex justify-between py-2 font-medium">
                            <span>Total</span>
                            <span>{formatCurrency(totals.total)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab de Notas e Termos */}
              <TabsContent value="notes" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notas</CardTitle>
                      <CardDescription>
                        Notas adicionais para a cotação
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notas</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Notas adicionais para o cliente"
                                className="min-h-[200px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Estas notas serão visíveis na cotação
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Termos e Condições</CardTitle>
                      <CardDescription>
                        Termos e condições da cotação
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="terms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Termos e Condições</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Termos e condições da cotação"
                                className="min-h-[200px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Termos legais, condições de pagamento, prazos de entrega, etc.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <div className="sticky bottom-0 p-4 border-t bg-background shadow-lg flex justify-end items-center mt-8 gap-4">
              <div className="flex-1">
                {fields.length > 0 && (
                  <div className="bg-muted p-2 rounded flex justify-between items-center">
                    <span className="text-sm">
                      Total da cotação: <span className="font-bold">{formatCurrency(totals.total)}</span>
                    </span>
                    <span className="text-sm">
                      Itens: <span className="font-bold">{fields.length}</span>
                    </span>
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.get(`/admin/quotations/${quotation.id}`)}
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
                    Guardar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Seletor de Produtos */}
      <ProductSelector
        open={productSelectorOpen}
        onOpenChange={setProductSelectorOpen}
        products={products}
        onSelect={handleProductSelect}
      />

      {/* Formulário de Item */}
      {itemFormOpen && (
        <ItemForm
          open={itemFormOpen}
          onOpenChange={setItemFormOpen}
          onSubmit={handleAddItem}
          products={products}
          warehouses={warehouses}
          taxRates={taxRates}
          initialValues={editingItemIndex !== null ? fields[editingItemIndex] : undefined}
          title={editingItemIndex !== null ? 'Editar Item' : 'Adicionar Item'}
        />
      )}
    </AppLayout>
  );
}
