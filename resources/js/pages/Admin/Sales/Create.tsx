import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ArrowLeft, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';

// Importar os componentes
import ProductCatalog from './_components/ProductCatalog';
import ShoppingCartComponent from './_components/ShoppingCart';
import SaleSummary from './_components/SaleSummary';
import SaleDetails from './_components/SaleDetails';
import ItemEditDialog from './_components/ItemEditDialog';
import ManualItemDialog from './_components/ManualItemDialog';

// Schema de validação para o formulário
const formSchema = z.object({
  sale_number: z.string().optional().nullable(),
  customer_id: z.string().optional(),
  issue_date: z.date({ required_error: "Data de emissão é obrigatória" }),
  due_date: z.date().optional().nullable(),
  status: z.enum(['draft', 'pending', 'paid', 'partial']),
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
  ).min(1, { message: "Adicione pelo menos 1 item à venda" }),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  salePlaceholder: string;
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
  quotation?: any; // Para quando estamos convertendo uma cotação
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Vendas', href: '/admin/sales' },
  { title: 'Ponto de Venda', href: '/admin/sales/create' },
];

export default function Create({
  salePlaceholder,
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
  quotation
}: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeView, setActiveView] = useState<'products' | 'details'>('products');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(
    warehouses.length > 0 ? warehouses[0].id.toString() : "");
  const [itemBeingEdited, setItemBeingEdited] = useState<any | null>(null);
  const [itemEditDialogOpen, setItemEditDialogOpen] = useState(false);
  const [manualItemDialogOpen, setManualItemDialogOpen] = useState(false);
  const { errors } = usePage().props as any;

  // Calcular datas padrão
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 30); // Vencimento padrão de 30 dias

  // Inicializar o formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sale_number: salePlaceholder,
      customer_id: quotation?.customer_id?.toString() || '',
      issue_date: today,
      due_date: dueDate,
      status: 'pending', // Padrão para vendas é pendente
      currency_code: defaultCurrency?.code || 'MZN',
      exchange_rate: defaultCurrency ? defaultCurrency.exchange_rate.toString() : '1.0000',
      include_tax: true,
      shipping_amount: '0',
      amount_paid: '0',
      payment_method: paymentMethods.length > 0 ? paymentMethods[0].value : '',
      notes: quotation?.notes || '',
      terms: quotation?.terms || '',
      items: quotation?.items?.map((item: any) => ({
        product_id: item.product_id ? item.product_id.toString() : undefined,
        product_variant_id: item.product_variant_id ? item.product_variant_id.toString() : undefined,
        warehouse_id: item.warehouse_id ? item.warehouse_id.toString() : undefined,
        name: item.name,
        description: item.description || '',
        quantity: item.quantity.toString(),
        unit: item.unit || 'unit',
        unit_price: item.unit_price.toString(),
        discount_percentage: item.discount_percentage?.toString() || '0',
        tax_percentage: item.tax_percentage?.toString() || '16',
      })) || [],
    },
  });

  // Field array para manipular os itens da venda
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Selecionar a taxa de câmbio quando a moeda muda
  const watchCurrency = form.watch('currency_code');
  const watchPaymentAmount = form.watch('amount_paid');
  const watchPaymentMethod = form.watch('payment_method');

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

      // Se houver erros, mostrar a seção de detalhes
      if (Object.keys(errors).some(key => !key.startsWith('items.'))) {
        setActiveView('details');
      }
    }
  }, [errors, form]);

  // Adicionar produto ao carrinho
  const addProductToCart = async (productId: string, warehouseId?: string) => {
    // Obter dados do produto
    const selectedProduct = products.find(p => p.id.toString() === productId);
    if (!selectedProduct) return;

    try {
      // Se tiver warehouse_id, tentar buscar preço específico do inventário
      let unitPrice = selectedProduct.price.toString();

      if (warehouseId) {
        try {
          const response = await fetch(`/admin/api/product-inventory?product_id=${productId}&warehouse_id=${warehouseId}`);
          const data = await response.json();

          if (data.success && data.inventory && data.inventory.unit_cost) {
            unitPrice = data.inventory.unit_cost.toString();
          }
        } catch (error) {
          console.error("Erro ao buscar preço do inventário:", error);
        }
      }

      // Verificar se o produto já está no carrinho
      const existingItemIndex = fields.findIndex(
        item => item.product_id === productId && item.warehouse_id === warehouseId
      );

      if (existingItemIndex >= 0) {
        // Se o produto já existe no mesmo armazém, apenas incrementa a quantidade
        const currentItem = fields[existingItemIndex];
        const newQuantity = (parseFloat(currentItem.quantity) + 1).toString();

        update(existingItemIndex, {
          ...currentItem,
          quantity: newQuantity
        });

        toast({
          title: "Quantidade atualizada",
          description: `A quantidade de ${selectedProduct.name} foi atualizada.`,
        });
      } else {
        // Se não existe ou está em outro armazém, adiciona o produto novo ao carrinho
        append({
          product_id: productId,
          name: selectedProduct.name,
          description: selectedProduct.description || '',
          quantity: '1',
          unit: selectedProduct.unit || 'unit',
          unit_price: unitPrice,
          warehouse_id: warehouseId,
          discount_percentage: '0',
          tax_percentage: taxRates.find(tax => tax.is_default == true)?.value.toString() || '16',
        });

        toast({
          title: "Produto adicionado",
          description: `${selectedProduct.name} foi adicionado à venda.`,
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o produto.",
        variant: "destructive",
      });
      console.error("Erro ao adicionar produto:", error);
    }
  };

  // Atualizar dados do item
  const handleUpdateItem = async (index: number, field: string, value: string) => {
    const currentItem = { ...fields[index] };

    // Se estiver atualizando o warehouse_id, atualizar o preço do produto
    if (field === 'warehouse_id' && currentItem.product_id) {
      try {
        const response = await fetch(`/admin/api/product-inventory?product_id=${currentItem.product_id}&warehouse_id=${value}`);
        const data = await response.json();

        if (data.success && data.inventory && data.inventory.unit_cost) {
          update(index, {
            ...currentItem,
            [field]: value,
            unit_price: data.inventory.unit_cost.toString()
          });
          return;
        }
      } catch (error) {
        console.error("Erro ao buscar preço do inventário:", error);
      }
    }

    // Para outros campos, apenas atualizar o valor
    update(index, { ...currentItem, [field]: value });
  };

  // Editar item no diálogo
  const handleEditItem = (index: number) => {
    setItemBeingEdited({ ...fields[index], index });
    setItemEditDialogOpen(true);
  };

  // Salvar edições do item
  const handleSaveItemEdit = (editedItem: any) => {
    const index = itemBeingEdited.index;
    const { index: _, ...itemToUpdate } = editedItem;
    update(index, itemToUpdate);
    setItemBeingEdited(null);
  };

  // Adicionar item manual
  const handleAddManualItem = (item: any) => {
    append({
      ...item,
      product_id: undefined
    });
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
      subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      total,
    };
  };

  // Calcular totais da venda
  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;
    let total = 0;

    fields.forEach((item) => {
      const values = calculateItemValues(item);
      subtotal += values.subtotal;
      taxAmount += values.tax_amount;
      discountAmount += values.discount_amount;
    });

    const shippingAmount = parseFloat(form.watch('shipping_amount') || '0');

    total = subtotal - discountAmount;
    if (form.watch('include_tax')) {
      total += taxAmount;
    }

    total += shippingAmount;

    return {
      subtotal,
      taxAmount,
      discountAmount,
      shippingAmount,
      total,
    };
  };

  // Formatar valor monetário baseado na moeda selecionada
  const formatCurrency = (value: number) => {
    if (value === null || value === undefined) return 'N/A';

    const selectedCurrencyCode = form.getValues('currency_code');
    const selectedCurrency = currencies.find(c => c.code === selectedCurrencyCode) || defaultCurrency;

    if (!selectedCurrency) {
      return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'MZN'
      }).format(value);
    }

    const { decimal_separator, thousand_separator, decimal_places, symbol } = selectedCurrency;

    const formattedValue = value.toFixed(decimal_places)
      .replace('.', 'DECIMAL')
      .replace(/\B(?=(\d{3})+(?!\d))/g, thousand_separator)
      .replace('DECIMAL', decimal_separator);

    return `${symbol} ${formattedValue}`;
  };

  // Definir método de pagamento
  const handlePaymentMethodChange = (method: string) => {
    form.setValue('payment_method', method);
  };

  // Definir valor do pagamento
  const handlePaymentAmountChange = (amount: string) => {
    form.setValue('amount_paid', amount);

    // Atualizar o status com base no valor pago
    const amountValue = parseFloat(amount) || 0;
    const total = calculateTotals().total;

    if (amountValue >= total) {
      form.setValue('status', 'paid');
    } else if (amountValue > 0) {
      form.setValue('status', 'partial');
    } else {
      form.setValue('status', 'pending');
    }
  };

  // Função para submeter o formulário
  const handleSubmit = () => {
    if (fields.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item à venda",
        variant: "destructive",
      });
      return;
    }

    form.handleSubmit((values: FormValues) => {
      setIsSubmitting(true);

      try {
        // Converter tipos de dados antes de enviar
        const data = {
          ...values,
          customer_id: values.customer_id ? values.customer_id : null,
          exchange_rate: parseFloat(values.exchange_rate),
          issue_date: format(values.issue_date, 'yyyy-MM-dd'),
          due_date: values.due_date ? format(values.due_date, 'yyyy-MM-dd') : null,
          shipping_amount: values.shipping_amount ? parseFloat(values.shipping_amount) : 0,
          amount_paid: values.amount_paid ? parseFloat(values.amount_paid) : 0,
          quotation_id: quotation?.id || null,
          items: values.items.map(item => ({
            ...item,
            product_id: item.product_id ? item.product_id : null,
            product_variant_id: item.product_variant_id ? item.product_variant_id : null,
            warehouse_id: item.warehouse_id ? item.warehouse_id : null,
            quantity: parseFloat(item.quantity),
            unit_price: parseFloat(item.unit_price),
            discount_percentage: item.discount_percentage ? parseFloat(item.discount_percentage) : 0,
            tax_percentage: item.tax_percentage ? parseFloat(item.tax_percentage) : 0,
            // Incluir os valores calculados
            ...calculateItemValues(item)
          })),
        };

        router.post('/admin/sales', data, {
          onSuccess: () => {
            setIsSubmitting(false);
            toast({
              title: "Venda criada",
              description: "A venda foi criada com sucesso.",
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
      } catch (error) {
        setIsSubmitting(false);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao processar o formulário.",
          variant: "destructive",
        });
        console.error("Erro ao submeter formulário:", error);
      }
    })();
  };

  const totals = calculateTotals();

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Ponto de Venda - Nova Venda" />

      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/sales">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Ponto de Venda - Nova Venda</h1>
              {quotation && (
                <p className="text-muted-foreground">
                  Baseado na cotação #{quotation.quotation_number}
                </p>
              )}
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
            <Button
              variant={activeView === 'details' ? 'default' : 'outline'}
              onClick={() => setActiveView('details')}
              type="button"
            >
              Detalhes da Venda
            </Button>
          </div>
        </div>

        <Form {...form}>
          <div className="grid grid-cols-12 gap-6">
            {/* Coluna principal - Lista de produtos ou detalhes da venda */}
            <div className="col-span-12 lg:col-span-8">
              {activeView === 'products' ? (
                <div>
                  <ProductCatalog
                    products={products}
                    categories={products.reduce((acc: { id: number, name: string }[], product) => {
                      if (product.category && !acc.some(c => c.id === product.category!.id)) {
                        acc.push(product.category);
                      }
                      return acc;
                    }, [])}
                    onProductSelect={addProductToCart}
                    warehouses={warehouses}
                    selectedWarehouseId={selectedWarehouseId}
                    onWarehouseChange={setSelectedWarehouseId}
                    className="mb-6"
                  />
                  <div className="flex justify-end mb-4">
                    <Button
                      variant="outline"
                      onClick={() => setManualItemDialogOpen(true)}
                      type="button"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Item Manual
                    </Button>
                  </div>
                </div>
              ) : (
                <SaleDetails
                  control={form.control}
                  customers={customers}
                  currencies={currencies}
                  statuses={statuses}
                />
              )}

              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-3">Carrinho de Compras</h2>
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

            {/* Coluna lateral - Resumo e ações */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <SaleSummary
                totals={totals}
                itemCount={fields.length}
                status={form.watch('status')}
                isSubmitting={isSubmitting}
                formatCurrency={formatCurrency}
                onSubmit={handleSubmit}
                paymentMethods={paymentMethods}
                onPaymentMethodChange={handlePaymentMethodChange}
                onPaymentAmountChange={handlePaymentAmountChange}
                paymentMethod={watchPaymentMethod}
                paymentAmount={watchPaymentAmount}
              />
            </div>
          </div>
        </Form>

        {/* Diálogo de edição de item */}
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

        {/* Diálogo para adicionar item manual */}
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
