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
import { Calendar, Eye, FileText, Filter, MoreHorizontal, MoreVertical, Pencil, Plus, Printer, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Customer, Quotation, QuotationStatus } from './_components/types';
import { format } from 'date-fns';

interface Props {
  quotations: {
    data: Quotation[];
    links: any[];
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  customers: Customer[];
  statuses: QuotationStatus[];
  filters?: {
    search?: string | null;
    customer_id?: string | null;
    status?: string | null;
    date_from?: string | null;
    date_to?: string | null;
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
    title: 'Cotações',
    href: '/admin/quotations',
  },
];

export default function Index({ quotations, customers, statuses, filters = {} }: Props) {
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<number | null>(null);
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
    setQuotationToDelete(id);
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

      return `${currency.symbol} ${formattedValue}`;
    } catch (error) {
      // Fallback para formatação padrão
      return `${currency.symbol} ${amount.toFixed(2)}`;
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
      '/admin/quotations',
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestão de Cotações" />

      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gestão de Cotações</h1>
          <Button asChild>
            <Link href="/admin/quotations/create">
              <Plus className="mr-2 h-4 w-4" />
              <span>Nova Cotação</span>
            </Link>
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                <Input
                  placeholder="Pesquisar por número ou notas da cotação"
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
            <CardTitle>Lista de Cotações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('quotation_number')}>
                      Número {sortField === 'quotation_number' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('issue_date')}>
                      Data de Emissão {sortField === 'issue_date' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('expiry_date')}>
                      Data de Validade {sortField === 'expiry_date' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </TableHead>
                    <TableHead className="cursor-pointer text-right" onClick={() => toggleSort('total')}>
                      Total {sortField === 'total' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('status')}>
                      Estado {sortField === 'status' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotations.data.length > 0 ? (
                    quotations.data.map((quotation) => (
                      <TableRow key={quotation.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/admin/quotations/${quotation.id}`}
                            className="hover:underline"
                          >
                            {quotation.quotation_number}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {quotation.customer ? (
                            <div>
                              <div>{quotation.customer.name}</div>
                              <div className="text-muted-foreground text-xs">{quotation.customer.email}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Sem cliente</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            {formatDate(quotation.issue_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {quotation.expiry_date ? (
                              <>
                                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                {formatDate(quotation.expiry_date)}
                              </>
                            ) : (
                              <span className="text-muted-foreground">Sem data de validade</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(quotation.total)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(quotation.status)}>
                            {statuses.find(s => s.value === quotation.status)?.label || quotation.status}
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
                                <Link href={`/admin/quotations/${quotation.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>Ver Detalhes</span>
                                </Link>
                              </DropdownMenuItem>
                              {quotation.status === 'draft' && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/quotations/${quotation.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Editar</span>
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/quotations/${quotation.id}/pdf`} target="_blank">
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>Ver PDF</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteClick(quotation.id)}>
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Eliminar</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Nenhuma cotação encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            {quotations.last_page > 1 && (
              <div className="flex items-center justify-end space-x-2 mt-4">
                {quotations.current_page > 1 && (
                  <Button variant="outline" size="sm" onClick={() => router.get(`/admin/quotations?page=${quotations.current_page - 1}`)}>
                    Anterior
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  Página {quotations.current_page} de {quotations.last_page}
                </span>
                {quotations.current_page < quotations.last_page && (
                  <Button variant="outline" size="sm" onClick={() => router.get(`/admin/quotations?page=${quotations.current_page + 1}`)}>
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
        title="Eliminar Cotação"
        description="Tem certeza que deseja eliminar esta cotação? Esta acção não pode ser desfeita."
        deleteUrl={`/admin/quotations/${quotationToDelete}`}
      />
    </AppLayout>
  );
}
