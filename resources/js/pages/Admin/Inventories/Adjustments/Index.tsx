// filepath: /Users/macair/projects/laravel/matony/resources/js/pages/Admin/Inventories/Adjustments/Index.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteAlert } from '@/components/delete-alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Eye, Filter, PlusCircle, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdjustmentType, Inventory, InventoryAdjustment, Supplier } from '../_components/types';

interface Props {
    inventory: Inventory;
    adjustments: {
        data: InventoryAdjustment[];
        links: any[];
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
    suppliers: Supplier[];
    adjustmentTypes: AdjustmentType[];
    filters?: {
        type?: string | null;
        supplier_id?: string | null;
    };
}

export default function Index({ inventory, adjustments, suppliers, adjustmentTypes, filters = {} }: Props) {
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [adjustmentToDelete, setAdjustmentToDelete] = useState<number | null>(null);
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [supplierFilter, setSupplierFilter] = useState(filters.supplier_id || '');
    const { toast } = useToast();
    const { flash } = usePage().props as any;

    // Mostrar mensagens flash vindas do backend
    useEffect(() => {
        if (flash?.success) {
            toast({
                title: 'Operação bem sucedida',
                description: flash.success,
                variant: 'success',
            });
        }

        if (flash?.error) {
            toast({
                title: 'Erro',
                description: flash.error,
                variant: 'destructive',
            });
        }
    }, [flash, toast]);

    // Construir breadcrumbs dinâmicos
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
    ];

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

    // Função para formatar quantidade do ajuste com sinal
    const formatAdjustmentQuantity = (quantity: number) => {
        return quantity > 0 ? `+${quantity}` : `${quantity}`;
    };

    const handleDeleteClick = (id: number) => {
        setAdjustmentToDelete(id);
        setDeleteAlertOpen(true);
    };

    // Aplicar filtros
    const applyFilters = () => {
        router.get(
            `/admin/inventories/${inventory.id}/adjustments`,
            {
                type: typeFilter || null,
                supplier_id: supplierFilter || null,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ajustes de Inventário - ${inventory.product?.name || 'Inventário'}`} />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={`/admin/inventories/${inventory.id}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">Ajustes de Inventário</h1>
                    </div>

                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href={`/admin/inventories/${inventory.id}/adjustments/create`}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Novo Ajuste
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Detalhes do Produto */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Detalhes do Inventário</CardTitle>
                            <Badge className="ml-2">Stock: {inventory.quantity}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <h3 className="font-medium">Produto</h3>
                                <div className="mt-1">
                                    {inventory.product?.name}
                                    {inventory.productVariant && (
                                        <span className="text-muted-foreground text-sm block">
                                            Variante: {inventory.productVariant.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium">Armazém</h3>
                                <div className="mt-1">
                                    {inventory.warehouse?.name}
                                    {inventory.location && (
                                        <span className="text-muted-foreground text-sm block">
                                            Localização: {inventory.location}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium">Lote / Validade</h3>
                                <div className="mt-1">
                                    {inventory.batch_number || 'N/A'}
                                    {inventory.expiry_date && (
                                        <span className="text-muted-foreground text-sm block">
                                            Validade: {new Date(inventory.expiry_date).toLocaleDateString('pt-PT')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de Ajustes */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle>Lista de Ajustes</CardTitle>

                            <div className="flex flex-col md:flex-row gap-2">
                                <Select
                                    value={typeFilter}
                                    onValueChange={setTypeFilter}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Filtrar por tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* <SelectItem value="">Todos os tipos</SelectItem> */}
                                        {adjustmentTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={supplierFilter}
                                    onValueChange={setSupplierFilter}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Filtrar por fornecedor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* <SelectItem value="">Todos os fornecedores</SelectItem> */}
                                        {suppliers.map((supplier) => (
                                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                {supplier.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button variant="secondary" onClick={applyFilters} size="default">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filtrar
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">ID</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Quantidade</TableHead>
                                        <TableHead>Referência</TableHead>
                                        <TableHead>Fornecedor</TableHead>
                                        <TableHead>Utilizador</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead className="text-right">Acções</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {adjustments.data.length > 0 ? (
                                        adjustments.data.map((adjustment) => (
                                            <TableRow key={adjustment.id}>
                                                <TableCell className="font-medium">{adjustment.id}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getAdjustmentBadgeVariant(adjustment.type)}>
                                                        {adjustmentTypes.find(t => t.value === adjustment.type)?.label || adjustment.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className={adjustment.quantity >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                                    {formatAdjustmentQuantity(adjustment.quantity)}
                                                </TableCell>
                                                <TableCell>{adjustment.reference_number || 'N/A'}</TableCell>
                                                <TableCell>{adjustment.supplier?.name || 'N/A'}</TableCell>
                                                <TableCell>{adjustment.user?.name || 'Sistema'}</TableCell>
                                                <TableCell>{new Date(adjustment.created_at).toLocaleString('pt-PT')}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/admin/inventories/${inventory.id}/adjustments/${adjustment.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteClick(adjustment.id)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center">
                                                Nenhum ajuste encontrado
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Paginação */}
                        {adjustments.last_page > 1 && (
                            <div className="flex items-center justify-between px-2 py-4 mt-4">
                                <div className="text-muted-foreground text-sm">
                                    Mostrando {adjustments.from} a {adjustments.to} de {adjustments.total} ajustes
                                </div>
                                <div className="flex gap-1">
                                    {adjustments.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.get(`/admin/inventories/${inventory.id}/adjustments?page=${adjustments.current_page - 1}`)}
                                        >
                                            Anterior
                                        </Button>
                                    )}

                                    {adjustments.current_page < adjustments.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.get(`/admin/inventories/${inventory.id}/adjustments?page=${adjustments.current_page + 1}`)}
                                        >
                                            Próximo
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Alerta de confirmação de exclusão */}
            {adjustmentToDelete && (
                <DeleteAlert
                    isOpen={deleteAlertOpen}
                    onClose={() => {
                        setDeleteAlertOpen(false);
                        setAdjustmentToDelete(null);
                    }}
                    title="Eliminar Ajuste de Inventário"
                    description="Tem certeza que deseja eliminar este ajuste? Esta acção irá reverter a quantidade aplicada ao inventário e não pode ser desfeita."
                    deleteUrl={`/admin/inventories/${inventory.id}/adjustments/${adjustmentToDelete}`}
                />
            )}
        </AppLayout>
    );
}
