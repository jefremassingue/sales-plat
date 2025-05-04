import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Trash, Pencil } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CartItem {
  id?: number;
  product_id?: string;
  name: string;
  description?: string;
  quantity: string;
  unit?: string;
  unit_price: string;
  discount_percentage?: string;
  tax_percentage?: string;
  warehouse_id?: string;
}

interface ShoppingCartProps {
  items: CartItem[];
  warehouses: { id: number; name: string }[];
  onUpdateItem: (index: number, field: string, value: string) => void;
  onRemoveItem: (index: number) => void;
  formatCurrency: (value: number) => string;
  calculateItemValues: (item: any) => {
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total: number;
  };
  onEditItem: (index: number) => void;
}

export default function ShoppingCartComponent({
  items,
  warehouses,
  onUpdateItem,
  onRemoveItem,
  formatCurrency,
  calculateItemValues,
  onEditItem
}: ShoppingCartProps) {
  // Calcular totais gerais do carrinho
  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;
    let total = 0;

    items.forEach(item => {
      const values = calculateItemValues(item);
      subtotal += values.subtotal;
      taxAmount += values.tax_amount;
      discountAmount += values.discount_amount;
      total += values.total;
    });

    return { subtotal, taxAmount, discountAmount, total };
  };

  const totals = calculateTotals();

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Armazém</TableHead>
              <TableHead className="text-center w-20">Qtd.</TableHead>
              <TableHead className="text-right w-24">Preço</TableHead>
              <TableHead className="text-right w-24">Desconto</TableHead>
              <TableHead className="text-right w-24">Total</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((item, index) => {
                const itemValues = calculateItemValues(item);
                return (
                  <TableRow key={item.id || index}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-muted-foreground text-sm">{item.description}</div>
                      )}
                      {item.tax_percentage && parseFloat(item.tax_percentage) > 0 && (
                        <div className="text-xs text-muted-foreground">
                          IVA: {item.tax_percentage}%
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.warehouse_id || ""}
                        onValueChange={(value) => onUpdateItem(index, 'warehouse_id', value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses.map(warehouse => (
                            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                              {warehouse.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          type="button"
                          onClick={() => {
                            const newQty = Math.max(1, parseFloat(item.quantity) - 1).toString();
                            onUpdateItem(index, 'quantity', newQty);
                          }}
                        >
                          -
                        </Button>
                        <Input
                          className="w-14 h-7 mx-1 text-center p-1"
                          value={item.quantity}
                          onChange={(e) => onUpdateItem(index, 'quantity', e.target.value)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          type="button"
                          onClick={() => {
                            const newQty = (parseFloat(item.quantity) + 1).toString();
                            onUpdateItem(index, 'quantity', newQty);
                          }}
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        className="text-right h-7"
                        value={item.unit_price}
                        onChange={(e) => onUpdateItem(index, 'unit_price', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="text-right h-7"
                        value={item.discount_percentage || "0"}
                        onChange={(e) => onUpdateItem(index, 'discount_percentage', e.target.value)}
                        suffix="%"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(itemValues.total)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => onEditItem(index)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => onRemoveItem(index)}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <ShoppingCart className="h-10 w-10 mb-2" />
                    <p>Carrinho vazio</p>
                    <p className="text-xs mt-1">Adicione produtos à venda</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {items.length > 0 && (
        <div className="mt-4 flex flex-col items-end">
          <div className="w-full max-w-xs">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between py-2 text-sm">
                <span className="text-muted-foreground">Desconto:</span>
                <span>-{formatCurrency(totals.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 text-sm">
              <span className="text-muted-foreground">IVA:</span>
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
    </div>
  );
}
