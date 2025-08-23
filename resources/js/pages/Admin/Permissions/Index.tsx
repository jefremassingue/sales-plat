import { Button } from '@/components/ui/button';
import { can } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, Edit, Trash, ShieldAlert, Loader2, LoaderIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DeleteAlert } from '@/components/delete-alert';
import { Permission } from './_components';

interface Props {
  permissions: {
    data: Permission[];
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
    title: 'Permissões',
    href: '/admin/permissions',
  },
];

export default function Index({ permissions, filters = {} }: Props) {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [sortField, setSortField] = useState(filters.sort_field || 'name');
  const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
  const [deletePermissionId, setDeletePermissionId] = useState<number | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [generating, setGenerating] = useState<boolean>(false);
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

  // Função para debounce da pesquisa
  const debouncedSearch = (value: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setSearchQuery(value);

    const timeout = setTimeout(() => {
      applyFilters({
        search: value,
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
    sort_field?: string;
    sort_order?: string;
  }) => {
    router.get(
      '/admin/permissions',
      {
        search: filterParams.search || null,
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
      sort_field: field,
      sort_order: newOrder,
    });
  };

  // Função para confirmar exclusão
  const confirmDelete = (permissionId: number) => {
    setDeletePermissionId(permissionId);
    setDeleteAlertOpen(true);
  };

  // Gerar / sincronizar permissões a partir do backend
  const generatePermissions = async () => {
    if (generating) return;
    setGenerating(true);

    try {
      await router.post('/admin/permissions/generate', {}, {
        preserveState: false,
      });
    } catch {
      // erros são tratados pelo Inertia/flash; apenas resetar o estado
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gerir Permissões" />

      <div className="container px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gerir Permissões</h1>
          <div className="flex gap-2">
            {can('admin-permission.create') && (
              <Button asChild>
                <Link href="/admin/permissions/create">
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Nova Permissão</span>
                </Link>
              </Button>
            )}
              <Button
                variant="outline"
                onClick={generatePermissions}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Atualizando...</span>
                  </>
                ) : (
                  <>
                  <LoaderIcon className="mr-2 h-4 w-4" />
                  <span>Actualizar Permissões</span>
                  </>
                )}
              </Button>
          </div>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Permissões</CardTitle>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <Input
                    placeholder="Pesquisar por nome"
                    value={searchQuery}
                    onChange={(e) => debouncedSearch(e.target.value)}
                    className="w-full sm:w-[250px]"
                  />
                  <Button type="button" onClick={() => applyFilters({
                    search: searchQuery,
                    sort_field: sortField,
                    sort_order: sortOrder,
                  })}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => toggleSort('name')}
                    >
                      Nome
                      {sortField === 'name' && (
                        <span className="ml-2">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </TableHead>
                    <TableHead>Guard</TableHead>
                    <TableHead className="w-[120px]">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.data.length > 0 ? (
                    permissions.data.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">{permission.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {permission.guard_name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {can('admin-permission.edit') && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/permissions/${permission.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            {can('admin-permission.destroy') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => confirmDelete(permission.id)}
                                className="text-destructive hover:text-destructive"
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
                      <TableCell colSpan={3} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <ShieldAlert className="h-12 w-12 mb-2" />
                          <h3 className="text-lg font-medium">Nenhuma permissão encontrada</h3>
                          <p className="mb-4">Comece criando uma nova permissão para o sistema.</p>
                          {can('admin-permission.create') && (
                            <Button asChild>
                              <Link href="/admin/permissions/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Criar nova permissão
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Paginação */}
              {permissions.last_page > 1 && (
                <div className="flex items-center justify-between px-2 py-4 mt-4">
                  <div className="text-muted-foreground text-sm">
                    Mostrando {permissions.from} a {permissions.to} de {permissions.total} registos
                  </div>
                  <div className="flex gap-1">
                    {/* Links de paginação */}
                    {permissions.links.map((link, index) => {
                      // Não renderizar os links "Anterior" e "Próximo"
                      if (index === 0 || index === permissions.links.length - 1) return null;

                      return (
                        <Button
                          key={index}
                          variant={link.active ? "default" : "outline"}
                          size="sm"
                          disabled={!link.url}
                          onClick={() => link.url && router.get(link.url)}
                        >
                          <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alerta de confirmação de exclusão */}
      {deletePermissionId && (
        <DeleteAlert
          isOpen={deleteAlertOpen}
          onClose={() => {
            setDeleteAlertOpen(false);
            setDeletePermissionId(null);
          }}
          title="Eliminar Permissão"
          description="Tem certeza que deseja eliminar esta permissão? Esta acção não pode ser desfeita e pode afetar funções que usam esta permissão."
          deleteUrl={`/admin/permissions/${deletePermissionId}`}
        />
      )}
    </AppLayout>
  );
}
