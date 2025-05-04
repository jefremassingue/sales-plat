import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { DeleteAlert } from '@/components/delete-alert';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Copy,
  CreditCard,
  Download,
  Edit,
  Printer,
  Send,
  Trash,
  User,
  ClipboardCopy,
  Plus,
  Banknote,
  FileBox
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

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
  currency_code: string;
  exchange_rate: number;
  notes: string | null;
  terms: string | null;
  include_tax: boolean;
  shipping_address: string | null;
  billing_address: string | null;
  payment_method: string | null;
  reference: string | null;
  quotation_id: number | null;
  customer?: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
  currency?: {
    code: string;
    name: string;
    symbol: string;
    decimal_places: number;
    decimal_separator: string;
    thousand_separator: string;
  };
  items: Array<{
    id: number;
    sale_id: number;
    product_id: number | null;
    product_variant_id: number | null;
    warehouse_id: number | null;
    name: string;
    description: string | null;
    quantity: number;
    unit: string | null;
    unit_price: number;
    discount_percentage: number;
    discount_amount: number;
    tax_percentage: number;
    tax_amount: number;
    subtotal: number;
    total: number;
    product?: any;
    productVariant?: any;
    warehouse?: any;
    available_quantity?: number;
  }>;
  payments?: Array<{
    id: number;
    sale_id: number;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference: string | null;
    notes: string | null;
  }>;
  quotation?: {
    id: number;
    quotation_number: string;
    issue_date: string;
  };
}

interface PaymentMethod {
  value: string;
  label: string;
}

interface Props {
  sale: Sale;
  statuses: { value: string; label: string; color: string }[];
  paymentMethods: PaymentMethod[];
}

// Schema para o formulário de pagamento
const paymentSchema = z.object({
  amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "O valor deve ser um número maior que zero"
  }),
  payment_date: z.date({
    required_error: "Data de pagamento é obrigatória",
  }),
  payment_method: z.string({
    required_error: "Método de pagamento é obrigatório",
  }),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function Show({ sale, statuses, paymentMethods }: Props) {
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(sale.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Formulário para pagamento
  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: sale.amount_due.toString(),
      payment_date: new Date(),
      payment_method: '',
      reference: '',
      notes: '',
    },
  });

  // Submeter pagamento
  const onSubmitPayment = (values: PaymentFormValues) => {
    setIsSubmitting(true);

    const data = {
      ...values,
      amount: parseFloat(values.amount),
      payment_date: format(values.payment_date, 'yyyy-MM-dd'),
    };

    router.post(`/admin/sales/${sale.id}/payment`, data, {
      onSuccess: () => {
        setPaymentDialogOpen(false);
        setIsSubmitting(false);
        toast({
          title: 'Pagamento registrado',
          description: 'O pagamento foi registrado com sucesso.',
          variant: 'success',
        });
      },
      onError: (errors) => {
        setIsSubmitting(false);
        console.error(errors);
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao registrar o pagamento.',
          variant: 'destructive',
        });
      }
    });
  };

  // Alterar status da venda
  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setStatusDialogOpen(true);
  };

  // Confirmar alteração de status
  const confirmStatusChange = () => {
    router.post(`/admin/sales/${sale.id}/status`, {
      status: selectedStatus
    }, {
      onSuccess: () => {
        setStatusDialogOpen(false);
        toast({
          title: 'Status atualizado',
          description: 'O status da venda foi atualizado com sucesso.',
          variant: 'success',
        });
      },
      onError: () => {
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao atualizar o status da venda.',
          variant: 'destructive',
        });
      }
    });
  };

  // Breadcrumbs dinâmicos
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Vendas',
      href: '/admin/sales',
    },
    {
      title: sale.sale_number,
      href: `/admin/sales/${sale.id}`,
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

    if (!sale.currency) {
      return new Intl.NumberFormat('pt-PT', {
        style: withSymbol ? 'currency' : 'decimal',
        currency: 'MZN'
      }).format(value);
    }

    const { decimal_separator, thousand_separator, decimal_places, symbol } = sale.currency;

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

  // Verificar se a venda está vencida
  const isOverdue = () => {
    if (sale.status === 'overdue') return true;
    if (!sale.due_date) return false;
    return new Date(sale.due_date) < new Date() && sale.amount_due > 0;
  };

  // Verificar se a venda é editável
  const isEditable = () => {
    return ['draft', 'pending'].includes(sale.status);
  };

  // Função para verificar disponibilidade de stock
  const hasStockWarning = (item: any) => {
    if (!item.warehouse_id) return false;
    if (item.available_quantity === undefined || item.available_quantity === null) return false;
    return item.available_quantity < item.quantity;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Venda ${sale.sale_number}`} />

      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/sales">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Venda {sale.sale_number}
              </h1>
              <p className="text-muted-foreground">
                {sale.status === 'draft' && 'Rascunho - '}
                {isOverdue() && 'Vencida - '}
                Emitida em {formatDate(sale.issue_date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={sale.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue>
                  <div className="flex items-center">
                    <Badge variant={getStatusBadgeVariant(sale.status)} className="mr-2">
                      {statuses.find(s => s.value === sale.status)?.label || sale.status}
                    </Badge>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value} disabled={sale.status === status.value}>
                    <Badge variant={status.color} className="mr-2">
                      {status.label}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" asChild>
              <a href={`/admin/sales/${sale.id}/pdf`} target="_blank">
                <Printer className="mr-2 h-4 w-4" />
                PDF
              </a>
            </Button>

            {isEditable() && (
              <Button variant="outline" asChild>
                <Link href={`/admin/sales/${sale.id}/edit`}>
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
        <div className="grid grid-cols-3 gap-6">
          {/* Coluna da esquerda - Informações principais */}
          <div className="col-span-2 space-y-6">
            {/* Cabeçalho com dados do cliente e informações gerais */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Venda</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium">Cliente</h3>
                  {sale.customer ? (
                    <div className="mt-1 space-y-1">
                      <p className="font-medium">{sale.customer.name}</p>
                      <p className="text-sm text-muted-foreground">{sale.customer.email}</p>
                      {sale.customer.phone && (
                        <p className="text-sm text-muted-foreground">{sale.customer.phone}</p>
                      )}
                      {sale.customer.address && (
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {sale.customer.address}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground mt-1">Sem cliente associado</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium">Informações da Venda</h3>
                  <div className="mt-1 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Número:</span>
                      <span className="font-medium">{sale.sale_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Emitida em:</span>
                      <span>{formatDate(sale.issue_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vencimento:</span>
                      <span>{formatDate(sale.due_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Moeda:</span>
                      <span>
                        {sale.currency?.code} ({sale.currency?.symbol})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa de Câmbio:</span>
                      <span>{sale.exchange_rate}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Se vier de uma cotação, mostrar a informação */}
            {sale.quotation && (
              <Card>
                <CardHeader>
                  <CardTitle>Cotação Original</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <FileBox className="h-5 w-5 mr-2 text-muted-foreground" />
                    <p>
                      Esta venda foi criada a partir da cotação{" "}
                      <Link href={`/admin/quotations/${sale.quotation.id}`} className="font-medium hover:underline">
                        {sale.quotation.quotation_number}
                      </Link>{" "}
                      emitida em {formatDate(sale.quotation.issue_date)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

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
                      {sale.items && sale.items.length > 0 ? (
                        sale.items.map((item, index) => (
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
                                <div className="text-xs text-muted-foreground mt-1">
                                  Armazém: {item.warehouse.name}
                                  {hasStockWarning(item) && (
                                    <span className="ml-1 text-destructive font-medium">
                                      (Stock insuficiente: {item.available_quantity} disponível)
                                    </span>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.quantity} {item.unit ? item.unit : ''}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.unit_price)}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.discount_percentage > 0 ? (
                                <div>
                                  <div>{item.discount_percentage}%</div>
                                  <div className="text-xs text-muted-foreground">
                                    ({formatCurrency(item.discount_amount)})
                                  </div>
                                </div>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.subtotal)}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.tax_percentage > 0 ? (
                                <div>
                                  <div>{item.tax_percentage}%</div>
                                  <div className="text-xs text-muted-foreground">
                                    ({formatCurrency(item.tax_amount)})
                                  </div>
                                </div>
                              ) : (
                                'Isento'
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.total)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Nenhum item encontrado nesta venda
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
                    <span>{formatCurrency(sale.subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Desconto:</span>
                    <span>{formatCurrency(sale.discount_amount)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      IVA ({sale.include_tax ? 'incluído' : 'excluído'}):
                    </span>
                    <span>{formatCurrency(sale.tax_amount)}</span>
                  </div>

                  {sale.shipping_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Envio:</span>
                      <span>{formatCurrency(sale.shipping_amount)}</span>
                    </div>
                  )}

                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">{formatCurrency(sale.total)}</span>
                  </div>

                  {/* Mostrar valores pagos e em dívida */}
                  {(sale.amount_paid > 0 || sale.amount_due > 0) && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pago:</span>
                        <span className="text-emerald-600">{formatCurrency(sale.amount_paid)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Em dívida:</span>
                        <span className={cn("font-bold", sale.amount_due > 0 ? "text-destructive" : "text-emerald-600")}>
                          {formatCurrency(sale.amount_due)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>

            {/* Histórico de Pagamentos */}
            {sale.payments && sale.payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Pagamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Referência</TableHead>
                        <TableHead>Notas</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sale.payments.map(payment => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.payment_date)}</TableCell>
                          <TableCell>
                            {paymentMethods.find(m => m.value === payment.payment_method)?.label || payment.payment_method}
                          </TableCell>
                          <TableCell>{payment.reference || '-'}</TableCell>
                          <TableCell>
                            {payment.notes ? (
                              payment.notes.length > 50 ? `${payment.notes.substring(0, 50)}...` : payment.notes
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Notas e termos */}
            <Card>
              <CardHeader>
                <CardTitle>Notas e Termos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sale.notes ? (
                  <div>
                    <h3 className="font-medium">Notas</h3>
                    <p className="mt-1 whitespace-pre-line">{sale.notes}</p>
                  </div>
                ) : null}

                {sale.terms ? (
                  <div>
                    <h3 className="font-medium">Termos e Condições</h3>
                    <p className="mt-1 whitespace-pre-line">{sale.terms}</p>
                  </div>
                ) : null}

                {!sale.notes && !sale.terms && (
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
                  <Badge variant={getStatusBadgeVariant(sale.status)} className="mt-1">
                    {statuses.find(s => s.value === sale.status)?.label || sale.status}
                  </Badge>

                  {isOverdue() && (
                    <div className="flex items-center mt-2 text-destructive">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Esta venda está vencida</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Utilizador</h3>
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{sale.user?.name || "Sistema"}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Datas</h3>
                  <div className="space-y-1 mt-1">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Emitida em {formatDate(sale.issue_date)}</span>
                    </div>
                    {sale.due_date && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Vencimento em {formatDate(sale.due_date)}</span>
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
                      {sale.currency?.code} ({sale.currency?.name})
                    </span>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                    <span>Taxa de câmbio: {sale.exchange_rate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumo Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Valor Total:</span>
                  <span className="font-bold">{formatCurrency(sale.total)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Valor Pago:</span>
                  <span className="text-emerald-600">{formatCurrency(sale.amount_paid)}</span>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-medium">Valor em Dívida:</span>
                  <span className={cn("font-bold text-lg", sale.amount_due > 0 ? "text-destructive" : "text-emerald-600")}>
                    {formatCurrency(sale.amount_due)}
                  </span>
                </div>

                {/* Botão de registrar pagamento */}
                {sale.amount_due > 0 && (
                  <Button
                    className="w-full"
                    onClick={() => setPaymentDialogOpen(true)}
                    disabled={['draft', 'canceled'].includes(sale.status)}
                  >
                    <Banknote className="mr-2 h-4 w-4" />
                    Registrar Pagamento
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Ações */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" asChild>
                  <a href={`/admin/sales/${sale.id}/pdf?download=true`} target="_blank">
                    <Download className="mr-2 h-4 w-4" />
                    Descarregar PDF
                  </a>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={!sale.customer || !sale.customer.email}
                  onClick={() => router.post(`/admin/sales/${sale.id}/send-email`)}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar por Email
                  {(!sale.customer || !sale.customer.email) && (
                    <span className="ml-1 text-xs text-destructive">(Sem email)</span>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.post(`/admin/sales/${sale.id}/duplicate`)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicar Venda
                </Button>

                {isEditable() && (
                  <>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href={`/admin/sales/${sale.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Venda
                      </Link>
                    </Button>

                    <Button variant="destructive" onClick={() => setDeleteAlertOpen(true)} className="w-full justify-start">
                      <Trash className="mr-2 h-4 w-4" />
                      Eliminar Venda
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Diálogo de alteração de status */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar status da venda</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja alterar o status para {statuses.find(s => s.value === selectedStatus)?.label}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Esta ação pode afetar relatórios e a visibilidade da venda no sistema.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmStatusChange}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de registro de pagamento */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Informe os dados do pagamento para esta venda.
            </DialogDescription>
          </DialogHeader>

          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(onSubmitPayment)} className="space-y-4 py-4">
              <FormField
                control={paymentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={sale.amount_due}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control}
                name="payment_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data do Pagamento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: pt })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map(method => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referência</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Número de comprovante ou referência" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Observações sobre este pagamento" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Processando..." : "Registrar Pagamento"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Alerta de confirmação de exclusão */}
      <DeleteAlert
        isOpen={deleteAlertOpen}
        onClose={() => setDeleteAlertOpen(false)}
        title="Eliminar Venda"
        description="Tem certeza que deseja eliminar esta venda? Esta ação não pode ser desfeita."
        deleteUrl={`/admin/sales/${sale.id}`}
      />
    </AppLayout>
  );
}
