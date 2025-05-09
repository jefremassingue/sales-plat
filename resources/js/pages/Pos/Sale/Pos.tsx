import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { router } from '@inertiajs/react';
import { Search, Plus, Minus, X, Printer, Percent, History } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';
import axios from 'axios';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Toaster } from '@/components/ui/toaster';

interface Product {
    id: number;
    name: string;
    price: number;
    sku?: string;
    unit?: string;
    stock_quantity?: number;
    category?: { id: number; name: string };
    inventories?: {
        warehouse_id: number;
        quantity: number;
    }[];
    sale_price: number;
}

interface Customer {
    id: number;
    name: string;
}

interface Currency {
    code: string;
    symbol: string;
    decimal_places: number;
    decimal_separator: string;
    thousand_separator: string;
}

interface Warehouse {
    id: number;
    name: string;
    is_main: boolean;
}

interface Sale {
    id: number;
    sale_number: string;
    created_at: string;
    total: number;
    customer?: Customer;
}

interface Props {
    products: Product[];
    customers: Customer[];
    currencies: Currency[];
    defaultCurrency: Currency;
    warehouses: Warehouse[];
    recentSales: Sale[];
}

interface CartItem {
    product?: Product;
    product_id: number | null;
    name: string;
    quantity: number;
    unit_price: number;
    unit: string;
    discount_percentage: number;
    is_custom?: boolean;
    warehouse_id: number;
}

interface CustomProduct {
    name: string;
    price: string;
    unit: string;
}

const paymentMethods = [
    { value: 'cash', label: 'Dinheiro' },
    { value: 'card', label: 'Cartão' },
    { value: 'mpesa', label: 'M-Pesa' },
    { value: 'emola', label: 'eMola' },
    { value: 'bank_transfer', label: 'Transferência Bancária' },
    { value: 'check', label: 'Cheque' },
    { value: 'credit', label: 'Crédito' },
    { value: 'other', label: 'Outro' },
];

export default function Pos({ products, customers, currencies, defaultCurrency, warehouses, recentSales }: Props) {
    const { toast } = useToast();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
    const [amountPaid, setAmountPaid] = useState<number>(0);
    const [currencyCode, setCurrencyCode] = useState(defaultCurrency?.code || 'MZN');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<number>(1);
    const [discountPercentage, setDiscountPercentage] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentReference, setPaymentReference] = useState('');
    const [notes, setNotes] = useState('');
    const [showCustomProductModal, setShowCustomProductModal] = useState(false);
    const [customProduct, setCustomProduct] = useState<CustomProduct>({
        name: '',
        price: '',
        unit: 'un'
    });

    // Filtrar produtos por busca e estoque
    const filteredProducts = products.filter(p => {
        const hasStock = p.inventories?.some(inv =>
            inv.warehouse_id === selectedWarehouse && inv.quantity > 0
        );
        return (
            (p.name.toLowerCase().includes(search.toLowerCase()) ||
                (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))) &&
            hasStock
        );
    });

    // Obter quantidade em estoque
    const getStockQuantity = (productId: number | null) => {
        if (!productId) return 0;
        const inventory = products
            .find(p => p.id === productId)
            ?.inventories?.find(inv => inv.warehouse_id === selectedWarehouse);
        return inventory?.quantity || 0;
    };

    // Adicionar produto ao carrinho
    const addToCart = (product: Product) => {
        const existingItem = cart.find(item => item.product_id === product.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.product_id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            if (!selectedWarehouse) {
                toast({
                    title: "Erro",
                    description: "Selecione um armazém",
                    variant: "destructive"
                });
                return;
            }
            setCart([...cart, {
                product_id: product.id,
                name: product.name,
                quantity: 1,
                unit_price: product.price,
                unit: product.unit || 'un',
                warehouse_id: selectedWarehouse,
                discount_percentage: 0
            }]);
        }
    };

    // Alterar quantidade
    const updateQuantity = (idx: number, quantity: number) => {
        if (quantity < 1) return;
        const item = cart[idx];
        const stockQuantity = getStockQuantity(item.product_id);

        if (quantity > stockQuantity) {
            toast({
                title: "Erro",
                description: "Quantidade máxima em estoque atingida",
                variant: "destructive",
            });
            return;
        }

        const newCart = [...cart];
        newCart[idx].quantity = quantity;
        setCart(newCart);
    };

    // Remover item
    const removeItem = (idx: number) => {
        setCart(cart.filter((_, i) => i !== idx));
    };

    const addCustomProduct = () => {
        if (!customProduct.name || !customProduct.price) {
            toast({
                title: "Erro",
                description: "Preencha todos os campos obrigatórios",
                variant: "destructive"
            });
            return;
        }

        setCart([...cart, {
            name: customProduct.name,
            quantity: 1,
            unit_price: Number(customProduct.price),
            unit: customProduct.unit || 'un',
            discount_percentage: 0,
            is_custom: true,
            product_id: null,
            warehouse_id: selectedWarehouse
        }]);

        setCustomProduct({ name: '', price: '', unit: 'un' });
        setShowCustomProductModal(false);
    };

    const calculateItemTotal = (item: CartItem) => {
        const subtotal = item.quantity * item.unit_price;
        const discount = (subtotal * item.discount_percentage) / 100;
        return subtotal - discount;
    };

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const discount = (subtotal * discountPercentage) / 100;
        return subtotal - discount;
    };

    const calculateChange = () => {
        return amountPaid - calculateTotal();
    };

    // Formatar moeda
    const formatCurrency = (value: number) => {
        if (value === undefined || value === null) {
            return '0.00';
        }

        const curr = currencies.find(c => c.code === currencyCode) || defaultCurrency;
        if (!curr) {
            return value.toFixed(2);
        }

        const formatted = value
            .toFixed(curr.decimal_places)
            .replace('.', 'DECIMAL')
            .replace(/\B(?=(\d{3})+(?!\d))/g, curr.thousand_separator)
            .replace('DECIMAL', curr.decimal_separator);
        return `${curr.symbol} ${formatted}`;
    };

    // Submeter venda
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) {
            toast({
                title: "Erro",
                description: "Adicione produtos ao carrinho",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await axios.post('/pos/sales', {
                customer_id: selectedCustomer || null,
                items: cart.map(item => ({
                    product_id: item.is_custom ? null : item.product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    warehouse_id: item.warehouse_id,
                    name: item.name,
                    unit: item.unit,
                    discount_percentage: item.discount_percentage,
                    is_custom: item.is_custom || false
                })),
                amount_paid: amountPaid,
                currency_code: currencyCode,
                discount_percentage: discountPercentage,
                payment_method: paymentMethod,
                payment_reference: paymentReference || null,
                notes: notes || null,
                warehouse_id: selectedWarehouse,
                status: 'completed',
                issue_date: new Date().toISOString()
            });

            console.log(response);

            if (response.data.message) {
                toast({
                    title: "Sucesso",
                    description: response.data.message,
                });
                setCart([]);
                setSelectedCustomer(null);
                setAmountPaid(0);
                setDiscountPercentage(0);
                setPaymentMethod('cash');
                setPaymentReference('');
                setNotes('');
            }
        } catch (error: any) {
            console.error('Erro ao registrar venda:', error.response?.data);
            toast({
                title: "Erro",
                description: error.response?.data?.message || 'Erro ao registrar venda',
                variant: "destructive",
            });
        }
    };

    // Imprimir recibo
    const handlePrint = (saleId?: number) => {
        if (saleId) {
            window.open(`/pos/sales/${saleId}/print`, '_blank');
        } else {
            window.print();
        }
    };

    return (
        <div className="container mx-auto p-4">
            <Toaster />
            <Tabs defaultValue="pos" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pos">Ponto de Venda</TabsTrigger>
                    <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>

                <TabsContent value="pos">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Left Column - Products and Search */}
                        <div className="lg:col-span-8 space-y-4">
                            {/* Search and Warehouse Selection */}
                            <div className="flex gap-4 items-center">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar produtos..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select
                                    value={selectedWarehouse?.toString()}
                                    onValueChange={(value) => setSelectedWarehouse(Number(value))}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Selecione o armazém" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map((warehouse) => (
                                            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                {warehouse.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCustomProductModal(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Produto Personalizado
                                </Button>
                            </div>

                            {/* Products Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredProducts.map((product) => (
                                    <Button
                                        key={product.id}
                                        variant="outline"
                                        className="h-auto p-4 flex flex-col items-start"
                                        onClick={() => addToCart(product)}
                                    >
                                        <p className="font-semibold mb-1 line-">{product.name}</p>
                                        <span className="text-xs text-muted-foreground mb-2">{product.sku}</span>
                                        <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
                                        <span className="text-xs text-muted-foreground mt-1">
                                            Estoque: {getStockQuantity(product.id)}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Right Column - Cart and Payment */}
                        <div className="lg:col-span-4">
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle>Carrinho</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Cart Items */}
                                        <ScrollArea className="h-[300px]">
                                            {cart.length === 0 ? (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    Nenhum produto adicionado
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {cart.map((item, index) => (
                                                        <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                                                            <div className="flex-1">
                                                                <h3 className="font-medium">{item.name}</h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {formatCurrency(item.unit_price)} x {item.quantity}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        value={item.discount_percentage}
                                                                        onChange={(e) => {
                                                                            const newCart = [...cart];
                                                                            newCart[index].discount_percentage = Number(e.target.value);
                                                                            setCart(newCart);
                                                                        }}
                                                                        className="w-20 h-7"
                                                                    />
                                                                    <span className="text-xs text-muted-foreground">%</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => updateQuantity(index, item.quantity - 1)}
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </Button>
                                                                <span className="w-8 text-center">{item.quantity}</span>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => updateQuantity(index, item.quantity + 1)}
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-destructive"
                                                                    onClick={() => removeItem(index)}
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </ScrollArea>

                                        {/* Totals */}
                                        <div className="space-y-2 border-t pt-4">
                                            <div className="flex justify-between">
                                                <span>Subtotal:</span>
                                                <span>{formatCurrency(calculateSubtotal())}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Percent className="w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={discountPercentage}
                                                    onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                                                    className="w-24"
                                                />
                                                <span className="text-muted-foreground">%</span>
                                                <span className="ml-auto">{formatCurrency((calculateSubtotal() * discountPercentage) / 100)}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Total:</span>
                                                <span>{formatCurrency(calculateTotal())}</span>
                                            </div>
                                        </div>

                                        {/* Payment Details */}
                                        <div className="space-y-4 border-t pt-4">
                                            <div className="space-y-2">
                                                <Label>Cliente</Label>
                                                <Select
                                                    value={selectedCustomer?.toString()}
                                                    onValueChange={(value) => setSelectedCustomer(Number(value) || null)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione um cliente" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {customers.map((customer) => (
                                                            <SelectItem key={customer.id} value={customer.id.toString()}>
                                                                {customer.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Método de Pagamento</Label>
                                                <Select
                                                    value={paymentMethod}
                                                    onValueChange={setPaymentMethod}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o método de pagamento" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {paymentMethods.map((method) => (
                                                            <SelectItem key={method.value} value={method.value}>
                                                                {method.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {paymentMethod !== 'cash' && (
                                                <div className="space-y-2">
                                                    <Label>Referência do Pagamento</Label>
                                                    <Input
                                                        value={paymentReference}
                                                        onChange={(e) => setPaymentReference(e.target.value)}
                                                        placeholder="Número da transação, referência, etc."
                                                    />
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Label>Valor Pago</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={amountPaid.toString()}
                                                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                                                />
                                                {amountPaid > calculateTotal() && (
                                                    <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg mt-2">
                                                        <div className="font-bold text-green-800 dark:text-green-200">
                                                            Troco: {formatCurrency(calculateChange())}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Observações</Label>
                                                <Textarea
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    placeholder="Observações sobre a venda..."
                                                    rows={2}
                                                />
                                            </div>

                                            <Button type="submit" className="w-full" disabled={cart.length === 0}>
                                                Finalizar Venda
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vendas Recentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[600px]">
                                <div className="space-y-4">
                                    {recentSales.map((sale) => (
                                        <div key={sale.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                            <div>
                                                <h3 className="font-medium">Venda #{sale.sale_number}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(sale.created_at).toLocaleString()}
                                                </p>
                                                {sale.customer && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Cliente: {sale.customer.name}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold">{formatCurrency(sale.total)}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handlePrint(sale.id)}
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Custom Product Modal */}
            <Dialog open={showCustomProductModal} onOpenChange={setShowCustomProductModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adicionar Produto Personalizado</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome do Produto</Label>
                            <Input
                                value={customProduct.name}
                                onChange={(e) => setCustomProduct({ ...customProduct, name: e.target.value })}
                                placeholder="Nome do produto"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Preço</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={customProduct.price}
                                onChange={(e) => setCustomProduct({ ...customProduct, price: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Unidade</Label>
                            <Input
                                value={customProduct.unit}
                                onChange={(e) => setCustomProduct({ ...customProduct, unit: e.target.value })}
                                placeholder="un, kg, etc"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCustomProductModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={addCustomProduct}>
                            Adicionar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 