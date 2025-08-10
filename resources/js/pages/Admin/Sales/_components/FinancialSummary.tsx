import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Sale } from '@/types';
import { router } from '@inertiajs/react';
import { AlertCircle, Banknote, Calendar, CreditCard, User } from 'lucide-react';


interface FinancialSummaryProps {
    sale: Sale;
    formatCurrency: (value: number | null | undefined, withSymbol?: boolean) => string;
    isEditable: () => boolean;
    isOverdue: () => boolean;
    formatDate: (dateStr: string | undefined | null) => string;
    getStatusBadgeVariant: (status: string) => "default" | "destructive" | "secondary" | "outline" | null | undefined;
    statuses: { value: string; label: string; color: string }[];
    setPaymentDialogOpen: (open: boolean) => void;
    setDeleteAlertOpen: (open: boolean) => void;
}

export function FinancialSummary({
    sale,
    formatCurrency,
    isEditable,
    isOverdue,
    formatDate,
    getStatusBadgeVariant,
    statuses,
    setPaymentDialogOpen,
    setDeleteAlertOpen,
}: FinancialSummaryProps) {
    return (
        <div className="space-y-6">
            {/* Resumo Financeiro */}
            <Card>
                <CardHeader>
                    <CardTitle>Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Valor Total:</span>
                        <span className="font-bold">{formatCurrency(sale.total)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Valor Pago:</span>
                        <span className="text-emerald-600">{formatCurrency(sale.amount_paid)}</span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <span className="font-medium">Valor em Dívida:</span>
                        <span className={cn('text-lg font-bold', sale.amount_due > 0 ? 'text-destructive' : 'text-emerald-600')}>
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

            {/* Status e informações */}
            <Card>
                <CardHeader>
                    <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="text-muted-foreground text-sm font-medium">Status atual</h3>
                        <div className="mt-1">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                getStatusBadgeVariant(sale.status) === 'destructive' ? 'bg-destructive/10 text-destructive' :
                                getStatusBadgeVariant(sale.status) === 'secondary' ? 'bg-secondary/10 text-secondary' :
                                getStatusBadgeVariant(sale.status) === 'outline' ? 'border border-input bg-background' :
                                'bg-primary/10 text-primary'
                            }`}>
                                {statuses.find((s) => s.value === sale.status)?.label || sale.status}
                            </span>
                        </div>

                        {isOverdue() && (
                            <div className="text-destructive mt-2 flex items-center">
                                <AlertCircle className="mr-1 h-4 w-4" />
                                <span className="text-sm">Esta venda está vencida</span>
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-muted-foreground text-sm font-medium">Utilizador</h3>
                        <div className="mt-1 flex items-center">
                            <User className="text-muted-foreground mr-2 h-4 w-4" />
                            <span>{sale.user?.name || 'Sistema'}</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-muted-foreground text-sm font-medium">Datas</h3>
                        <div className="mt-1 space-y-1">
                            <div className="flex items-center">
                                <Calendar className="text-muted-foreground mr-2 h-4 w-4" />
                                <span>Emitida em {formatDate(sale.issue_date)}</span>
                            </div>
                            {sale.due_date && (
                                <div className="flex items-center">
                                    <Calendar className="text-muted-foreground mr-2 h-4 w-4" />
                                    <span>Vencimento em {formatDate(sale.due_date)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-muted-foreground text-sm font-medium">Moeda</h3>
                        <div className="mt-1 flex items-center">
                            <CreditCard className="text-muted-foreground mr-2 h-4 w-4" />
                            <span>
                                {sale.currency?.code} ({sale.currency?.name})
                            </span>
                        </div>
                        <div className="text-muted-foreground mt-1 flex items-center text-sm">
                            <span>Taxa de câmbio: {sale.exchange_rate}</span>
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
                        <a href={`/admin/sales/${sale.id}/pdf?download=true`} target="_blank">
                            <Banknote className="mr-2 h-4 w-4" />
                            Descarregar PDF
                        </a>
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        disabled={!sale.customer || !sale.customer.email}
                        onClick={() => router.post(`/admin/sales/${sale.id}/send-email`)}
                    >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Enviar por Email
                        {(!sale.customer || !sale.customer.email) && <span className="text-destructive ml-1 text-xs">(Sem email)</span>}
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => router.post(`/admin/sales/${sale.id}/duplicate`)}
                    >
                        <Banknote className="mr-2 h-4 w-4" />
                        Duplicar Venda
                    </Button>

                    {isEditable() && (
                        <>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <a href={`/admin/sales/${sale.id}/edit`}>
                                    <Banknote className="mr-2 h-4 w-4" />
                                    Editar Venda
                                </a>
                            </Button>

                            <Button variant="destructive" onClick={() => setDeleteAlertOpen(true)} className="w-full justify-start">
                                <Banknote className="mr-2 h-4 w-4" />
                                Eliminar Venda
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
