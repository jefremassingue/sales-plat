import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sale } from '@/types';
import { ChevronDown, FileText, Receipt } from 'lucide-react';

interface DocumentDropdownProps {
    sale: Sale;
}

export function DocumentDropdown({ sale }: DocumentDropdownProps) {
    const canGenerateInvoice = ['draft', 'pending', 'partial', 'paid'].includes(sale.status);
    const canGenerateReceipt = sale.amount_paid > 0;
    const hasMultiplePayments = sale.payments && sale.payments.length > 1;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Documentos
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {/* Faturas */}
                {canGenerateInvoice && (
                    <>
                        <DropdownMenuItem asChild>
                            <a href={`/admin/sales/${sale.id}/pdf?type=invoice`} target="_blank">
                                <FileText className="mr-2 h-4 w-4" />
                                Fatura
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={`/admin/sales/${sale.id}/pdf?type=invoice&download=true`} target="_blank">
                                <FileText className="mr-2 h-4 w-4" />
                                Descarregar Fatura
                            </a>
                        </DropdownMenuItem>
                    </>
                )}

                {canGenerateInvoice && canGenerateReceipt && <DropdownMenuSeparator />}

                {/* Recibos */}
                {canGenerateReceipt && (
                    <>
                        {/* Recibo Final - apenas se totalmente pago */}
                        {sale.status === 'paid' && (
                            <>
                                <DropdownMenuItem asChild>
                                    <a href={`/admin/sales/${sale.id}/pdf?type=receipt`} target="_blank">
                                        <Receipt className="mr-2 h-4 w-4" />
                                        Recibo Final
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a href={`/admin/sales/${sale.id}/pdf?type=receipt&download=true`} target="_blank">
                                        <Receipt className="mr-2 h-4 w-4" />
                                        Descarregar Recibo Final
                                    </a>
                                </DropdownMenuItem>
                            </>
                        )}

                        {/* Recibos de pagamentos individuais */}
                        {hasMultiplePayments && sale.payments && sale.payments.length > 0 && (
                            <>
                                {sale.status === 'paid' && <DropdownMenuSeparator />}
                                <div className="px-2 py-1.5 text-sm font-semibold">Recibos</div>
                                {sale.payments.map((payment, index) => (
                                    <DropdownMenuItem key={payment.id} asChild>
                                        <a
                                            href={`/admin/sales/${sale.id}/pdf?type=payment_receipt&payment_id=${payment.id}`}
                                            target="_blank"
                                        >
                                            <Receipt className="mr-2 h-4 w-4" />
                                            Pagamento {index + 1} - {sale.currency 
                                                ? `${sale.currency.symbol} ${payment.amount.toLocaleString('pt-PT', {
                                                    minimumFractionDigits: sale.currency.decimal_places || 2,
                                                    maximumFractionDigits: sale.currency.decimal_places || 2
                                                })}`
                                                : `${payment.amount.toLocaleString('pt-PT', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })} MT`
                                            }
                                        </a>
                                    </DropdownMenuItem>
                                ))}
                            </>
                        )}

                        {/* Recibo de pagamento único */}
                        {!hasMultiplePayments && sale.payments && sale.payments.length === 1 && sale.status !== 'paid' && (
                            <>
                                <DropdownMenuItem asChild>
                                    <a
                                        href={`/admin/sales/${sale.id}/pdf?type=payment_receipt&payment_id=${sale.payments[0].id}`}
                                        target="_blank"
                                    >
                                        <Receipt className="mr-2 h-4 w-4" />
                                        Recibo
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a
                                        href={`/admin/sales/${sale.id}/pdf?type=payment_receipt&payment_id=${sale.payments[0].id}&download=true`}
                                        target="_blank"
                                    >
                                        <Receipt className="mr-2 h-4 w-4" />
                                        Descarregar Recibo
                                    </a>
                                </DropdownMenuItem>
                            </>
                        )}
                    </>
                )}

                {/* Se não pode gerar nenhum documento */}
                {!canGenerateInvoice && !canGenerateReceipt && (
                    <DropdownMenuItem disabled>
                        <FileText className="mr-2 h-4 w-4" />
                        Nenhum documento disponível
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
