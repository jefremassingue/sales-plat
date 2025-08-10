import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteAlert } from '@/components/delete-alert';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Calendar, Copy, CreditCard, Download, Edit, Printer, Mail, Package, Send, Star, Trash, User, ArrowRightIcon } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { Quotation, QuotationStatus } from './_components/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusChangeDialog from './_components/StatusChangeDialog';

interface Props {
  quotation: Quotation;
  statuses: QuotationStatus[];
}

export default function Show({ quotation, statuses }: Props) {
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(quotation.status);
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

  // Breadcrumbs dinâmicos
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Cotações',
      href: '/admin/quotations',
    },
    {
      title: quotation.quotation_number,
      href: `/admin/quotations/${quotation.id}`,
    },
  ];

  // Função para formatar data
  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return 'N/A';
    return format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: pt });
  };

  // Função para formatar valor monetário
  const formatCurrency = (value: number | null | undefined, withSymbol = true) => {
    if (value === null || value === undefined) return 'N/A';

    if (!quotation.currency) {
      return new Intl.NumberFormat('pt-PT', {
        style: withSymbol ? 'currency' : 'decimal',
        currency: 'MZN'
      }).format(value);
    }

    const { decimal_separator, thousand_separator, decimal_places, symbol } = quotation.currency;

    const formattedValue = value.toFixed(decimal_places)
      .replace('.', 'DECIMAL')
      .replace(/\B(?=(\d{3})+(?!\d))/g, thousand_separator)
      .replace('DECIMAL', decimal_separator);

    return withSymbol ? `${symbol} ${formattedValue}` : formattedValue;
  };

  // Obter a variante de badge com base no status
  const getStatusBadgeVariant = (status: string) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj?.color || 'secondary';
  };

  // Verificar se a cotação está vencida
  const isExpired = () => {
    if (quotation.status === 'expired') return true;
    if (!quotation.expiry_date) return false;
    return new Date(quotation.expiry_date) < new Date();
  };

  // Verificar se a cotação é editável
  const isEditable = () => {
    return quotation.status === 'draft';
  };

  // Função para alterar o status da cotação
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setStatusDialogOpen(true);
  };

  // Função para verificar disponibilidade de stock
  const hasStockWarning = (item: any) => {
    if (!item.warehouse_id) return false;
    if (item.available_quantity === undefined || item.available_quantity === null) return false;
    return item.available_quantity < item.quantity;
  };

  // Função para converter cotação em venda
  const handleConvertToSale = () => {
    router.post(`/admin/quotations/${quotation.id}/convert-to-sale`, {}, {
      onBefore: () => confirm('Tem certeza que deseja converter esta cotação em venda?'),
      onSuccess: () => {
        toast({
          title: 'Cotação convertida',
          description: 'A cotação foi convertida em venda com sucesso!',
          variant: 'success',
        });
        // router.visit('/admin/sales'); // Redirecionar para a lista de vendas após a conversão
      },
      onError: (errors) => {
        toast({
          title: 'Erro',
          description: errors.message || 'Ocorreu um erro ao converter a cotação em venda',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Cotação ${quotation.quotation_number}`} />

      <div className="container px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/quotations">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Cotação {quotation.quotation_number}
              </h1>
              <p className="text-muted-foreground">
                {quotation.status === 'draft' && 'Rascunho - '}
                {isExpired() && 'Expirada - '}
                Emitida em {formatDate(quotation.issue_date)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={quotation.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue>
                  <div className="flex items-center">
                    <Badge variant={getStatusBadgeVariant(quotation.status)} className="mr-2">
                      {statuses.find(s => s.value === quotation.status)?.label || quotation.status}
                    </Badge>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value} disabled={quotation.status === status.value}>
                    <Badge variant={status.color} className="mr-2">
                      {status.label}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" asChild>
              <a href={`/admin/quotations/${quotation.id}/pdf`} target="_blank">
                <Printer className="mr-2 h-4 w-4" />
                PDF
              </a>
            </Button>

            {isEditable() && (
              <Button variant="outline" asChild>
                <Link href={`/admin/quotations/${quotation.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
            )}

            <Button onClick={() => setDeleteAlertOpen(true)} variant="destructive">
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Coluna da esquerda - Informações principais */}
          <div className="md:col-span-2 space-y-6">
            {/* Cabeçalho com dados do cliente e informações gerais */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Cotação</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium">Cliente</h3>
                  {quotation.customer ? (
                    <div className="mt-1 space-y-1">
                      <p className="font-medium">{quotation.customer.name}</p>
                      <p className="text-sm text-muted-foreground">{quotation.customer.email}</p>
                      {quotation.customer.phone && (
                        <p className="text-sm text-muted-foreground">{quotation.customer.phone}</p>
                      )}
                      {quotation.customer.address && (
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {quotation.customer.address}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground mt-1">Sem cliente associado</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium">Informações da Cotação</h3>
                  <div className="mt-1 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Número:</span>
                      <span className="font-medium">{quotation.quotation_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Emitida em:</span>
                      <span>{formatDate(quotation.issue_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Validade:</span>
                      <span>{formatDate(quotation.expiry_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Moeda:</span>
                      <span>
                        {quotation.currency?.code} ({quotation.currency?.symbol})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa de Câmbio:</span>
                      <span>{quotation.exchange_rate}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de itens */}
            <Card>
              <CardHeader>
                <CardTitle>Itens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                        <TableHead className="text-right">Preço Unitário</TableHead>
                        <TableHead className="text-right">Desconto</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-right">Imposto</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotation.items && quotation.items.length > 0 ? (
                        quotation.items.map((item, index) => (
                          <TableRow key={item.id || index}>
                            <TableCell>
                              <div className="font-medium">{item.name}</div>
                              {item.description && (
                                <div className="text-sm text-muted-foreground">
                                  {item.description.length > 50
                                    ? `${item.description.substring(0, 50)}...`
                                    : item.description}
                                </div>
                              )}
                              {item.warehouse && (
                                <div className="flex items-center mt-1">
                                  <Package className="h-3 w-3 mr-1 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    Armazém: {item.warehouse.name}
                                  </span>
                                </div>
                              )}
                              {hasStockWarning(item) && (
                                <div className="flex items-center text-destructive mt-1">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  <span className="text-xs">
                                    Stock insuficiente (disponível: {item.available_quantity})
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.quantity} {item.unit || 'un'}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.unit_price)}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.discount_percentage > 0 && (
                                <div>
                                  <div>{item.discount_percentage}%</div>
                                  <div className="text-xs text-muted-foreground">
                                    ({formatCurrency(item.discount_amount)})
                                  </div>
                                </div>
                              )}
                              {!item.discount_percentage && '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.subtotal)}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.tax_percentage > 0 && (
                                <div>
                                  <div>{item.tax_percentage}%</div>
                                  <div className="text-xs text-muted-foreground">
                                    ({formatCurrency(item.tax_amount)})
                                  </div>
                                </div>
                              )}
                              {!item.tax_percentage && '-'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.total)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Nenhum item encontrado nesta cotação
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-end">
                <div className="space-y-2 w-full max-w-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatCurrency(quotation.subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Desconto:</span>
                    <span>{formatCurrency(quotation.discount_amount)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      IVA ({quotation.include_tax ? 'incluído' : 'excluído'}):
                    </span>
                    <span>{formatCurrency(quotation.tax_amount)}</span>
                  </div>

                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">{formatCurrency(quotation.total)}</span>
                  </div>
                </div>
              </CardFooter>
            </Card>

            {/* Notas e termos */}
            <Card>
              <CardHeader>
                <CardTitle>Notas e Termos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quotation.notes ? (
                  <div>
                    <h3 className="font-medium">Notas</h3>
                    <p className="mt-1 whitespace-pre-line">{quotation.notes}</p>
                  </div>
                ) : null}

                {quotation.terms ? (
                  <div>
                    <h3 className="font-medium">Termos e Condições</h3>
                    <p className="mt-1 whitespace-pre-line">{quotation.terms}</p>
                  </div>
                ) : null}

                {!quotation.notes && !quotation.terms && (
                  <p className="text-muted-foreground">Nenhuma nota ou termo adicional</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna da direita - Informações adicionais e ações */}
          <div className="space-y-6">
            {/* Status e informações */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status atual</h3>
                  <Badge variant={getStatusBadgeVariant(quotation.status)} className="mt-1">
                    {statuses.find(s => s.value === quotation.status)?.label || quotation.status}
                  </Badge>

                  {isExpired() && (
                    <div className="flex items-center mt-2 text-destructive">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Esta cotação está expirada</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Utilizador</h3>
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{quotation.user?.name || "Sistema"}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Datas</h3>
                  <div className="space-y-1 mt-1">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Emitida em {formatDate(quotation.issue_date)}</span>
                    </div>
                    {quotation.expiry_date && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Válida até {formatDate(quotation.expiry_date)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Moeda</h3>
                  <div className="flex items-center mt-1">
                    <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {quotation.currency?.code} ({quotation.currency?.name})
                    </span>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                    <span>Taxa de câmbio: {quotation.exchange_rate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" asChild>
                  <a href={`/admin/quotations/${quotation.id}/pdf?download=true`} target="_blank">
                    <Download className="mr-2 h-4 w-4" />
                    Descarregar PDF
                  </a>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={!quotation.customer || !quotation.customer.email}
                  onClick={() => router.post(`/admin/quotations/${quotation.id}/send-email`)}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar por Email
                  {(!quotation.customer || !quotation.customer.email) && (
                    <span className="ml-1 text-xs text-destructive">(Sem email)</span>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.post(`/admin/quotations/${quotation.id}/duplicate`)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicar Cotação
                </Button>

                {(quotation.status === 'approved' || quotation.status === 'draft') && (
                  <Button
                    variant="default"
                    className="w-full justify-start"
                    onClick={handleConvertToSale}
                  >
                    <ArrowRightIcon className="mr-2 h-4 w-4" />
                    Converter em Venda
                  </Button>
                )}

                {isEditable() && (
                  <>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href={`/admin/quotations/${quotation.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Cotação
                      </Link>
                    </Button>

                    <Button variant="destructive" onClick={() => setDeleteAlertOpen(true)} className="w-full justify-start">
                      <Trash className="mr-2 h-4 w-4" />
                      Eliminar Cotação
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Diálogo de alteração de status */}
      <StatusChangeDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        quotationId={quotation.id}
        currentStatus={quotation.status}
        newStatus={selectedStatus}
        statusLabel={statuses.find(s => s.value === selectedStatus)?.label || selectedStatus}
      />

      {/* Alerta de confirmação de exclusão */}
      <DeleteAlert
        isOpen={deleteAlertOpen}
        onClose={() => setDeleteAlertOpen(false)}
        title="Eliminar Cotação"
        description="Tem certeza que deseja eliminar esta cotação? Esta ação não pode ser desfeita."
        deleteUrl={`/admin/quotations/${quotation.id}`}
      />
    </AppLayout>
  );
}
