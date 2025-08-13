import { Button } from '@/components/ui/button';
import { can } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteAlert } from '@/components/delete-alert';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, DollarSign, Edit, Plus, Star, StarOff, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Currency } from './_components/types';

interface Props {
  currencies: Currency[];
  filters?: {
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
    title: 'Moedas',
    href: '/admin/currencies',
  },
];

export default function Index({ currencies, filters = {} }: Props) {
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [currencyToDelete, setCurrencyToDelete] = useState<number | null>(null);
  const [sortField, setSortField] = useState(filters.sort_field || 'code');
  const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
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
    setCurrencyToDelete(id);
    setDeleteAlertOpen(true);
  };

  const handleSetDefault = (currencyId: number) => {
    router.post(`/admin/currencies/${currencyId}/set-default`, {}, {
      onSuccess: () => {
        toast({
          title: 'Moeda padrão atualizada',
          description: 'A moeda padrão do sistema foi alterada com sucesso.',
          variant: 'success',
        });
      },
      onError: () => {
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao definir a moeda padrão.',
          variant: 'destructive',
        });
      }
    });
  };

  // Alternar ordem de classificação
  const toggleSort = (field: string) => {
    const newOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);

    router.get(
      '/admin/currencies',
      {
        sort_field: field,
        sort_order: newOrder,
      },
      {
        preserveState: true,
        replace: true,
      }
    );
  };

  // Função para formatar a taxa de câmbio
  const formatExchangeRate = (rate: number) => {
    return new Intl.NumberFormat('pt-PT', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }).format(rate);
  };

  // Função para criar um exemplo de formatação usando as configurações da moeda
  const formatExample = (currency: Currency) => {
    const value = 1234567.89;
    const formattedValue = new Intl.NumberFormat('pt-PT', {
      minimumFractionDigits: currency.decimal_places,
      maximumFractionDigits: currency.decimal_places,
    }).format(value).replace(/\./g, '#').replace(/,/g, '$')
      .replace(/#/g, currency.thousand_separator)
      .replace(/\$/g, currency.decimal_separator);

    return `${currency.symbol} ${formattedValue}`;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestão de Moedas" />

      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Gestão de Moedas
          </h1>
          {can('admin-currency.create') && (
            <Button asChild>
              <Link href="/admin/currencies/create">
                <Plus className="mr-2 h-4 w-4" />
                Nova Moeda
              </Link>
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Moedas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Padrão</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('code')}>
                      Código {sortField === 'code' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                      Nome {sortField === 'name' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </TableHead>
                    <TableHead>Símbolo</TableHead>
                    <TableHead className="cursor-pointer text-right" onClick={() => toggleSort('exchange_rate')}>
                      Taxa de Câmbio {sortField === 'exchange_rate' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </TableHead>
                    <TableHead>Exemplo</TableHead>
                    <TableHead className="cursor-pointer text-center" onClick={() => toggleSort('is_active')}>
                      Estado {sortField === 'is_active' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencies.length > 0 ? (
                    currencies.map((currency) => (
                      <TableRow key={currency.id}>
                        <TableCell className="text-center">
                          {currency.is_default ? (
                            <span className="text-yellow-500">
                              <Star className="h-5 w-5 fill-yellow-500" />
                            </span>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSetDefault(currency.id)}
                              title="Definir como moeda padrão"
                            >
                              <StarOff className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{currency.code}</TableCell>
                        <TableCell>
                          <Link
                            href={`/admin/currencies/${currency.id}`}
                            className="hover:underline"
                          >
                            {currency.name}
                          </Link>
                        </TableCell>
                        <TableCell>{currency.symbol}</TableCell>
                        <TableCell className="text-right">{formatExchangeRate(currency.exchange_rate)}</TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-1 py-0.5 rounded">
                            {formatExample(currency)}
                          </code>
                        </TableCell>
                        <TableCell className="text-center">
                          {currency.is_active ? (
                            <Badge variant="success">Ativo</Badge>
                          ) : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            {can('admin-currency.show') && (
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/admin/currencies/${currency.id}`}>
                                  <Check className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            {can('admin-currency.edit') && (
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/admin/currencies/${currency.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            {can('admin-currency.destroy') && !currency.is_default && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(currency.id)}
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
                      <TableCell colSpan={8} className="h-24 text-center">
                        Nenhuma moeda encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de confirmação de exclusão */}
      {currencyToDelete && (
        <DeleteAlert
          isOpen={deleteAlertOpen}
          onClose={() => {
            setDeleteAlertOpen(false);
            setCurrencyToDelete(null);
          }}
          title="Eliminar Moeda"
          description="Tem certeza que deseja eliminar esta moeda? Esta ação não pode ser desfeita."
          deleteUrl={`/admin/currencies/${currencyToDelete}`}
        />
      )}
    </AppLayout>
  );
}
