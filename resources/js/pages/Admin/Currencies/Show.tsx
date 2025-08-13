import { Button } from '@/components/ui/button';
import { can } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DeleteAlert } from '@/components/delete-alert';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, DollarSign, Edit, Settings, Star, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { Currency } from './_components/types';

interface Props {
  currency: Currency;
}

export default function Show({ currency }: Props) {
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

  // Breadcrumbs dinâmicos
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Moedas',
      href: '/admin/currencies',
    },
    {
      title: currency.name,
      href: `/admin/currencies/${currency.id}`,
    },
  ];

  const handleDeleteClick = () => {
    if (currency.is_default) {
      toast({
        title: "Operação não permitida",
        description: "Não é possível excluir a moeda padrão do sistema.",
        variant: "destructive",
      });
      return;
    }
    setDeleteAlertOpen(true);
  };

  const handleSetDefault = () => {
    if (currency.is_default) return;

    router.post(`/admin/currencies/${currency.id}/set-default`, {}, {
      onSuccess: () => {
        toast({
          title: "Moeda padrão atualizada",
          description: "Esta moeda foi definida como padrão do sistema.",
          variant: "success",
        });
      },
      onError: () => {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao definir esta moeda como padrão.",
          variant: "destructive",
        });
      }
    });
  };

  // Função para formatar a data
  const formatDate = (dateTimeString: string) => {
    return format(new Date(dateTimeString), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: pt });
  };

  // Função para formatar a taxa de câmbio
  const formatExchangeRate = (rate: number) => {
    return new Intl.NumberFormat('pt-PT', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }).format(rate);
  };

  // Função para criar um exemplo de formatação usando as configurações da moeda
  const formatExample = (value: number) => {
    const formattedValue = new Intl.NumberFormat('pt-PT', {
      minimumFractionDigits: currency.decimal_places,
      maximumFractionDigits: currency.decimal_places,
    }).format(value)
      .replace(/\./g, '#')
      .replace(/,/g, '$')
      .replace(/#/g, currency.thousand_separator)
      .replace(/\$/g, currency.decimal_separator);

    return `${currency.symbol} ${formattedValue}`;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Moeda - ${currency.name}`} />

      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/currencies">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {currency.name}
                {currency.is_default && (
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                )}
              </h1>
              <p className="text-muted-foreground text-sm">Código: {currency.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {can('admin-currency.index') && !currency.is_default && (
              <Button onClick={handleSetDefault} variant="outline">
                <Star className="mr-2 h-4 w-4" />
                Definir como Padrão
              </Button>
            )}
            {can('admin-currency.edit') && (
              <Button variant="outline" asChild>
                <Link href={`/admin/currencies/${currency.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
            )}
            {can('admin-currency.destroy') && !currency.is_default && (
              <Button variant="destructive" onClick={handleDeleteClick}>
                <Trash className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Informações Básicas */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Detalhes da Moeda</CardTitle>
              <CardDescription>Informações básicas e configurações de formatação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Nome</h3>
                  <p className="text-base mt-1">{currency.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Código</h3>
                  <p className="text-base mt-1">{currency.code}</p>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Símbolo</h3>
                  <p className="text-base mt-1">{currency.symbol}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Taxa de Câmbio</h3>
                  <p className="text-base mt-1">{formatExchangeRate(currency.exchange_rate)}</p>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Estado</h3>
                  <div className="mt-2">
                    {currency.is_active ? (
                      <Badge variant="success">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Moeda Padrão</h3>
                  <div className="mt-2">
                    {currency.is_default ? (
                      <Badge variant="primary" className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Padrão do Sistema
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Não é a moeda padrão</span>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Configurações de Formatação</h3>
                <div className="grid md:grid-cols-3 gap-6 mt-3">
                  <div>
                    <span className="text-sm">Separador Decimal:</span>
                    <code className="ml-2 text-sm bg-muted px-1 py-0.5 rounded">
                      {currency.decimal_separator}
                    </code>
                  </div>
                  <div>
                    <span className="text-sm">Separador de Milhar:</span>
                    <code className="ml-2 text-sm bg-muted px-1 py-0.5 rounded">
                      {currency.thousand_separator}
                    </code>
                  </div>
                  <div>
                    <span className="text-sm">Casas Decimais:</span>
                    <code className="ml-2 text-sm bg-muted px-1 py-0.5 rounded">
                      {currency.decimal_places}
                    </code>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-md bg-muted">
                <h3 className="text-sm font-medium mb-2">Exemplos de Formatação:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm">Valor Pequeno (12.34):</span>
                    <div className="text-lg font-bold mt-1">{formatExample(12.34)}</div>
                  </div>
                  <div>
                    <span className="text-sm">Valor Grande (1234567.89):</span>
                    <div className="text-lg font-bold mt-1">{formatExample(1234567.89)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadados e Informações Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle>Metadados</CardTitle>
              <CardDescription>Informações de sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Criado em
                </div>
                <div className="mt-1">{formatDate(currency.created_at)}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Última atualização
                </div>
                <div className="mt-1">{formatDate(currency.updated_at)}</div>
              </div>

              <Separator />

                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-2">Ações</h3>
                  <div className="space-y-2">
                    {can('admin-currency.edit') && (
                      <Button asChild variant="outline" className="w-full justify-start">
                        <Link href={`/admin/currencies/${currency.id}/edit`}>
                          <Settings className="mr-2 h-4 w-4" />
                          Editar Configurações
                        </Link>
                      </Button>
                    )}

                    {can('admin-currency.index') && !currency.is_default && (
                      <Button
                        onClick={handleSetDefault}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Definir como Padrão
                      </Button>
                    )}

                    {can('admin-currency.destroy') && !currency.is_default && (
                      <Button
                        variant="outline"
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={handleDeleteClick}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Eliminar Moeda
                      </Button>
                    )}
                  </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alerta de confirmação de exclusão */}
      <DeleteAlert
        isOpen={deleteAlertOpen}
        onClose={() => setDeleteAlertOpen(false)}
        title="Eliminar Moeda"
        description="Tem certeza que deseja eliminar esta moeda? Esta ação não pode ser desfeita."
        deleteUrl={`/admin/currencies/${currency.id}`}
      />
    </AppLayout>
  );
}
