import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DeleteAlert } from '@/components/delete-alert';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { DatePicker } from '@/components/ui/date-picker';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Calendar, Eye, FileText, Filter, MoreHorizontal, Pencil, Plus, Printer, Trash, Send, Copy, Download, Banknote } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Sale {
  id: number;
  sale_number: string;
  customer_id: number | null;
  user_id: number | null;
  issue_date: string;
  due_date: string | null;
  status: 'draft' | 'pending' | 'paid' | 'partial' | 'canceled' | 'overdue';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  shipping_amount: number;
  total: number;
  amount_paid: number;
  amount_due: number;
  customer?: Customer;
  user?: User;
}

interface SaleStatus {
  value: string;
  label: string;
  color: string;
}

interface Props {
  sales: {
    data: Sale[];
    links: any[];
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  currency: {
    symbol: string;
    decimal_places: number;
    decimal_separator: string;
    thousand_separator: string;
  };
  customers: Customer[];
  statuses: SaleStatus[];
  filters?: {
    search?: string | null;
    customer_id?: string | null;
    status?: string | null;
    date_from?: string | null;
    date_to?: string | null;
    sort_field?: string;
    sort_order?: string;
  };
  stats?: {
    total: number;
    draft: number;
    pending: number;
    paid: number;
    partial: number;
    overdue: number;
    canceled: number;
    total_value: number;
    paid_value: number;
    due_value: number;
    overdue_value: number;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Vendas',
    href: '/admin/sales',
  },
];

export default function Index({ sales, customers, statuses, currency, filters = {}, stats }: Props) {
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [customerFilter, setCustomerFilter] = useState(filters.customer_id || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');
  const [dateFromFilter, setDateFromFilter] = useState<Date | undefined>(
    filters.date_from ? new Date(filters.date_from) : undefined
  );
  const [dateToFilter, setDateToFilter] = useState<Date | undefined>(
    filters.date_to ? new Date(filters.date_to) : undefined
  );
  const [sortField, setSortField] = useState(filters.sort_field || 'issue_date');
  const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);

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

  const handleDeleteClick = (id: number) => {
    setSaleToDelete(id);
    setDeleteAlertOpen(true);
  };

  // Função para formatar data
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    return format(new Date(dateStr), 'dd/MM/yyyy');
  };

  // Função para formatar valores monetários
  const formatCurrency = (amount: number, currency: { symbol: string; decimal_places: number; decimal_separator: string; thousand_separator: string }) => {
    try {
      const formattedValue = new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: currency.decimal_places,
        maximumFractionDigits: currency.decimal_places
      }).format(amount)
        .replace(/\./g, '#')
        .replace(/,/g, '$')
        .replace(/#/g, currency.thousand_separator)
        .replace(/\$/g, currency.decimal_separator);

      return `${currency?.symbol} ${formattedValue}`;
    } catch (error) {
      // Fallback para formatação padrão
      return `${currency?.symbol} ${amount.toFixed(2)}`;
    }
  };

  // Função de debounce para pesquisa
  const debouncedSearch = (value: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setSearchQuery(value);

    const timeout = setTimeout(() => {
      applyFilters({
        search: value,
        customer_id: customerFilter,
        status: statusFilter,
        date_from: dateFromFilter ? format(dateFromFilter, 'yyyy-MM-dd') : null,
        date_to: dateToFilter ? format(dateToFilter, 'yyyy-MM-dd') : null,
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
    customer_id?: string | null;
    status?: string | null;
    date_from?: string | null;
    date_to?: string | null;
    sort_field?: string;
    sort_order?: string;
  }) => {
    router.get(
      '/admin/sales',
      {
        search: filterParams.search || null,
        customer_id: filterParams.customer_id || null,
        status: filterParams.status || null,
        date_from: filterParams.date_from || null,
        date_to: filterParams.date_to || null,
        sort_field: filterParams.sort_field || 'issue_date',
        sort_order: filterParams.sort_order || 'desc',
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
      customer_id: customerFilter,
      status: statusFilter,
      date_from: dateFromFilter ? format(dateFromFilter, 'yyyy-MM-dd') : null,
      date_to: dateToFilter ? format(dateToFilter, 'yyyy-MM-dd') : null,
      sort_field: field,
      sort_order: newOrder,
    });
  };

  // Obter a variante de badge com base no status
  const getStatusBadgeVariant = (status: string) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj?.color || 'secondary';
  };

  // Atualiza o status da venda
  const handleStatusChange = (saleId: number, newStatus: string) => {
    setStatusUpdating(true);

    router.post(`/admin/sales/${saleId}/status`, {
      status: newStatus
    }, {
      preserveState: true,
      onSuccess: () => {
        toast({
          title: 'Status atualizado',
          description: 'O status da venda foi atualizado com sucesso.',
          variant: 'success',
        });
        setStatusUpdating(false);
      },
      onError: () => {
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao atualizar o status da venda.',
          variant: 'destructive',
        });
        setStatusUpdating(false);
      }
    });
  };

  // Enviar venda por email
  const handleSendEmail = (saleId: number, hasEmail: boolean) => {
    if (!hasEmail) {
      toast({
        title: 'Erro',
        description: 'O cliente não possui um endereço de email válido.',
        variant: 'destructive',
      });
      return;
    }

    router.post(`/admin/sales/${saleId}/send-email`, {}, {
      preserveState: true,
      onSuccess: () => {
        toast({
          title: 'Email enviado',
          description: 'A venda foi enviada por email com sucesso.',
          variant: 'success',
        });
      },
      onError: () => {
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao enviar o email.',
          variant: 'destructive',
        });
      }
    });
  };

  // Duplicar venda
  const handleDuplicate = (saleId: number) => {
    router.post(`/admin/sales/${saleId}/duplicate`, {}, {
      preserveState: false,
      onError: () => {
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao duplicar a venda.',
          variant: 'destructive',
        });
      }
    });
  };

  // Registrar pagamento rápido
  const handleQuickPayment = (saleId: number, amountDue: number) => {
    if (amountDue <= 0) {
      toast({
        title: 'Informação',
        description: 'Esta venda já está paga completamente.',
        variant: 'default',
      });
      return;
    }

    router.get(`/admin/sales/${saleId}`, {}, {
      onSuccess: () => {
        // Redireciona para a página da venda onde o usuário pode registrar o pagamento
        toast({
          title: 'Registrar Pagamento',
          description: 'Use o botão "Registrar Pagamento" na página de detalhes da venda.',
          variant: 'default',
        });
      }
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestão de Vendas" />

      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gestão de Vendas</h1>
          <Button asChild>
            <Link href="/admin/sales/create">
              <Plus className="mr-2 h-4 w-4" />
              <span>Nova Venda</span>
            </Link>
          </Button>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || sales.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Valor total: {formatCurrency(stats?.total_value || 0, currency)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valor Recebido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(stats?.paid_value || 0, currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Vendas pagas: {stats?.paid || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valor a Receber</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {formatCurrency(stats?.due_value || 0, currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Vendas pendentes: {(stats?.pending || 0) + (stats?.partial || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valor Vencido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(stats?.overdue_value || 0, currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Vendas vencidas: {stats?.overdue || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                <Input
                  placeholder="Pesquisar por número ou notas da venda"
                  value={searchQuery}
                  onChange={(e) => debouncedSearch(e.target.value)}
                />
              </div>

              <div>
                <Select
                  value={customerFilter}
                  onValueChange={(value) => {
                    setCustomerFilter(value);
                    applyFilters({
                      search: searchQuery,
                      customer_id: value,
                      status: statusFilter,
                      date_from: dateFromFilter ? format(dateFromFilter, 'yyyy-MM-dd') : null,
                      date_to: dateToFilter ? format(dateToFilter, 'yyyy-MM-dd') : null,
                      sort_field: sortField,
                      sort_order: sortOrder,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="">Todos os clientes</SelectItem> */}
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    applyFilters({
                      search: searchQuery,
                      customer_id: customerFilter,
                      status: value,
                      date_from: dateFromFilter ? format(dateFromFilter, 'yyyy-MM-dd') : null,
                      date_to: dateToFilter ? format(dateToFilter, 'yyyy-MM-dd') : null,
                      sort_field: sortField,
                      sort_order: sortOrder,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="">Todos os estados</SelectItem> */}
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-1 sm:col-span-2 lg:col-span-5 flex flex-wrap gap-4">
                <div className="w-full sm:w-auto flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Data de Início</label>
                  <DatePicker
                    value={dateFromFilter}
                    onChange={setDateFromFilter}
                    placeholder="Selecione a data inicial"
                  />
                </div>

                <div className="w-full sm:w-auto flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Data de Fim</label>
                  <DatePicker
                    value={dateToFilter}
                    onChange={setDateToFilter}
                    placeholder="Selecione a data final"
                  />
                </div>

                <div className="w-full sm:w-auto flex sm:items-end">
                  <Button
                    onClick={() => {
                      applyFilters({
                        search: searchQuery,
                        customer_id: customerFilter,
                        status: statusFilter,
                        date_from: dateFromFilter ? format(dateFromFilter, 'yyyy-MM-dd') : null,
                        date_to: dateToFilter ? format(dateToFilter, 'yyyy-MM-dd') : null,
                        sort_field: sortField,
                        sort_order: sortOrder,
                      });
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('sale_number')}>
                      Número {sortField === 'sale_number' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('issue_date')}>
                      Data de Emissão {sortField === 'issue_date' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('due_date')}>
                      Vencimento {sortField === 'due_date' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </TableHead>
                    <TableHead className="cursor-pointer text-right" onClick={() => toggleSort('total')}>
                      Total {sortField === 'total' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </TableHead>
                    <TableHead className="text-right" onClick={() => toggleSort('amount_due')}>
                      Em Dívida {sortField === 'amount_due' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('status')}>
                      Estado {sortField === 'status' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.data.length > 0 ? (
                    sales.data.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/admin/sales/${sale.id}`}
                            className="hover:underline"
                          >
                            {sale.sale_number}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {sale.customer ? (
                            <div>
                              <div>{sale.customer.name}</div>
                              <div className="text-muted-foreground text-xs">{sale.customer.email}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Sem cliente</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            {formatDate(sale.issue_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {sale.due_date ? (
                              <>
                                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                {formatDate(sale.due_date)}
                                {isOverdue(sale) && (
                                  <span className="ml-2 text-xs bg-red-100 text-red-800 rounded-full px-2 py-0.5">
                                    Vencida
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-muted-foreground">Sem data de vencimento</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(sale.total, currency)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={`${sale.amount_due > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                            {formatCurrency(sale.amount_due, currency)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(sale.status)}
                            className="cursor-pointer"
                            onClick={() => {
                              document.getElementById(`status-trigger-${sale.id}`)?.click();
                            }}
                          >
                            {statuses.find(s => s.value === sale.status)?.label || sale.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/sales/${sale.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>Ver Detalhes</span>
                                </Link>
                              </DropdownMenuItem>
                              {["draft", "pending"].includes(sale.status) && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/sales/${sale.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Editar</span>
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem asChild>
                                <a href={`/admin/sales/${sale.id}/pdf`} target="_blank">
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>Ver PDF</span>
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a href={`/admin/sales/${sale.id}/pdf?download=true`} target="_blank">
                                  <Download className="mr-2 h-4 w-4" />
                                  <span>Descarregar PDF</span>
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleSendEmail(
                                  sale.id,
                                  Boolean(sale.customer?.email)
                                )}
                                disabled={!sale.customer?.email}
                              >
                                <Send className="mr-2 h-4 w-4" />
                                <span>Enviar por Email</span>
                                {!sale.customer?.email && (
                                  <span className="ml-1 text-xs text-destructive">(Sem email)</span>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(sale.id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                <span>Duplicar Venda</span>
                              </DropdownMenuItem>
                              {sale.amount_due > 0 && !['draft', 'canceled'].includes(sale.status) && (
                                <DropdownMenuItem onClick={() => handleQuickPayment(sale.id, sale.amount_due)}>
                                  <Banknote className="mr-2 h-4 w-4" />
                                  <span>Registrar Pagamento</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteClick(sale.id)}>
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Eliminar</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                id={`status-trigger-${sale.id}`}
                                variant="ghost"
                                size="sm"
                                className="hidden"
                              >
                                <span className="sr-only">Alterar status</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem disabled className="font-semibold">
                                Alterar estado
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {statuses.map((status) => (
                                <DropdownMenuItem
                                  key={status.value}
                                  disabled={status.value === sale.status || statusUpdating}
                                  onClick={() => handleStatusChange(sale.id, status.value)}
                                >
                                  <Badge variant={status.color} className="mr-2">
                                    {status.label}
                                  </Badge>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        Nenhuma venda encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            {sales.last_page > 1 && (
              <div className="flex items-center justify-end space-x-2 mt-4">
                {sales.current_page > 1 && (
                  <Button variant="outline" size="sm" onClick={() => router.get(`/admin/sales?page=${sales.current_page - 1}`)}>
                    Anterior
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  Página {sales.current_page} de {sales.last_page}
                </span>
                {sales.current_page < sales.last_page && (
                  <Button variant="outline" size="sm" onClick={() => router.get(`/admin/sales?page=${sales.current_page + 1}`)}>
                    Próximo
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerta de confirmação de exclusão */}
      <DeleteAlert
        isOpen={deleteAlertOpen}
        onClose={() => setDeleteAlertOpen(false)}
        title="Eliminar Venda"
        description="Tem certeza que deseja eliminar esta venda? Esta acção não pode ser desfeita."
        deleteUrl={`/admin/sales/${saleToDelete}`}
      />
    </AppLayout>
  );
}

// Função auxiliar para verificar se a venda está vencida
function isOverdue(sale: Sale) {
  if (sale.status === 'overdue') return true;
  if (!sale.due_date) return false;

  const dueDate = new Date(sale.due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dueDate < today && sale.amount_due > 0;
}
