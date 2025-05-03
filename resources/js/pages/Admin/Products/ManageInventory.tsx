import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Calendar, Loader2, MoreVertical, Plus, Save, Trash, WarehouseIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface Warehouse {
    id: number;
    name: string;
    location: string;
}

interface InventoryItem {
    id?: number;
    product_id: number;
    product_variant_id?: number | null;
    warehouse_id: number;
    warehouse_name?: string;
    quantity: number;
    min_quantity: number;
    max_quantity?: number;
    location?: string | null;
    batch_number?: string | null;
    expiry_date?: Date | null;
    unit_cost?: number | null;
    status: string;
    notes?: string | null;
}

interface InventoryGroup {
    id: number;
    name: string;
    sku?: string;
    inventories: InventoryItem[];
}

interface ProductInventory {
    product: InventoryGroup;
    variants?: InventoryGroup[];
}

interface Props {
    product: {
        id: number;
        name: string;
        sku: string;
        price: number;
        cost: number;
    };
    productInventory: ProductInventory;
    warehouses: Warehouse[];
}

const ManageInventory = ({ product, productInventory, warehouses }: Props) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('product');
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Breadcrumbs dinâmicos
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Produtos',
            href: '/admin/products',
        },
        {
            title: product.name,
            href: `/admin/products/${product.id}`,
        },
        {
            title: 'Gerir Inventário',
            href: `/admin/products/${product.id}/inventory`,
        },
    ];

    // Inicializar os itens de inventário quando o componente carregar
    useEffect(() => {
        const items: InventoryItem[] = [];

        // Adicionar produto principal
        productInventory.product.inventories.forEach(inv => {
            items.push({
                id: inv.id,
                product_id: product.id,
                product_variant_id: null,
                warehouse_id: inv.warehouse_id,
                warehouse_name: inv.warehouse?.name || 'Armazém desconhecido',
                quantity: inv.quantity || 0,
                min_quantity: inv.min_quantity || 0,
                max_quantity: inv.max_quantity || 0,
                location: inv.location || '',
                batch_number: inv.batch_number || '',
                expiry_date: inv.expiry_date ? new Date(inv.expiry_date) : null,
                unit_cost: inv.unit_cost || product.cost || product.price,
                status: inv.status || 'active',
                notes: inv.notes || '',
            });
        });

        // Adicionar entradas para armazéns que ainda não têm inventário (produto principal)
        warehouses.forEach(warehouse => {
            if (!productInventory.product.inventories.some(inv => inv.warehouse_id === warehouse.id)) {
                items.push({
                    product_id: product.id,
                    product_variant_id: null,
                    warehouse_id: warehouse.id,
                    warehouse_name: warehouse.name,
                    quantity: 0,
                    min_quantity: 0,
                    max_quantity: 0,
                    location: '',
                    batch_number: '',
                    expiry_date: null,
                    unit_cost: product.cost || product.price,
                    status: 'active',
                    notes: '',
                });
            }
        });

        // Adicionar variantes (se existirem)
        if (productInventory.variants) {
            productInventory.variants.forEach(variant => {
                variant.inventories.forEach(inv => {
                    items.push({
                        id: inv.id,
                        product_id: product.id,
                        product_variant_id: variant.id,
                        variant_name: variant.name,
                        warehouse_id: inv.warehouse_id,
                        warehouse_name: inv.warehouse?.name || 'Armazém desconhecido',
                        quantity: inv.quantity || 0,
                        min_quantity: inv.min_quantity || 0,
                        max_quantity: inv.max_quantity || 0,
                        location: inv.location || '',
                        batch_number: inv.batch_number || '',
                        expiry_date: inv.expiry_date ? new Date(inv.expiry_date) : null,
                        unit_cost: inv.unit_cost || product.cost || product.price,
                        status: inv.status || 'active',
                        notes: inv.notes || '',
                    });
                });

                // Adicionar entradas para armazéns que ainda não têm inventário (variante)
                warehouses.forEach(warehouse => {
                    if (!variant.inventories.some(inv => inv.warehouse_id === warehouse.id)) {
                        items.push({
                            product_id: product.id,
                            product_variant_id: variant.id,
                            variant_name: variant.name,
                            warehouse_id: warehouse.id,
                            warehouse_name: warehouse.name,
                            quantity: 0,
                            min_quantity: 0,
                            max_quantity: 0,
                            location: '',
                            batch_number: '',
                            expiry_date: null,
                            unit_cost: product.cost || product.price,
                            status: 'active',
                            notes: '',
                        });
                    }
                });
            });
        }

        setInventoryItems(items);
    }, []);

    // Função para abrir o diálogo e editar um item
    const handleOpenAdvancedEdit = (index: number) => {
        setSelectedItem(inventoryItems[index]);
        setIsDialogOpen(true);
    };

    // Função para salvar as alterações do diálogo
    const handleSaveAdvancedEdit = (updatedItem: InventoryItem) => {
        const newItems = [...inventoryItems];
        const index = newItems.findIndex(item =>
            item.product_id === updatedItem.product_id &&
            item.product_variant_id === updatedItem.product_variant_id &&
            item.warehouse_id === updatedItem.warehouse_id
        );

        if (index !== -1) {
            newItems[index] = updatedItem;
            setInventoryItems(newItems);
        }

        setSelectedItem(null);
        setIsDialogOpen(false);
    };

    // Função para atualizar a quantidade de um item de inventário
    const handleQuantityChange = (index: number, value: string) => {
        const newItems = [...inventoryItems];
        const originalValue = newItems[index].quantity;
        const newValue = parseInt(value) || 0;

        newItems[index].quantity = newValue;
        setInventoryItems(newItems);

        // Alertar sobre mudança que gerará um ajuste
        if (newValue !== originalValue) {
            toast({
                title: "Alteração de quantidade detectada",
                description: "Será criado um ajuste de inventário automático ao salvar.",
                variant: "warning",
                duration: 3000,
            });
        }
    };

    // Função para atualizar a quantidade mínima de um item de inventário
    const handleMinQuantityChange = (index: number, value: string) => {
        const newItems = [...inventoryItems];
        newItems[index].min_quantity = parseInt(value) || 0;
        setInventoryItems(newItems);
    };

    // Função para atualizar a localização de um item de inventário
    const handleLocationChange = (index: number, value: string) => {
        const newItems = [...inventoryItems];
        newItems[index].location = value;
        setInventoryItems(newItems);
    };

    // Função para enviar o formulário
    const handleSubmit = () => {
        setIsSubmitting(true);

        // Preparar os dados para envio
        const items = inventoryItems.map(item => ({
            product_id: item.product_id,
            product_variant_id: item.product_variant_id,
            warehouse_id: item.warehouse_id,
            quantity: item.quantity,
            min_quantity: item.min_quantity,
            max_quantity: item.max_quantity || null,
            location: item.location,
            batch_number: item.batch_number,
            expiry_date: item.expiry_date ? format(item.expiry_date, 'yyyy-MM-dd') : null,
            unit_cost: item.unit_cost,
            status: item.status,
            notes: item.notes,
        }));

        router.post('/admin/products/update-inventory', { items }, {
            onSuccess: () => {
                setIsSubmitting(false);
                toast({
                    title: "Inventário atualizado",
                    description: "O inventário do produto foi atualizado com sucesso e ajustes foram registados para mudanças de quantidade.",
                    variant: "success",
                });
            },
            onError: (errors) => {
                setIsSubmitting(false);
                toast({
                    title: "Erro",
                    description: "Ocorreu um erro ao atualizar o inventário.",
                    variant: "destructive",
                });
            }
        });
    };

    // Função para filtrar itens com base na tab ativa
    const getFilteredItems = () => {
        if (activeTab === 'product') {
            return inventoryItems.filter(item => item.product_variant_id === null);
        } else if (activeTab.startsWith('variant-')) {
            const variantId = parseInt(activeTab.replace('variant-', ''));
            return inventoryItems.filter(item => item.product_variant_id === variantId);
        }
        return [];
    };

    // Renderizar as tabs para produto principal e variantes
    const renderTabs = () => {
        return (
            <Tabs defaultValue="product" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4" style={{
                    gridTemplateColumns: `repeat(${1 + (productInventory.variants?.length || 0)}, minmax(0, 1fr))`
                }}>
                    <TabsTrigger value="product">
                        {product.name} <span className="ml-2 text-xs text-muted-foreground">(Principal)</span>
                    </TabsTrigger>

                    {productInventory.variants?.map(variant => (
                        <TabsTrigger key={variant.id} value={`variant-${variant.id}`}>
                            {variant.name}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="product">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Inventário do Produto Principal</h3>
                        {renderInventoryTable(getFilteredItems())}
                    </div>
                </TabsContent>

                {productInventory.variants?.map(variant => (
                    <TabsContent key={variant.id} value={`variant-${variant.id}`}>
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Inventário da Variante: {variant.name}</h3>
                            {renderInventoryTable(getFilteredItems())}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        );
    };

    // Renderizar a tabela de inventário
    const renderInventoryTable = (items: InventoryItem[]) => {
        return (
            <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="p-3 text-left font-medium">Armazém</th>
                            <th className="p-3 text-left font-medium">Quantidade</th>
                            <th className="p-3 text-left font-medium">Quantidade Mínima</th>
                            <th className="p-3 text-left font-medium">Localização</th>
                            <th className="p-3 text-left font-medium w-[100px]">Opções</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => {
                            const itemIndex = inventoryItems.findIndex(i =>
                                i.product_id === item.product_id &&
                                i.product_variant_id === item.product_variant_id &&
                                i.warehouse_id === item.warehouse_id
                            );

                            // Armazenar o valor original para comparação
                            const originalQuantity = productInventory.product.inventories.find(inv =>
                                inv.warehouse_id === item.warehouse_id
                            )?.quantity || 0;

                            return (
                                <tr key={`${item.warehouse_id}-${item.product_variant_id || 'main'}`} className="border-t">
                                    <td className="p-3">
                                        {item.warehouse_name}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex flex-col">
                                            <Input
                                                type="number"
                                                min="0"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(itemIndex, e.target.value)}
                                                className={cn("w-24",
                                                    item.quantity !== originalQuantity ? "border-amber-500" : ""
                                                )}
                                            />
                                            {item.id && item.quantity !== originalQuantity && (
                                                <div className="text-xs text-amber-600 mt-1">
                                                    Será registado um ajuste
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={item.min_quantity}
                                            onChange={(e) => handleMinQuantityChange(itemIndex, e.target.value)}
                                            className="w-24"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <Input
                                            type="text"
                                            placeholder="Ex: Prateleira A3"
                                            value={item.location}
                                            onChange={(e) => handleLocationChange(itemIndex, e.target.value)}
                                            className="w-full max-w-xs"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleOpenAdvancedEdit(itemIndex)}
                                            title="Mais opções"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                    Não existem registos de inventário para este item
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Gerir Inventário - ${product.name}`} />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={`/admin/products/${product.id}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Gerir Inventário</h1>
                            <p className="text-muted-foreground">{product.name} {product.sku ? `(${product.sku})` : ''}</p>
                        </div>
                    </div>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <WarehouseIcon className="h-5 w-5" />
                            Inventário por Armazém
                        </CardTitle>
                        <CardDescription>
                            Gerir as quantidades de produto disponíveis em cada armazém
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {renderTabs()}
                    </CardContent>
                </Card>

                <div className="flex justify-end mt-4 sticky bottom-0 p-4 bg-background border-t">
                    <Button variant="outline" asChild className="mr-2">
                        <Link href={`/admin/products/${product.id}`}>
                            Cancelar
                        </Link>
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                A guardar...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Guardar Alterações
                            </>
                        )}
                    </Button>
                </div>

                {/* Diálogo para edição avançada */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Opções Avançadas de Inventário</DialogTitle>
                            <DialogDescription>
                                Configure opções avançadas para este item de inventário
                            </DialogDescription>
                        </DialogHeader>

                        {selectedItem && (
                            <div className="grid gap-6 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">Produto</h3>
                                        <p>{product.name}</p>
                                        {selectedItem.product_variant_id && (
                                            <p className="text-sm text-muted-foreground">
                                                Variante: {selectedItem.variant_name}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">Armazém</h3>
                                        <p>{selectedItem.warehouse_name}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label className="font-medium text-sm">Localização</label>
                                        <Input
                                            value={selectedItem.location || ''}
                                            onChange={(e) => setSelectedItem({ ...selectedItem, location: e.target.value })}
                                            placeholder="Ex: Prateleira A, Corredor 3"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Localização específica no armazém
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="font-medium text-sm">Número do Lote</label>
                                        <Input
                                            value={selectedItem.batch_number || ''}
                                            onChange={(e) => setSelectedItem({ ...selectedItem, batch_number: e.target.value })}
                                            placeholder="Ex: LOT2023-001"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Número de lote ou série do produto
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="font-medium text-sm">Data de Validade</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !selectedItem.expiry_date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {selectedItem.expiry_date ?
                                                        format(selectedItem.expiry_date, "PP") :
                                                        "Selecione uma data"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={selectedItem.expiry_date || undefined}
                                                    onSelect={(date) => setSelectedItem({ ...selectedItem, expiry_date: date })}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <p className="text-xs text-muted-foreground">
                                            Data de validade do produto, se aplicável
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="font-medium text-sm">Custo Unitário</label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={selectedItem.unit_cost || ''}
                                            onChange={(e) => setSelectedItem({ ...selectedItem, unit_cost: parseFloat(e.target.value) || 0 })}
                                            placeholder="Ex: 123.45"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Custo por unidade (MZN)
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="font-medium text-sm">Quantidade Máxima</label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={selectedItem.max_quantity || ''}
                                            onChange={(e) => setSelectedItem({ ...selectedItem, max_quantity: parseInt(e.target.value) || 0 })}
                                            placeholder="Ex: 1000"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Capacidade máxima de armazenamento
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="font-medium text-sm">Estado</label>
                                        <Select
                                            value={selectedItem.status}
                                            onValueChange={(value) => setSelectedItem({ ...selectedItem, status: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Ativo</SelectItem>
                                                <SelectItem value="reserved">Reservado</SelectItem>
                                                <SelectItem value="damaged">Danificado</SelectItem>
                                                <SelectItem value="expired">Expirado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Estado atual deste item no inventário
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <label className="font-medium text-sm">Notas</label>
                                    <Textarea
                                        value={selectedItem.notes || ''}
                                        onChange={(e) => setSelectedItem({ ...selectedItem, notes: e.target.value })}
                                        placeholder="Observações adicionais sobre este item..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end gap-2 mt-4">
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={() => handleSaveAdvancedEdit(selectedItem)}>
                                        Aplicar Alterações
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
};

export default ManageInventory;
