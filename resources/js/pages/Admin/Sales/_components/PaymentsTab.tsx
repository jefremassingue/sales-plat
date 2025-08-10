import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Banknote } from 'lucide-react';

interface Payment {
    id: number;
    sale_id: number;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference: string | null;
    notes: string | null;
}

interface PaymentMethod {
    value: string;
    label: string;
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
        product?: Record<string, string | number | boolean | null>;
        productVariant?: Record<string, string | number | boolean | null>;
        warehouse?: Record<string, string | number | boolean | null>;
        available_quantity?: number;
    }>;
    payments?: Payment[];
    delivery_guides: Record<string, unknown>[];
    quotation?: {
        id: number;
        quotation_number: string;
        issue_date: string;
    };
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
