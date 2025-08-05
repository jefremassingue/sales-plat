import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash } from 'lucide-react';
import { UseFieldArrayReturn, UseFormReturn, Control } from 'react-hook-form';
import { Currency, Product, TaxRate, Warehouse } from './types';
import { ItemFormValues } from './ItemForm';

interface ItemsTabProps {
  fieldArray: UseFieldArrayReturn<any, "items", "id">;
  products: Product[];
  warehouses: Warehouse[];
  taxRates: TaxRate[];
  units: { value: string; label: string }[];
  form: UseFormReturn<any>;
  currencies: Currency[];
  calculateItemValues: (item: any) => { subtotal: string; discount_amount: string; tax_amount: string; total: string; };
  formatCurrency: (value: number | null | undefined, withSymbol?: boolean) => string;
  onAddItemManual: () => void;
  onAddProduct: () => void;
  onEditItem: (index: number) => void;
  onRemoveItem: (index: number) => void;
}

export default function ItemsTab({
  fieldArray,
  products,
  warehouses,
  taxRates,
  units,
  form,
  currencies,
  calculateItemValues,
  formatCurrency,
  onAddItemManual,
  onAddProduct,
  onEditItem,
  onRemoveItem
}: ItemsTabProps) {
  const { fields } = fieldArray;

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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div className=''>
            <CardTitle>Itens da Cotação</CardTitle>
            <CardDescription>
              Adicione produtos ou serviços a esta cotação
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={onAddItemManual}
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Item Manual
            </Button>
            <Button
              type="button"
              onClick={onAddProduct}
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
                            onClick={() => onEditItem(index)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => onRemoveItem(index)}
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
                        onClick={onAddItemManual}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Item Manual
                      </Button>
                      <Button
                        type="button"
                        onClick={onAddProduct}
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
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Desconto:</span>
                <span>{formatCurrency(totals.discountAmount)}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">
                  IVA ({form.getValues('include_tax') ? 'incluído' : 'excluído'}):
                </span>
                <span>{formatCurrency(totals.taxAmount)}</span>
              </div>

              <Separator className="my-2" />
              <div className="flex justify-between py-2">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg">{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
