import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteAlert } from '@/components/delete-alert';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Building2, Edit, MapPin, Phone, Mail, User, Database, Trash, BarChart2, AlertTriangle, PackageCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Warehouse } from './_components';

interface InventoryItem {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  variant_id?: number;
  variant_name?: string;
  quantity: number;
  min_quantity: number;
  location?: string;
  status: string;
  unit_cost?: number;
}

interface InventoryStats {
  totalProducts: number;
  totalItems: number;
  totalRecords: number;
  lowStockCount: number;
}

interface StatusSummary {
  status: string;
  count: number;
  total_quantity: number;
}

interface Props {
  warehouse: Warehouse;
  inventoryStats: InventoryStats;
  inventoryItems: InventoryItem[];
  inventoryByStatus: StatusSummary[];
}

export default function Show({ warehouse, inventoryStats, inventoryItems, inventoryByStatus }: Props) {
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const { toast } = useToast();
  const { flash } = usePage().props as any;

  // Mostrar mensagens flash vindas do backend
  useEffect(() => {
    if (flash?.success) {
      toast({
        title: "Operação bem sucedida",
        description: flash.success,
        variant: "success",
      });
    }

    if (flash?.error) {
      toast({
        title: "Erro",
        description: flash.error,
        variant: "destructive",
      });
    }
  }, [flash, toast]);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Armazéns',
      href: '/admin/warehouses',
    },
    {
      title: warehouse.name,
      href: `/admin/warehouses/${warehouse.id}`,
    },
  ];

  const formatDateTime = (dateTimeString: string) => {
    return format(new Date(dateTimeString), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: pt });
  };

  // Função para obter a cor do badge com base no status do inventário
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

  // Função para formatar valores monetários
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN' }).format(value);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={warehouse.name} />

      <div className="container px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/warehouses">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {warehouse.name}
              </h1>
              {warehouse.code && (
                <p className="text-muted-foreground">Código: {warehouse.code}</p>
              )}
            </div>
            <Badge variant={warehouse.active ? "success" : "secondary"}>
              {warehouse.active ? 'Activo' : 'Inactivo'}
            </Badge>
            {warehouse.is_main && (
              <Badge variant="primary">Armazém Principal</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/warehouses/${warehouse.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteAlertOpen(true)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>

        <div className="grid gap-6 mt-6 md:grid-cols-2">
          {/* Card de Detalhes Gerais do Armazém */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Armazém</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Nome do Armazém</h3>
                <p>{warehouse.name}</p>
              </div>

              {warehouse.code && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Código</h3>
                  <p>{warehouse.code}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Estado</h3>
                <p className="flex items-center gap-2">
                  <Badge variant={warehouse.active ? "success" : "secondary"}>
                    {warehouse.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Tipo</h3>
                <p className="flex items-center gap-2">
                  {warehouse.is_main ? (
                    <Badge variant="primary">Armazém Principal</Badge>
                  ) : (
                    <span>Armazém Secundário</span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Criado em</h3>
                  <p>{formatDateTime(warehouse.created_at)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Última actualização</h3>
                  <p>{formatDateTime(warehouse.updated_at)}</p>
                </div>
              </div>

              {warehouse.description && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Descrição</h3>
                  <p className="whitespace-pre-line">{warehouse.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card de Contacto e Localização */}
          <Card>
            <CardHeader>
              <CardTitle>Contacto & Localização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {warehouse.email && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Email</h3>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${warehouse.email}`} className="text-blue-600 hover:underline">
                      {warehouse.email}
                    </a>
                  </p>
                </div>
              )}

              {warehouse.phone && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Telefone</h3>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${warehouse.phone}`} className="hover:underline">
                      {warehouse.phone}
                    </a>
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Localização</h3>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                  <div>
                    {warehouse.address ? (
                      <>
                        <p>{warehouse.address}</p>
                        <p>
                          {warehouse.city || ''}
                          {warehouse.province ? (warehouse.city ? `, ${warehouse.province}` : warehouse.province) : ''}
                          {warehouse.postal_code ? ` ${warehouse.postal_code}` : ''}
                        </p>
                        <p>{warehouse.country}</p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Sem endereço definido</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card do Gestor do Armazém */}
        {warehouse.manager && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Gestor do Armazém
                </div>
              </CardTitle>
              <CardDescription>
                Utilizador responsável por este armazém
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Nome</h3>
                  <p>{warehouse.manager.name}</p>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Email</h3>
                  <p>
                    <a href={`mailto:${warehouse.manager.email}`} className="text-blue-600 hover:underline">
                      {warehouse.manager.email}
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Painel de Estatísticas de Inventário */}
        <div className="grid gap-6 mt-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Total de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{inventoryStats.totalProducts}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Produtos únicos em armazém
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Total de Itens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{inventoryStats.totalItems}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Quantidade total em stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Registos de Inventário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{inventoryStats.totalRecords}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Entradas únicas de stock
              </p>
            </CardContent>
          </Card>

          <Card className={inventoryStats.lowStockCount > 0 ? "border-yellow-400" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-1">
                {inventoryStats.lowStockCount > 0 && <AlertTriangle className="text-yellow-500 h-4 w-4" />}
                Stock Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{inventoryStats.lowStockCount}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Produtos abaixo do mínimo
              </p>
              {inventoryStats.lowStockCount > 0 && (
                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                  <Link href={`/admin/inventories?warehouse_id=${warehouse.id}&low_stock=true`}>
                    Ver Detalhes
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sumário de inventário por estado */}
        {inventoryByStatus.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Resumo por Estado
              </CardTitle>
              <CardDescription>
                Distribuição de inventário por estado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventoryByStatus.map((statusItem) => (
                  <div key={statusItem.status} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(statusItem.status)}>
                          {statusItem.status === 'active' ? 'Activo' :
                           statusItem.status === 'reserved' ? 'Reservado' :
                           statusItem.status === 'damaged' ? 'Danificado' :
                           statusItem.status === 'expired' ? 'Expirado' : statusItem.status}
                        </Badge>
                        <span>{statusItem.count} itens</span>
                      </div>
                      <span className="font-medium">{statusItem.total_quantity} un.</span>
                    </div>

                    {/* Barra de progresso para representar visualmente */}
                    <Progress value={
                      inventoryStats.totalItems > 0
                        ? (statusItem.total_quantity / inventoryStats.totalItems) * 100
                        : 0
                    } className={
                      statusItem.status === 'active' ? "bg-green-100" :
                      statusItem.status === 'reserved' ? "bg-yellow-100" :
                      statusItem.status === 'damaged' ? "bg-red-100" :
                      statusItem.status === 'expired' ? "bg-gray-100" : "bg-gray-100"
                    } />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card de Inventário com dados reais */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Inventário do Armazém
                  </div>
                </CardTitle>
                <CardDescription>
                  Lista dos principais produtos em stock neste armazém
                </CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/admin/inventories?warehouse_id=${warehouse.id}`}>
                  Ver Tudo
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {inventoryItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Produto</th>
                      <th className="px-4 py-2 text-left">SKU</th>
                      <th className="px-4 py-2 text-left">Localização</th>
                      <th className="px-4 py-2 text-right">Quantidade</th>
                      <th className="px-4 py-2 text-right">Preço</th>
                      <th className="px-4 py-2 text-left">Estado</th>
                      <th className="px-4 py-2 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryItems.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-2">
                          {item.product_name}
                          {item.variant_name && (
                            <span className="text-sm text-muted-foreground block">
                              {item.variant_name}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">{item.sku}</td>
                        <td className="px-4 py-2">{item.location || 'N/A'}</td>
                        <td className="px-4 py-2 text-right font-medium">
                          {item.quantity}
                          {item.quantity < item.min_quantity && item.min_quantity > 0 && (
                            <Badge variant="warning" className="ml-2">Baixo</Badge>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="font-medium">
                            {formatCurrency(item.unit_cost)}
                          </div>
                          {item.quantity > 0 && item.unit_cost && (
                            <div className="text-xs text-muted-foreground">
                              Total: {formatCurrency(item.unit_cost * item.quantity)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant={getStatusBadgeVariant(item.status)}>
                            {item.status === 'active' ? 'Activo' :
                             item.status === 'reserved' ? 'Reservado' :
                             item.status === 'damaged' ? 'Danificado' :
                             item.status === 'expired' ? 'Expirado' : item.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/inventories/${item.id}`}>
                              <PackageCheck className="h-4 w-4 mr-1" />
                              Detalhes
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>Não existem produtos em stock neste armazém.</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href={`/admin/inventories/create?warehouse_id=${warehouse.id}`}>
                    Adicionar Stock
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card de valor total de inventário */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Valor do Inventário</CardTitle>
            <CardDescription>Resumo do valor total do inventário neste armazém</CardDescription>
          </CardHeader>
          <CardContent>
            {inventoryItems.length > 0 ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Valor Total em Stock</h3>
                    <div className="text-2xl font-bold mt-1">
                      {formatCurrency(
                        inventoryItems.reduce((total, item) =>
                          total + (item.unit_cost || 0) * item.quantity, 0)
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Baseado no custo unitário de cada item
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Valor Médio por Produto</h3>
                    <div className="text-2xl font-bold mt-1">
                      {formatCurrency(
                        inventoryItems.length > 0
                          ? inventoryItems.reduce((total, item) =>
                              total + (item.unit_cost || 0), 0) / inventoryItems.length
                          : 0
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Custo médio por produto neste armazém
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Produtos com maior valor em stock</h3>
                  <div className="space-y-2">
                    {[...inventoryItems]
                      .sort((a, b) => ((b.unit_cost || 0) * b.quantity) - ((a.unit_cost || 0) * a.quantity))
                      .slice(0, 5)
                      .map(item => (
                        <div key={item.id} className="flex items-center justify-between py-1 border-b">
                          <div>{item.product_name}</div>
                          <div className="font-medium">
                            {formatCurrency((item.unit_cost || 0) * item.quantity)}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Não há produtos em stock para calcular o valor do inventário.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerta de confirmação de exclusão */}
      <DeleteAlert
        isOpen={deleteAlertOpen}
        onClose={() => setDeleteAlertOpen(false)}
        title="Eliminar Armazém"
        description="Tem certeza que deseja eliminar este armazém? Esta acção não pode ser desfeita."
        deleteUrl={`/admin/warehouses/${warehouse.id}`}
      />
    </AppLayout>
  );
}
