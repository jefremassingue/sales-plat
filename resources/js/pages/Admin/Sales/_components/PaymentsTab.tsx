import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sale } from '@/types';
import { Banknote } from 'lucide-react';


interface PaymentMethod {
    value: string;
    label: string;
}

interface PaymentsTabProps {
    sale: Sale;
    paymentMethods: PaymentMethod[];
    formatDate: (dateStr: string | undefined | null) => string;
    formatCurrency: (value: number | null | undefined, withSymbol?: boolean) => string;
    setPaymentDialogOpen: (open: boolean) => void;
}

export function PaymentsTab({ sale, paymentMethods, formatDate, formatCurrency, setPaymentDialogOpen }: PaymentsTabProps) {
    return (
        <div className="space-y-6 pt-6">
            {sale.payments && sale.payments.length > 0 ? (
                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap justify-between gap-4">
                            <CardTitle>Histórico de Pagamentos</CardTitle>
                            <span>
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
                            </span>
                        </div>
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
                                {sale.payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{formatDate(payment.payment_date)}</TableCell>
                                        <TableCell>
                                            {paymentMethods.find((m) => m.value === payment.payment_method)?.label ||
                                                payment.payment_method}
                                        </TableCell>
                                        <TableCell>{payment.reference || '-'}</TableCell>
                                        <TableCell>
                                            {payment.notes
                                                ? payment.notes.length > 50
                                                    ? `${payment.notes.substring(0, 50)}...`
                                                    : payment.notes
                                                : '-'}
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
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Histórico de Pagamentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground py-4 text-center">Nenhum pagamento registrado para esta venda.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
