import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit, Printer, Trash } from 'lucide-react';
import { Link } from '@inertiajs/react';

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
        product?: Record<string, unknown>;
        productVariant?: Record<string, unknown>;
        warehouse?: Record<string, unknown>;
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
    delivery_guides: Record<string, unknown>[];
    quotation?: {
        id: number;
        quotation_number: string;
        issue_date: string;
    };
}

interface SaleHeaderProps {
    sale: Sale;
    statuses: { value: string; label: string; color: string }[];
    isEditable: () => boolean;
    isOverdue: () => boolean;
    formatDate: (dateStr: string | undefined | null) => string;
    getStatusBadgeVariant: (status: string) => "default" | "secondary" | "destructive" | "outline" | null | undefined;
    handleStatusChange: (newStatus: string) => void;
    setDeleteAlertOpen: (open: boolean) => void;
}

export function SaleHeader({
    sale,
    statuses,
    isEditable,
    isOverdue,
    formatDate,
    getStatusBadgeVariant,
    handleStatusChange,
    setDeleteAlertOpen,
}: SaleHeaderProps) {
    return (
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/sales">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold">Venda {sale.sale_number}</h1>
                    <p className="text-muted-foreground">
                        {sale.status === 'draft' && 'Rascunho - '}
                        {isOverdue() && 'Vencida - '}
                        Emitida em {formatDate(sale.issue_date)}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Select value={sale.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue>
                            <div className="flex items-center">
                                <Badge variant={getStatusBadgeVariant(sale.status)} className="mr-2">
                                    {statuses.find((s) => s.value === sale.status)?.label || sale.status}
                                </Badge>
                            </div>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {statuses.map((status) => (
                            <SelectItem key={status.value} value={status.value} disabled={sale.status === status.value}>
                                <Badge variant={status.color as "default" | "secondary" | "destructive" | "outline" | null | undefined} className="mr-2">
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
    );
}
