import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, ShoppingCart, Trash } from 'lucide-react';
import { useRef } from 'react';

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
    handleLocalChange: (index: number, field: string, value: string) => void;
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
    onEditItem,
}: ShoppingCartProps) {
    // Calcular totais gerais do carrinho
    const calculateTotals = () => {
        let subtotal = 0;
        let taxAmount = 0;
        let discountAmount = 0;
        let total = 0;

        items.forEach((item) => {
            const values = calculateItemValues(item);
            subtotal += values.subtotal;
            taxAmount += values.tax_amount;
            discountAmount += values.discount_amount;
            total += values.total;
        });

        return { subtotal, taxAmount, discountAmount, total };
    };

    const totals = calculateTotals();

    const quantityRefs = useRef<(HTMLInputElement | null)[]>([]);
    const priceRefs = useRef<(HTMLInputElement | null)[]>([]);
    const discountRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleLocalChange = (index: number, field: string, value: string) => {
        onUpdateItem(index, field, value);

        setTimeout(() => {
             switch (field) {
                case 'quantity':
                    quantityRefs.current[index]?.focus();
                    break;
                case 'unit_price':
                    priceRefs.current[index]?.focus();
                    break;
                case 'discount_percentage':
                    discountRefs.current[index]?.focus();
                    break;
            }
        }, 100);
    };

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead>Armazém</TableHead>
                            <TableHead className="w-20 text-center">Qtd.</TableHead>
                            <TableHead className="w-24 text-right">Preço</TableHead>
                            <TableHead className="w-24 text-right">Desconto</TableHead>
                            <TableHead className="w-24 text-right">Total</TableHead>
                            <TableHead className="w-16"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length > 0 ? (
                            items.map((item, index) => {
                                const itemValues = calculateItemValues(item);
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="max-w-[400px] font-medium">
                                                <p className="truncate">{item.name}</p>
                                            </div>
                                            {/* {item.description && (
                        <div className="text-muted-foreground text-sm">{item.description}</div>
                      )} */}
                                            {item.tax_percentage && parseFloat(item.tax_percentage) > 0 && (
                                                <div className="text-muted-foreground text-xs">IVA: {item.tax_percentage}%</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={item.warehouse_id || ''}
                                                onValueChange={(value) => handleLocalChange(index, 'warehouse_id', value)}
                                            >
                                                <SelectTrigger className="w-[120px]">
                                                    <SelectValue placeholder="Selecionar" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {warehouses.map((warehouse) => (
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
                                                        handleLocalChange(index, 'quantity', newQty);
                                                    }}
                                                >
                                                    -
                                                </Button>
                                                <Input
                                                    className="mx-1 h-7 w-14 p-1 text-center"
                                                    ref={(el) => (quantityRefs.current[index] = el)}
                                                    value={item.quantity}
                                                    onChange={(e) => handleLocalChange(index, 'quantity', e.target.value)}
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    type="button"
                                                    onClick={() => {
                                                        const newQty = (parseFloat(item.quantity) + 1).toString();
                                                        handleLocalChange(index, 'quantity', newQty);
                                                    }}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                className="h-7 text-right"
                                                ref={(el) => (priceRefs.current[index] = el)}
                                                value={item.unit_price}
                                                onChange={(e) => handleLocalChange(index, 'unit_price', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                className="h-7 text-right"
                                                ref={(el) => (discountRefs.current[index] = el)}
                                                value={item.discount_percentage || '0'}
                                                onChange={(e) => handleLocalChange(index, 'discount_percentage', e.target.value)}
                                                suffix="%"
                                            />
                                        </TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(itemValues.total)}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" type="button" onClick={() => onEditItem(index)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" type="button" onClick={() => onRemoveItem(index)}>
                                                    <Trash className="text-destructive h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <div className="text-muted-foreground flex flex-col items-center">
                                        <ShoppingCart className="mb-2 h-10 w-10" />
                                        <p>Carrinho vazio</p>
                                        <p className="mt-1 text-xs">Adicione produtos à venda</p>
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
                            <span className="text-lg font-bold">{formatCurrency(totals.total)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
