// filepath: /Users/macair/projects/laravel/matony/resources/js/pages/Admin/Inventories/Adjustments/Show.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, FileText, Trash2, User } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { AdjustmentType, Inventory, InventoryAdjustment } from '../_components/types';
import DeleteAdjustmentDialog from '../_components/DeleteAdjustmentDialog';
import { useState } from 'react';

interface Props {
    inventory: Inventory;
    adjustment: InventoryAdjustment;
    adjustmentTypes: AdjustmentType[];
}

export default function Show({ inventory, adjustment, adjustmentTypes }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Breadcrumbs dinâmicos
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
        {
            title: 'Ajustes',
            href: `/admin/inventories/${inventory.id}/adjustments`,
        },
        {
            title: `Ajuste #${adjustment.id}`,
            href: `/admin/inventories/${inventory.id}/adjustments/${adjustment.id}`,
        },
    ];

    // Formatação de data
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy, HH:mm", {
            locale: pt,
        });
    };

    // Obter o tipo de ajuste formatado
    const getAdjustmentType = (type: string) => {
        return adjustmentTypes.find(t => t.value === type)?.label || type;
    };

    // Obter a descrição do tipo de ajuste
    const getAdjustmentDescription = (type: string) => {
        return adjustmentTypes.find(t => t.value === type)?.description || '';
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ajuste de Inventário #${adjustment.id}`} />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={`/admin/inventories/${inventory.id}/adjustments`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">Ajuste de Inventário #{adjustment.id}</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/inventories/${inventory.id}/adjustments/${adjustment.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                        </Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Coluna 1: Detalhes do produto e ajuste */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Detalhes do Ajuste</CardTitle>
                                <CardDescription>
                                    Informações sobre este ajuste de inventário
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Produto e Quantidade */}
                                <div>
                                    <h3 className="font-medium text-lg mb-3">Produto</h3>
                                    <div className="flex flex-col space-y-1">
                                        <div className="font-medium">{inventory.product?.name}</div>
                                        {inventory.productVariant && (
                                            <div className="text-sm text-muted-foreground">
                                                Variante: {inventory.productVariant.name}
                                            </div>
                                        )}
                                        <div className="text-sm text-muted-foreground">
                                            Armazém: {inventory.warehouse?.name}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Detalhes do Ajuste */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium">Tipo de Ajuste</h3>
                                        <div className="mt-1">
                                            <Badge variant={getAdjustmentBadgeVariant(adjustment.type)}>
                                                {getAdjustmentType(adjustment.type)}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {getAdjustmentDescription(adjustment.type)}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium">Quantidade</h3>
                                        <div className={`mt-1 font-bold ${adjustment.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {adjustment.quantity > 0 ? `+${adjustment.quantity}` : adjustment.quantity}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Referência e Fornecedor */}
                                <div className="grid grid-cols-2 gap-4">
                                    {adjustment.reference_number && (
                                        <div>
                                            <h3 className="font-medium flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                Referência
                                            </h3>
                                            <div className="mt-1">
                                                {adjustment.reference_number}
                                            </div>
                                        </div>
                                    )}

                                    {adjustment.supplier && (
                                        <div>
                                            <h3 className="font-medium">Fornecedor</h3>
                                            <div className="mt-1">
                                                {adjustment.supplier.name}
                                                {adjustment.supplier.company_name && (
                                                    <span className="text-sm text-muted-foreground block">
                                                        {adjustment.supplier.company_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {(adjustment.reason || adjustment.notes) && (
                                    <>
                                        <Separator />

                                        {/* Motivo e Notas */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {adjustment.reason && (
                                                <div>
                                                    <h3 className="font-medium">Motivo</h3>
                                                    <div className="mt-1 whitespace-pre-wrap">
                                                        {adjustment.reason}
                                                    </div>
                                                </div>
                                            )}

                                            {adjustment.notes && (
                                                <div>
                                                    <h3 className="font-medium">Notas Adicionais</h3>
                                                    <div className="mt-1 whitespace-pre-wrap">
                                                        {adjustment.notes}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coluna 2: Metadados */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Metadados</CardTitle>
                                <CardDescription>
                                    Informações sobre registo e utilizador
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Criado em
                                    </div>
                                    <div className="mt-1">
                                        {formatDate(adjustment.created_at)}
                                    </div>
                                </div>

                                {adjustment.user && (
                                    <div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Registado por
                                        </div>
                                        <div className="mt-1">
                                            {adjustment.user.name}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Ações</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button asChild variant="outline" className="w-full justify-start">
                                    <Link href={`/admin/inventories/${inventory.id}`}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Ver Inventário
                                    </Link>
                                </Button>

                                <Button asChild variant="outline" className="w-full justify-start">
                                    <Link href={`/admin/inventories/${inventory.id}/adjustments`}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Ver Todos os Ajustes
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <DeleteAdjustmentDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    inventoryId={inventory.id}
                    adjustmentId={adjustment.id}
                    adjustmentType={getAdjustmentType(adjustment.type)}
                    quantity={adjustment.quantity}
                />
            </div>
        </AppLayout>
    );
}
