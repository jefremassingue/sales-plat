import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Product, Warehouse, TaxRate } from './types';

// Esquema de validação para o formulário de item
const itemFormSchema = z.object({
  product_id: z.string().optional(),
  product_variant_id: z.string().optional(),
  warehouse_id: z.string().optional(),
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  description: z.string().optional(),
  quantity: z.string()
    .min(1, { message: 'Quantidade é obrigatória' })
    .refine(val => !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
    .refine(val => parseFloat(val) > 0, { message: 'Deve ser maior que zero' }),
  unit: z.string().optional(),
  unit_price: z.string()
    .min(1, { message: 'Preço unitário é obrigatório' })
    .refine(val => !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
    .refine(val => parseFloat(val) >= 0, { message: 'Não pode ser negativo' }),
  discount_percentage: z.string()
    .optional()
    .refine(val => val === '' || !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
    .refine(val => val === '' || parseFloat(val) >= 0, { message: 'Não pode ser negativo' })
    .refine(val => val === '' || parseFloat(val) <= 100, { message: 'Deve ser no máximo 100%' }),
  tax_percentage: z.string()
    .optional()
    .refine(val => val === '' || !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
    .refine(val => val === '' || parseFloat(val) >= 0, { message: 'Não pode ser negativo' }),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ItemFormValues) => void;
  products: Product[];
  warehouses: Warehouse[];
  taxRates: TaxRate[];
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
  title = "Adicionar Item",
  isManualItemMode = false
}: ItemFormProps) {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [warehouseInventories, setWarehouseInventories] = useState<any[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  // Referência para controlar inicialização
  const initializedRef = useRef(false);

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
      tax_percentage: '17', // IVA padrão Moçambique
    },
  });

  // Resetar o formulário e inicializar com valores apropriados quando o modal abre/fecha
  useEffect(() => {
    // Se o modal acabou de abrir
    if (open) {
      // Primeiro reset para limpar qualquer valor antigo
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
        tax_percentage: '17',
      });

      // Se temos valores iniciais (edição ou produto selecionado)
      if (initialValues) {
        console.log("Setting initial values:", initialValues);

        // Definir valores do formulário baseados nos valores iniciais
        Object.keys(initialValues).forEach(key => {
          const value = (initialValues as any)[key];
          if (value !== undefined) {
            form.setValue(key as any, typeof value === 'number' ? value.toString() : value);
          }
        });

        // Se tiver product_id, buscar o produto correspondente
        if (initialValues.product_id && initialValues.product_id !== 'none') {
          const productId = typeof initialValues.product_id === 'number'
            ? initialValues.product_id.toString()
            : initialValues.product_id;

          const product = products.find(p => p.id.toString() === productId);
          if (product) {
            console.log("Found product:", product.name);
            setSelectedProduct(product);

            // Garantir que o nome do produto esteja definido
            form.setValue('name', product.name);

            // Se o preço não estiver definido nos valores iniciais, usar o preço do produto
            if (!initialValues.unit_price && product.price) {
              form.setValue('unit_price', product.price.toString());
            }
          }
        } else if (isManualItemMode) {
          setSelectedProduct(null);
        }
      } else if (isManualItemMode) {
        // Para item manual, garantir que não há produto selecionado
        setSelectedProduct(null);
      }

      initializedRef.current = true;
    } else {
      // Quando o modal fecha, limpar a seleção de produto
      initializedRef.current = false;
    }
  }, [open, initialValues, products, isManualItemMode]);

  // Observar mudanças no campo product_id
  const watchProductId = form.watch('product_id');
  const watchWarehouseId = form.watch('warehouse_id');

  // Quando o product_id muda no formulário, atualizar o produto selecionado
  useEffect(() => {
    if (watchProductId && watchProductId !== 'none') {
      const product = products.find(p => p.id.toString() === watchProductId);
      if (product) {
        setSelectedProduct(product);
        form.setValue('name', product.name);
        form.setValue('unit_price', product.price.toString());

        // Se também tiver um armazém selecionado, buscar preço específico
        if (watchWarehouseId) {
          fetchProductInventoryPrice(watchProductId, watchWarehouseId);
        }
      }
    } else if (watchProductId === 'none') {
      setSelectedProduct(null);
    }
  }, [watchProductId]);

  // Quando o armazém muda
  useEffect(() => {
    if (watchProductId && watchProductId !== 'none' && watchWarehouseId) {
      fetchProductInventoryPrice(watchProductId, watchWarehouseId);
    }
  }, [watchWarehouseId]);

  // Função para buscar o preço do produto em um armazém específico
  const fetchProductInventoryPrice = async (productId: string, warehouseId: string) => {
    try {
      setIsLoadingInventory(true);
      const response = await fetch(`/admin/api/product-inventory?product_id=${productId}&warehouse_id=${warehouseId}`);
      const data = await response.json();

      if (data.success && data.inventory) {
        // Usar o custo unitário do inventário se disponível, ou o preço padrão do produto
        const price = data.inventory.unit_cost || (selectedProduct?.price || 0);
        form.setValue('unit_price', price.toString());
      }
    } catch (error) {
      console.error('Erro ao obter preço do inventário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível obter o preço do produto no armazém selecionado.",
        variant: "destructive",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Limpar campos relacionados quando o produto muda
                        form.setValue('warehouse_id', '');
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum (Item manual)</SelectItem>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warehouse_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Armazém</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      disabled={!watchProductId || watchProductId === 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um armazém" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {warehouses.map(warehouse => (
                          <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {isLoadingInventory ? 'A carregar informações do inventário...' : 'Selecione o armazém para buscar o preço correto'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Item <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} readOnly={!!selectedProduct && selectedProduct.id.toString() !== 'none'} />
                  </FormControl>
                  {selectedProduct && selectedProduct.id.toString() !== 'none' && (
                    <FormDescription>
                      O nome não pode ser alterado pois está associado a um produto do sistema.
                    </FormDescription>
                  )}
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

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade <span className="text-destructive">*</span></FormLabel>
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
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unit">Unidade</SelectItem>
                        <SelectItem value="kg">Quilograma (kg)</SelectItem>
                        <SelectItem value="m">Metro (m)</SelectItem>
                        <SelectItem value="m2">Metro quadrado (m²)</SelectItem>
                        <SelectItem value="m3">Metro cúbico (m³)</SelectItem>
                        <SelectItem value="l">Litro (L)</SelectItem>
                        <SelectItem value="h">Hora (h)</SelectItem>
                        <SelectItem value="day">Dia</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Unitário <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        className={isLoadingInventory ? "animate-pulse" : ""}
                      />
                    </FormControl>
                    {isLoadingInventory && (
                      <FormDescription>
                        A carregar preço atualizado...
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discount_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desconto (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        {...field}
                        value={field.value || '0'}
                      />
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
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || '0'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma taxa de imposto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Isento (0%)</SelectItem>
                        {Array.isArray(taxRates) && taxRates.map(tax => {
                          const keyValue = tax.value || tax.id?.toString() || "tax_" + Math.random().toString(36).substr(2, 9);
                          const valueToUse = tax.percentage?.toString() || tax.value?.toString() || "0";

                          return (
                            <SelectItem
                              key={keyValue}
                              value={valueToUse}
                            >
                              {tax.name} ({tax.percentage || 0}%)
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
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
