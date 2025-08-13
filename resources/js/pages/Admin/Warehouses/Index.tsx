import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Edit,
  Eye,
  Filter,
  Grid as GridIcon,
  List as ListIcon,
  MapPin,
  Phone,
  Mail,
  Plus,
  Trash,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Warehouse, User as ManagerUser } from './_components';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DeleteAlert } from '@/components/delete-alert';
import { can } from '@/lib/utils';

interface Props {
  warehouses: {
    data: Warehouse[];
    links: any[];
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  filters?: {
    search?: string | null;
    active?: string | null;
    is_main?: string | null;
    sort_field?: string;
    sort_order?: string;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Armazéns',
    href: '/admin/warehouses',
  },
];

export default function Index({ warehouses, filters = {} }: Props) {
  const [selectedWarehouses, setSelectedWarehouses] = useState<number[]>([]);
  const [viewTab, setViewTab] = useState<string>('table');
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<number | null>(null);
  const [bulkDeleteAlertOpen, setBulkDeleteAlertOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [activeFilter, setActiveFilter] = useState(filters.active || '');
  const [isMainFilter, setIsMainFilter] = useState(filters.is_main || '');
  const [sortField, setSortField] = useState(filters.sort_field || 'name');
  const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

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

  const handleSelectAll = () => {
    if (selectedWarehouses.length === warehouses.data.length) {
      setSelectedWarehouses([]);
    } else {
      setSelectedWarehouses(warehouses.data.map((warehouse) => warehouse.id));
    }
  };

  const handleSelect = (id: number) => {
    if (selectedWarehouses.includes(id)) {
      setSelectedWarehouses(selectedWarehouses.filter((warehouseId) => warehouseId !== id));
    } else {
      setSelectedWarehouses([...selectedWarehouses, id]);
    }
  };

  const handleDeleteClick = (id: number) => {
    setWarehouseToDelete(id);
    setDeleteAlertOpen(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedWarehouses.length === 0) return;
    setBulkDeleteAlertOpen(true);
  };

  const handleBulkDelete = () => {
    toast({
      title: 'Não implementado',
      description: 'A exclusão em massa ainda não foi implementada.',
      variant: 'default',
    });
    setBulkDeleteAlertOpen(false);
  };

  // Função de debounce para pesquisa
  const debouncedSearch = (value: string) => {
    // Limpa o timeout anterior se existir
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Define o valor da pesquisa imediatamente para atualizar a UI
    setSearchQuery(value);

    // Cria um novo timeout para enviar a pesquisa após 500ms
    const timeout = setTimeout(() => {
      applyFilters({
        search: value,
        active: activeFilter,
        is_main: isMainFilter,
        sort_field: sortField,
        sort_order: sortOrder,
      });
    }, 500);

    setSearchTimeout(timeout);
  };

  // Limpar o timeout quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Aplicar filtros
  const applyFilters = (filterParams: {
    search?: string | null;
    active?: string | null;
    is_main?: string | null;
    sort_field?: string;
    sort_order?: string;
  }) => {
    router.get(
      '/admin/warehouses',
      {
        search: filterParams.search || null,
        active: filterParams.active || null,
        is_main: filterParams.is_main || null,
        sort_field: filterParams.sort_field || 'name',
        sort_order: filterParams.sort_order || 'asc',
      },
      {
        preserveState: true,
        replace: true,
      },
    );
  };

  // Alternar ordem de classificação
  const toggleSort = (field: string) => {
    const newOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    applyFilters({
      search: searchQuery,
      active: activeFilter,
      is_main: isMainFilter,
      sort_field: field,
      sort_order: newOrder,
    });
  };

  // Função para renderizar cards de armazéns
  const renderWarehouseCard = (warehouse: Warehouse) => {
    return (
      <Card key={warehouse.id} className="flex h-full flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              <div className="flex items-center space-x-2">
                <Building2 size={16} className="shrink-0" />
                <span>{warehouse.name}</span>
              </div>
              {warehouse.code && <span className="ml-2 text-sm font-normal">({warehouse.code})</span>}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={warehouse.active ? 'success' : 'secondary'}>
                {warehouse.active ? 'Activo' : 'Inactivo'}
              </Badge>
              {warehouse.is_main && (
                <Badge variant="primary">Principal</Badge>
              )}
            </div>
          </div>
          <div className="text-muted-foreground text-sm">
            {warehouse.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {warehouse.email}</div>}
            {warehouse.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {warehouse.phone}</div>}
          </div>
        </CardHeader>
        <CardContent className="flex-grow text-sm">
          {warehouse.address && (
            <div className="mb-2">
              <div className="font-medium">Morada:</div>
              <div className="flex items-start gap-1 mt-1">
                <MapPin className="h-3 w-3 mt-1" />
                <div>
                  <div>{warehouse.address}</div>
                  <div>
                    {warehouse.city}
                    {warehouse.province ? `, ${warehouse.province}` : ''}
                    {warehouse.postal_code ? ` ${warehouse.postal_code}` : ''}
                  </div>
                  <div>{warehouse.country}</div>
                </div>
              </div>
            </div>
          )}

          {warehouse.manager && (
            <div className="bg-primary/10 mt-2 rounded-md p-2">
              <div className="flex items-center gap-1 font-medium">
                <User className="h-3 w-3" />
                Gestor:
              </div>
              <div>{warehouse.manager.name}</div>
              <div className="text-xs">{warehouse.manager.email}</div>
            </div>
          )}
        </CardContent>
        <div className="mt-auto flex justify-end gap-2 border-t p-4 pt-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/warehouses/${warehouse.id}`}>
              <Eye className="mr-1 h-4 w-4" />
              Ver
            </Link>
            {can('admin-warehouse.destroy') && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
              >
                <Trash className="mr-2 h-4 w-4" />
                Eliminar Selecionados
              </Button>
            )}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gerir Armazéns" />

      <div className="container px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gerir Armazéns</h1>
          <div className="flex gap-2">
            {can('admin-warehouse.create') && (
              <Button asChild>
                <Link href="/admin/warehouses/create">
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Novo Armazm</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Armazéns</CardTitle>

                <div className="flex items-center gap-2">
                  {selectedWarehouses.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={handleBulkDeleteClick}>
                      <Trash className="mr-2 h-4 w-4" />
                      Eliminar Selecionados
                    </Button>
                  )}
                  <Tabs value={viewTab} onValueChange={setViewTab} className="w-auto">
                    <TabsList>
                      <TabsTrigger value="table">
                        <ListIcon className="mr-1 h-4 w-4" />
                        Tabela
                      </TabsTrigger>
                      <TabsTrigger value="cards">
                        <GridIcon className="mr-1 h-4 w-4" />
                        Cards
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* Área de filtros */}
              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Pesquisar por nome, código, email ou telefone"
                    value={searchQuery}
                    onChange={(e) => debouncedSearch(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Select
                    value={activeFilter}
                    onValueChange={(value) => {
                      setActiveFilter(value);
                      applyFilters({
                        search: searchQuery,
                        active: value,
                        is_main: isMainFilter,
                        sort_field: sortField,
                        sort_order: sortOrder,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Estado do armazém" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* <SelectItem value="">Todos os estados</SelectItem> */}
                      <SelectItem value="true">Activos</SelectItem>
                      <SelectItem value="false">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={isMainFilter}
                    onValueChange={(value) => {
                      setIsMainFilter(value);
                      applyFilters({
                        search: searchQuery,
                        active: activeFilter,
                        is_main: value,
                        sort_field: sortField,
                        sort_order: sortOrder,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de armazém" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* <SelectItem value="">Todos os tipos</SelectItem> */}
                      <SelectItem value="true">Principal</SelectItem>
                      <SelectItem value="false">Secundário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end md:col-span-4">
                  <Button
                    onClick={() =>
                      applyFilters({
                        search: searchQuery,
                        active: activeFilter,
                        is_main: isMainFilter,
                        sort_field: sortField,
                        sort_order: sortOrder,
                      })
                    }
                    className="w-full md:w-auto"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs value={viewTab} className="w-full">
                <TabsContent value="table" className="mt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={warehouses.data.length > 0 && selectedWarehouses.length === warehouses.data.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                          Nome
                          {sortField === 'name' && (
                            <span className="ml-1">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Gestor</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="w-[100px]">Acções</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {warehouses.data.length > 0 ? (
                        warehouses.data.map((warehouse) => (
                          <TableRow key={warehouse.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedWarehouses.includes(warehouse.id)}
                                onCheckedChange={() => handleSelect(warehouse.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{warehouse.name}</span>
                                {warehouse.is_main && (
                                  <Badge variant="primary" className="w-fit mt-1">
                                    Principal
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{warehouse.code || '-'}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {warehouse.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5" />
                                    <span className="text-sm">{warehouse.email}</span>
                                  </div>
                                )}
                                {warehouse.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3.5 w-3.5" />
                                    <span className="text-sm">{warehouse.phone}</span>
                                  </div>
                                )}
                                {!warehouse.email && !warehouse.phone && '-'}
                              </div>
                            </TableCell>
                            <TableCell>
                              {warehouse.city ? (
                                <div className="flex items-start gap-1">
                                  <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">
                                    {warehouse.city}
                                    {warehouse.province ? `, ${warehouse.province}` : ''}
                                  </span>
                                </div>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>
                              {warehouse.manager ? (
                                <div className="flex items-start gap-1">
                                  <User className="h-3.5 w-3.5 mt-0.5" />
                                  <div>
                                    <div className="text-sm font-medium">{warehouse.manager.name}</div>
                                    <div className="text-xs text-muted-foreground">{warehouse.manager.email}</div>
                                  </div>
                                </div>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={warehouse.active ? "success" : "secondary"}>
                                {warehouse.active ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                  {can('admin-warehouse.show') && (
                                    <Button variant="ghost" size="icon" asChild>
                                      <Link href={`/admin/warehouses/${warehouse.id}`} className="h-8 w-8">
                                        <Eye className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                  )}
                                  {can('admin-warehouse.edit') && (
                                    <Button variant="ghost" size="icon" asChild>
                                      <Link href={`/admin/warehouses/${warehouse.id}/edit`} className="h-8 w-8">
                                        <Edit className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                  )}
                                  {can('admin-warehouse.destroy') && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => handleDeleteClick(warehouse.id)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-6">
                            Nenhum armazém encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Paginação */}
                  {warehouses.last_page > 1 && (
                    <div className="flex items-center justify-between px-2 py-4">
                      <div className="text-muted-foreground text-sm">
                        A mostrar {warehouses.from} a {warehouses.to} de {warehouses.total} registos
                      </div>
                      <div className="flex gap-1">
                        {warehouses.current_page > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link
                              href={`/admin/warehouses?page=${warehouses.current_page - 1}&search=${searchQuery || ''}&active=${activeFilter || ''}&is_main=${isMainFilter || ''}&sort_field=${sortField}&sort_order=${sortOrder}`}
                            >
                              <ArrowLeft className="h-4 w-4 mr-1" />
                              Anterior
                            </Link>
                          </Button>
                        )}

                        {warehouses.current_page < warehouses.last_page && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link
                              href={`/admin/warehouses?page=${warehouses.current_page + 1}&search=${searchQuery || ''}&active=${activeFilter || ''}&is_main=${isMainFilter || ''}&sort_field=${sortField}&sort_order=${sortOrder}`}
                            >
                              Próximo
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="cards" className="mt-0">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {warehouses.data.length > 0 ? (
                      warehouses.data.map((warehouse) => renderWarehouseCard(warehouse))
                    ) : (
                      <div className="col-span-full py-6 text-center">Nenhum armazém encontrado</div>
                    )}
                  </div>

                  {/* Paginação */}
                  {warehouses.last_page > 1 && (
                    <div className="flex items-center justify-between px-2 py-4">
                      <div className="text-muted-foreground text-sm">
                        A mostrar {warehouses.from} a {warehouses.to} de {warehouses.total} registos
                      </div>
                      <div className="flex gap-1">
                        {warehouses.current_page > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link
                              href={`/admin/warehouses?page=${warehouses.current_page - 1}&search=${searchQuery || ''}&active=${activeFilter || ''}&is_main=${isMainFilter || ''}&sort_field=${sortField}&sort_order=${sortOrder}`}
                            >
                              <ArrowLeft className="h-4 w-4 mr-1" />
                              Anterior
                            </Link>
                          </Button>
                        )}

                        {warehouses.current_page < warehouses.last_page && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link
                              href={`/admin/warehouses?page=${warehouses.current_page + 1}&search=${searchQuery || ''}&active=${activeFilter || ''}&is_main=${isMainFilter || ''}&sort_field=${sortField}&sort_order=${sortOrder}`}
                            >
                              Próximo
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alerta de confirmação de exclusão */}
      {warehouseToDelete && (
        <DeleteAlert
          isOpen={deleteAlertOpen}
          onClose={() => {
            setDeleteAlertOpen(false);
            setWarehouseToDelete(null);
          }}
          title="Eliminar Armazém"
          description="Tem certeza que deseja eliminar este armazém? Esta acção não pode ser desfeita."
          deleteUrl={`/admin/warehouses/${warehouseToDelete}`}
        />
      )}

      {/* Alerta de confirmação para exclusão em massa */}
      <AlertDialog open={bulkDeleteAlertOpen} onOpenChange={setBulkDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Armazéns Selecionados</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar {selectedWarehouses.length} armazéns? Esta acção não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
