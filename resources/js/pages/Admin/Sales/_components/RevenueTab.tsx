import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sale } from '@/types';

interface RevenueTabProps {
    sale: Sale;
    formatCurrency: (value: number | null | undefined, withSymbol?: boolean) => string;
}

export function RevenueTab({ sale, formatCurrency }: RevenueTabProps) {
    // Calcular lucro bruto (simplificado - pode ser expandido com custos reais)
    const grossProfit = sale.total - sale.tax_amount;
    const profitMargin = sale.total > 0 ? (grossProfit / sale.total) * 100 : 0;

    return (
        <div className="space-y-6 pt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Receita e Lucro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-4">
                                <div className="text-sm text-muted-foreground">Receita Total</div>
                                <div className="text-2xl font-bold text-primary">{formatCurrency(sale.total)}</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-green-500/5 border-green-500/20">
                            <CardContent className="p-4">
                                <div className="text-sm text-muted-foreground">Lucro Bruto</div>
                                <div className="text-2xl font-bold text-green-500">{formatCurrency(grossProfit)}</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-blue-500/5 border-blue-500/20">
                            <CardContent className="p-4">
                                <div className="text-sm text-muted-foreground">Margem de Lucro</div>
                                <div className="text-2xl font-bold text-blue-500">{profitMargin.toFixed(1)}%</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-medium">Detalhamento Financeiro</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span>{formatCurrency(sale.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Descontos:</span>
                                <span className="text-destructive">-{formatCurrency(sale.discount_amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Impostos:</span>
                                <span className="text-destructive">-{formatCurrency(sale.tax_amount)}</span>
                            </div>
                            {sale.shipping_amount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Frete:</span>
                                    <span>{formatCurrency(sale.shipping_amount)}</span>
                                </div>
                            )}
                            <div className="border-t pt-2">
                                <div className="flex justify-between font-medium">
                                    <span>Total:</span>
                                    <span>{formatCurrency(sale.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-medium">Pagamentos Recebidos</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Valor Pago:</span>
                                <span className="text-emerald-600">{formatCurrency(sale.amount_paid)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Valor Pendente:</span>
                                <span className={sale.amount_due > 0 ? 'text-destructive' : 'text-emerald-600'}>
                                    {formatCurrency(sale.amount_due)}
                                </span>
                            </div>
                            <div className="border-t pt-2">
                                <div className="flex justify-between font-medium">
                                    <span>Percentual Recebido:</span>
                                    <span>
                                        {sale.total > 0 ? ((sale.amount_paid / sale.total) * 100).toFixed(1) : '0'}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
