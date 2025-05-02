import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, Edit, Trash, Users, Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DeleteAlert } from '@/components/delete-alert';
import { User, Role } from './_components';

interface Props {
  users: {
    data: User[];
    links: any[];
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  roles: Role[];
  filters?: {
    search?: string | null;
    role?: string | null;
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
    title: 'Utilizadores',
    href: '/admin/users',
  },
];

export default function Index({ users, roles, filters = {} }: Props) {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [roleFilter, setRoleFilter] = useState(filters.role || '');
  const [sortField, setSortField] = useState(filters.sort_field || 'name');
  const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
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
        role: roleFilter,
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
    role?: string | null;
    sort_field?: string;
    sort_order?: string;
  }) => {
    router.get(
      '/admin/users',
      {
        search: filterParams.search || null,
        role: filterParams.role || null,
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
      role: roleFilter,
      sort_field: field,
      sort_order: newOrder,
    });
  };

  // Função para filtrar por função
  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    applyFilters({
      search: searchQuery,
      role: value,
      sort_field: sortField,
      sort_order: sortOrder,
    });
  };

  // Função para confirmar exclusão
  const confirmDelete = (userId: number) => {
    setDeleteUserId(userId);
    setDeleteAlertOpen(true);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gerir Utilizadores" />

      <div className="container px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gerir Utilizadores</h1>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/admin/users/create">
                <Plus className="mr-2 h-4 w-4" />
                <span>Novo Utilizador</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Utilizadores</CardTitle>
                <div className="flex w-full flex-col sm:flex-row sm:w-auto sm:items-center sm:gap-2">
                  <div className="flex w-full items-center gap-2">
                    <Input
                      placeholder="Pesquisar por nome ou email"
                      value={searchQuery}
                      onChange={(e) => debouncedSearch(e.target.value)}
                      className="w-full"
                    />
                    <Select
                      value={roleFilter}
                      onValueChange={handleRoleFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por função" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* <SelectItem value="">Todas as funções</SelectItem> */}
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={() => applyFilters({
                      search: searchQuery,
                      role: roleFilter,
                      sort_field: sortField,
                      sort_order: sortOrder,
                    })}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
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
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => toggleSort('email')}
                    >
                      Email
                      {sortField === 'email' && (
                        <span className="ml-2">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </TableHead>
                    <TableHead>Funções</TableHead>
                    <TableHead className="w-[120px]">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.data.length > 0 ? (
                    users.data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map(role => (
                                <Badge key={role.id} variant="outline">
                                  {role.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                Nenhuma função atribuída
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/users/${user.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => confirmDelete(user.id)}
                              className="text-destructive hover:text-destructive"
                              disabled={user.id === (usePage().props.auth?.user as any)?.id}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Users className="h-12 w-12 mb-2" />
                          <h3 className="text-lg font-medium">Nenhum utilizador encontrado</h3>
                          <p className="mb-4">Comece criando um novo utilizador para o sistema.</p>
                          <Button asChild>
                            <Link href="/admin/users/create">
                              <Plus className="mr-2 h-4 w-4" />
                              Criar novo utilizador
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Paginação */}
              {users.last_page > 1 && (
                <div className="flex items-center justify-between px-2 py-4 mt-4">
                  <div className="text-muted-foreground text-sm">
                    Mostrando {users.from} a {users.to} de {users.total} registos
                  </div>
                  <div className="flex gap-1">
                    {/* Links de paginação */}
                    {users.links.map((link, index) => {
                      // Não renderizar os links "Anterior" e "Próximo"
                      if (index === 0 || index === users.links.length - 1) return null;

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
      {deleteUserId && (
        <DeleteAlert
          isOpen={deleteAlertOpen}
          onClose={() => {
            setDeleteAlertOpen(false);
            setDeleteUserId(null);
          }}
          title="Eliminar Utilizador"
          description="Tem certeza que deseja eliminar este utilizador? Esta acção não pode ser desfeita."
          deleteUrl={`/admin/users/${deleteUserId}`}
        />
      )}
    </AppLayout>
  );
}
