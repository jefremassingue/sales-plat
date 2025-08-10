import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { FileBox } from 'lucide-react';

interface SaleItem {
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
    product?: Record<string, unknown>;
    productVariant?: Record<string, unknown>;
    warehouse?: {
        id: number;
        name: string;
    };
    available_quantity?: number;
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
    items: SaleItem[];
    payments?: Array<{
        id: number;
        sale_id: number;
        amount: number;
        payment_date: string;
        payment_method: string;
        reference: string | null;
        notes: string | null;
    }>;
    delivery_guides: Record<string, unknown>[];
    quotation?: {
        id: number;
        quotation_number: string;
        issue_date: string;
    };
}

interface SaleDetailsCardProps {
    sale: Sale;
    formatDate: (dateStr: string | undefined | null) => string;
    formatCurrency: (value: number | null | undefined, withSymbol?: boolean) => string;
    hasStockWarning: (item: SaleItem) => boolean;
}

export function SaleDetailsCard({ sale, formatDate, formatCurrency, hasStockWarning }: SaleDetailsCardProps) {
    return (
        <div className="space-y-6 pt-6">
            {/* Cabeçalho com dados do cliente e informações gerais */}
            <Card>
                <CardHeader>
                    <CardTitle>Detalhes da Venda</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm md:grid-cols-2 md:text-base">
                    <div>
                        <h3 className="text-lg font-medium">Cliente</h3>
                        {sale.customer ? (
                            <div className="mt-1 space-y-1">
                                <p className="font-medium">{sale.customer.name}</p>
                                <p className="text-muted-foreground text-sm">{sale.customer.email}</p>
                                {sale.customer.phone && (
                                    <p className="text-muted-foreground text-sm">{sale.customer.phone}</p>
                                )}
                                {sale.customer.address && (
                                    <p className="text-muted-foreground text-sm whitespace-pre-line">
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
                            <FileBox className="text-muted-foreground mr-2 h-5 w-5" />
                            <p>
                                Esta venda foi criada a partir da cotação{' '}
                                <Link href={`/admin/quotations/${sale.quotation.id}`} className="font-medium hover:underline">
                                    {sale.quotation.quotation_number}
                                </Link>{' '}
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
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Produto</th>
                                    <th className="text-right py-2">Quantidade</th>
                                    <th className="text-right py-2">Preço Unitário</th>
                                    <th className="text-right py-2">Desconto</th>
                                    <th className="text-right py-2">Subtotal</th>
                                    <th className="text-right py-2">Imposto</th>
                                    <th className="text-right py-2">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sale.items && sale.items.length > 0 ? (
                                    sale.items.map((item, index) => (
                                        <tr key={item.id || index} className="border-b">
                                            <td className="py-2">
                                                <div className="font-medium">{item.name}</div>
                                                {item.description && (
                                                    <div className="text-muted-foreground text-sm">
                                                        {item.description.replace(/<[^>]*>/g, '').length > 50
                                                            ? `${item.description.replace(/<[^>]*>/g, '').substring(0, 50)}...`
                                                            : item.description.replace(/<[^>]*>/g, '')}
                                                    </div>
                                                )}
                                                {item.warehouse && (
                                                    <div className="text-muted-foreground mt-1 text-xs">
                                                        Armazém: {item.warehouse.name}
                                                        {hasStockWarning(item) && (
                                                            <span className="text-destructive ml-1 font-medium">
                                                                (Stock insuficiente: {item.available_quantity} disponível)
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="text-right py-2">
                                                {item.quantity} {item.unit ? item.unit : ''}
                                            </td>
                                            <td className="text-right py-2">{formatCurrency(item.unit_price)}</td>
                                            <td className="text-right py-2">
                                                {item.discount_percentage > 0 ? (
                                                    <div>
                                                        <div>{item.discount_percentage}%</div>
                                                        <div className="text-muted-foreground text-xs">
                                                            ({formatCurrency(item.discount_amount)})
                                                        </div>
                                                    </div>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td className="text-right py-2">{formatCurrency(item.subtotal)}</td>
                                            <td className="text-right py-2">
                                                {item.tax_percentage > 0 ? (
                                                    <div>
                                                        <div>{item.tax_percentage}%</div>
                                                        <div className="text-muted-foreground text-xs">
                                                            ({formatCurrency(item.tax_amount)})
                                                        </div>
                                                    </div>
                                                ) : (
                                                    'Isento'
                                                )}
                                            </td>
                                            <td className="text-right py-2 font-medium">
                                                {formatCurrency(item.total)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-4 text-center text-muted-foreground">
                                            Nenhum item encontrado nesta venda
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                <div className="border-t p-6">
                    <div className="ml-auto w-full max-w-xs space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span>{formatCurrency(sale.subtotal)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Desconto:</span>
                            <span>{formatCurrency(sale.discount_amount)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">IVA ({sale.include_tax ? 'incluído' : 'excluído'}):</span>
                            <span>{formatCurrency(sale.tax_amount)}</span>
                        </div>

                        {sale.shipping_amount > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Envio:</span>
                                <span>{formatCurrency(sale.shipping_amount)}</span>
                            </div>
                        )}

                        <div className="border-t pt-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Total:</span>
                                <span className="text-lg font-bold">{formatCurrency(sale.total)}</span>
                            </div>
                            {(sale.amount_paid > 0 || sale.amount_due > 0) && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Pago:</span>
                                        <span className="text-emerald-600">{formatCurrency(sale.amount_paid)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Em dívida:</span>
                                        <span className="font-bold text-destructive">
                                            {formatCurrency(sale.amount_due)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

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

                    {!sale.notes && !sale.terms && <p className="text-muted-foreground">Nenhuma nota ou termo adicional</p>}
                </CardContent>
            </Card>
        </div>
    );
}
