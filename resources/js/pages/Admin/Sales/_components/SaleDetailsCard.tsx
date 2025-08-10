import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Sale, SaleItem } from '@/types';
import { Link } from '@inertiajs/react';
import { FileBox } from 'lucide-react';

interface SaleDetailsCardProps {
    sale: Sale;
    formatDate: (dateStr: string | undefined | null) => string;
    formatCurrency: (value: number | null | undefined, withSymbol?: boolean) => string;
    hasStockWarning: (item: SaleItem) => boolean;
}

export function SaleDetailsCard({
    sale,
    formatDate,
    formatCurrency,
    hasStockWarning,
}: SaleDetailsCardProps) {
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
                                <p className="text-sm text-muted-foreground">
                                    {sale.customer.email}
                                </p>
                                {sale.customer.phone && (
                                    <p className="text-sm text-muted-foreground">
                                        {sale.customer.phone}
                                    </p>
                                )}
                                {sale.customer.address && (
                                    <p className="whitespace-pre-line text-sm text-muted-foreground">
                                        {sale.customer.address}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="mt-1 text-muted-foreground">
                                Sem cliente associado
                            </p>
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
                            <FileBox className="mr-2 h-5 w-5 text-muted-foreground" />
                            <p>
                                Esta venda foi criada a partir da cotação{' '}
                                <Link
                                    href={`/admin/quotations/${sale.quotation.id}`}
                                    className="font-medium hover:underline"
                                >
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-left">Produto</TableHead>
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
                                                    {item.description.replace(/<[^>]*>/g, '').length >
                                                    50
                                                        ? `${item.description
                                                              .replace(/<[^>]*>/g, '')
                                                              .substring(0, 50)}...`
                                                        : item.description.replace(/<[^>]*>/g, '')}
                                                </div>
                                            )}
                                            {item.warehouse && (
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    Armazém: {item.warehouse.name}
                                                    {hasStockWarning(item) && (
                                                        <span className="ml-1 font-medium text-destructive">
                                                            (Stock insuficiente: {item.available_quantity}{' '}
                                                            disponível)
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
                                    <TableCell
                                        colSpan={7}
                                        className="py-4 text-center text-muted-foreground"
                                    >
                                        Nenhum item encontrado nesta venda
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
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

                        <div className="border-t pt-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Total:</span>
                                <span className="text-lg font-bold">
                                    {formatCurrency(sale.total)}
                                </span>
                            </div>
                            {(sale.amount_paid > 0 || sale.amount_due > 0) && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Pago:</span>
                                        <span className="text-emerald-600">
                                            {formatCurrency(sale.amount_paid)}
                                        </span>
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

                    {!sale.notes && !sale.terms && (
                        <p className="text-muted-foreground">
                            Nenhuma nota ou termo adicional
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}