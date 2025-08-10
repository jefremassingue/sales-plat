import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit, Printer, Trash } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Sale } from '@/types';

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
