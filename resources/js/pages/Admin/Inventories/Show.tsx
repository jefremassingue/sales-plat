// filepath: /Users/macair/projects/laravel/matony/resources/js/pages/Admin/Inventories/Show.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DeleteAlert } from '@/components/delete-alert';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Box, Calendar, Edit, PackageCheck, PlusCircle, Trash, User, WarehouseIcon, Tag } from 'lucide-react';
import { useState } from 'react';
import { AdjustmentType, Inventory, InventoryAdjustment } from './_components/types';

interface Props {
    inventory: Inventory;
    statuses: { value: string; label: string }[];
    recentAdjustments?: InventoryAdjustment[];
    adjustmentTypes?: AdjustmentType[];
}

export default function Show({ inventory, statuses, recentAdjustments = [], adjustmentTypes = [] }: Props) {
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const { toast } = useToast();

    // Criar migalhas de pão dinâmicas
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Inventário',
            href: '/admin/inventories',
        },
        {
            title: `Registo #${inventory.id}`,
            href: `/admin/inventories/${inventory.id}`,
        },
    ];

    // Função para obter a cor do badge com base no status
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'reserved':
                return 'warning';
            case 'damaged':
                return 'destructive';
            case 'expired':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    // Função para obter a cor do badge com base no tipo de ajuste
    const getAdjustmentBadgeVariant = (type: string) => {
        switch (type) {
            case 'addition':
            case 'initial':
                return 'success';
            case 'subtraction':
            case 'transfer':
                return 'warning';
            case 'correction':
                return 'secondary';
            case 'loss':
            case 'damaged':
            case 'expired':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    // Formatar data de validade
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-PT');
    };

    // Formatar valor monetário
    const formatCurrency = (value: number | null) => {
        if (value === null) return 'N/A';
        return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN' }).format(value);
    };

    // Formatar quantidade do ajuste com sinal
    const formatAdjustmentQuantity = (quantity: number) => {
        return quantity > 0 ? `+${quantity}` : `${quantity}`;
    };

    // Obter o tipo de ajuste pela chave
    const getAdjustmentTypeLabel = (type: string) => {
        const typeObj = adjustmentTypes.find(t => t.value === type);
        return typeObj ? typeObj.label : type;
    };

    const totalValue = inventory.unit_cost && inventory.quantity > 0
        ? inventory.unit_cost * inventory.quantity
        : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detalhes do Registo de Inventário #${inventory.id}`} />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/admin/inventories">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">Detalhes do Registo de Inventário</h1>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/admin/inventories/${inventory.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={() => setDeleteAlertOpen(true)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Eliminar
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 mb-6 md:grid-cols-3">
                    {/* Informações Básicas */}
                    <Card className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">Informações Básicas</CardTitle>
                                <CardDescription>Detalhes do produto e quantidade</CardDescription>
                            </div>
                            <Badge variant={getStatusBadgeVariant(inventory.status)}>
                                {statuses.find(s => s.value === inventory.status)?.label || inventory.status}
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-md bg-primary/10 p-3">
                                        <PackageCheck className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-medium">Produto</h3>
                                        <div className="text-base">{inventory.product?.name || 'N/A'}</div>
                                        <div className="text-sm text-muted-foreground">
                                            SKU: {inventory.product?.sku || 'N/A'}
                                        </div>
                                        {inventory.productVariant && (
                                            <div className="text-sm text-muted-foreground">
                                                Variante: {inventory.productVariant.name}
                                                {inventory.productVariant.sku && ` (${inventory.productVariant.sku})`}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="rounded-md bg-primary/10 p-3">
                                        <WarehouseIcon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-medium">Armazém</h3>
                                        <div className="text-base">{inventory.warehouse?.name || 'N/A'}</div>
                                        {inventory.location && (
                                            <div className="text-sm text-muted-foreground">
                                                Localização: {inventory.location}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <h3 className="font-medium">Quantidade Atual</h3>
                                    <div className="mt-1 text-2xl font-bold">{inventory.quantity}</div>
                                    {inventory.quantity < inventory.min_quantity && (
                                        <div className="mt-1 text-sm text-destructive">
                                            Abaixo do mínimo recomendado
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-medium">Quantidade Mínima</h3>
                                    <div className="mt-1 text-lg">{inventory.min_quantity}</div>
                                </div>
                                <div>
                                    <h3 className="font-medium">Quantidade Máxima</h3>
                                    <div className="mt-1 text-lg">{inventory.max_quantity || 'Não definido'}</div>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            {/* ATUALIZADO: Seção de preços aprimorada */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="font-medium">Custo Unitário</h3>
                                    <div className="mt-1 text-lg font-bold">{formatCurrency(inventory.unit_cost)}</div>
                                    <div className="text-sm text-muted-foreground">
                                        Custo por unidade deste item
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium">Valor Total em Stock</h3>
                                    <div className="mt-1 text-lg font-bold">
                                        {totalValue ? formatCurrency(totalValue) : 'N/A'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Quantidade × Custo Unitário
                                    </div>
                                </div>
                            </div>

                            {/* Preço de venda do produto */}
                            <div className="bg-primary/5 p-3 rounded-md mt-2">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Tag className="h-4 w-4" />
                                    Preço de Venda do Produto
                                </h3>
                                <div className="mt-1 flex items-baseline gap-3">
                                    <span className="text-xl font-bold">
                                        {formatCurrency(inventory.product?.price)}
                                    </span>
                                    {inventory.unit_cost && inventory.product?.price && (
                                        <span className="text-sm text-muted-foreground">
                                            Margem: {Math.round((inventory.product.price / inventory.unit_cost - 1) * 100)}%
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h3 className="font-medium">Número do Lote</h3>
                                    <div className="mt-1">{inventory.batch_number || 'Não definido'}</div>
                                </div>
                                <div>
                                    <h3 className="font-medium flex items-center gap-1">
                                        <Calendar className="h-4 w-4" /> Data de Validade
                                    </h3>
                                    <div className="mt-1">{formatDate(inventory.expiry_date)}</div>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div>
                                <h3 className="font-medium">Custo Unitário</h3>
                                <div className="mt-1 text-lg">{formatCurrency(inventory.unit_cost)}</div>
                                {inventory.unit_cost && inventory.quantity > 0 && (
                                    <div className="text-sm text-muted-foreground">
                                        Valor total: {formatCurrency(inventory.unit_cost * inventory.quantity)}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informações Adicionais */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Informações Adicionais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {inventory.notes && (
                                <div>
                                    <h3 className="font-medium">Notas</h3>
                                    <div className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
                                        {inventory.notes}
                                    </div>
                                </div>
                            )}

                            <Separator className="my-4" />

                            <div>
                                <h3 className="font-medium flex items-center gap-1">
                                    <User className="h-4 w-4" /> Última Atualização
                                </h3>
                                <div className="mt-2">
                                    {inventory.user ? (
                                        <div className="text-sm">
                                            <div className="font-medium">{inventory.user.name}</div>
                                            <div className="text-muted-foreground">{inventory.user.email}</div>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">Sistema</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium">Data de Registo</h3>
                                <div className="mt-1 text-sm">
                                    {new Date(inventory.created_at).toLocaleString('pt-PT')}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium">Última Atualização</h3>
                                <div className="mt-1 text-sm">
                                    {new Date(inventory.updated_at).toLocaleString('pt-PT')}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Seção de Ajustes de Inventário */}
                <Card className="mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Ajustes de Inventário</CardTitle>
                            <CardDescription>Movimentações e alterações de stock</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild>
                                <Link href={`/admin/inventories/${inventory.id}/adjustments/create`}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Novo Ajuste
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={`/admin/inventories/${inventory.id}/adjustments`}>
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Ver Todos
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentAdjustments && recentAdjustments.length > 0 ? (
                            <div className="space-y-4">
                                {recentAdjustments.slice(0, 5).map((adjustment) => (
                                    <div key={adjustment.id} className="flex items-center justify-between py-2 border-b">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={getAdjustmentBadgeVariant(adjustment.type)}>
                                                    {getAdjustmentTypeLabel(adjustment.type)}
                                                </Badge>
                                                <span className="font-medium">{formatAdjustmentQuantity(adjustment.quantity)}</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {adjustment.reference_number ? `Ref: ${adjustment.reference_number} | ` : ''}
                                                Data: {new Date(adjustment.created_at).toLocaleString('pt-PT')}
                                            </div>
                                            {adjustment.supplier && (
                                                <div className="text-sm text-muted-foreground">
                                                    Fornecedor: {adjustment.supplier.name}
                                                </div>
                                            )}
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/admin/inventories/${inventory.id}/adjustments/${adjustment.id}`}>
                                                Detalhes
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                Não existem ajustes registados para este item de inventário.
                                <div className="mt-4">
                                    <Button asChild>
                                        <Link href={`/admin/inventories/${inventory.id}/adjustments/create`}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Criar Primeiro Ajuste
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Alerta de confirmação de exclusão */}
            <DeleteAlert
                isOpen={deleteAlertOpen}
                onClose={() => setDeleteAlertOpen(false)}
                title="Eliminar Registo de Inventário"
                description="Tem certeza que deseja eliminar este registo de inventário? Esta acção não pode ser desfeita."
                deleteUrl={`/admin/inventories/${inventory.id}`}
            />
        </AppLayout>
    );
}
