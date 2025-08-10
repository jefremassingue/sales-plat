import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Plus, Printer, Trash2, Upload } from 'lucide-react';

interface DeliveryGuide {
    id: number;
    notes: string | null;
    created_at: string;
    [key: string]: unknown; // Para propriedades adicionais
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
    payments?: Array<{
        id: number;
        sale_id: number;
        amount: number;
        payment_date: string;
        payment_method: string;
        reference: string | null;
        notes: string | null;
    }>;
    delivery_guides: DeliveryGuide[];
    quotation?: {
        id: number;
        quotation_number: string;
        issue_date: string;
    };
}

interface DeliveryGuidesTabProps {
    sale: Sale;
    formatDate: (dateStr: string | undefined | null) => string;
    setDeliveryGuideDialogOpen: (open: boolean) => void;
}

export function DeliveryGuidesTab({ sale, formatDate, setDeliveryGuideDialogOpen }: DeliveryGuidesTabProps) {
    return (
        <div className="space-y-6 pt-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                        <CardTitle>Guias de Entrega</CardTitle>
                        <Button onClick={() => setDeliveryGuideDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Adicionar Nova Guia</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Nota</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Anexo</TableHead>
                                    <TableHead className="text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sale.delivery_guides && sale.delivery_guides.length > 0 ? (
                                    sale.delivery_guides.map((delivery_guide) => (
                                        <TableRow key={delivery_guide.id}>
                                            <TableCell>{delivery_guide.id || '-'}</TableCell>
                                            <TableCell>{delivery_guide.notes || 'Sem nota'}</TableCell>
                                            <TableCell>{formatDate(delivery_guide.created_at)}</TableCell>
                                            <TableCell className="font-medium">-</TableCell>
                                            <TableCell className="flex gap-1 text-right font-medium">
                                                <Button>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Carregar Doc.
                                                </Button>
                                                <Button variant="outline">
                                                    <Printer className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" className="text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-muted-foreground py-4 text-center">
                                            Nenhuma guia de entrega encontrada.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
