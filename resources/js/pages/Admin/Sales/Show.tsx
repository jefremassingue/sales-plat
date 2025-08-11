import { DeleteAlert } from '@/components/delete-alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/utils';
import { BreadcrumbItem } from '@/types/index';
import { Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CreditCard, FileText, TrendingUp, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DeliveryGuidesTab } from './_components/DeliveryGuidesTab';
import { FinancialSummary } from './_components/FinancialSummary';
import { PaymentDialog } from './_components/PaymentDialog';
import { PaymentsTab } from './_components/PaymentsTab';
import { RevenueTab } from './_components/RevenueTab';
import { SaleDetailsCard } from './_components/SaleDetailsCard';
import { SaleHeader } from './_components/SaleHeader';
import { StatusChangeDialog } from './_components/StatusChangeDialog';

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
        product?: any;
        productVariant?: any;
        warehouse?: any;
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
    delivery_guides: any;
    quotation?: {
        id: number;
        quotation_number: string;
        issue_date: string;
    };
}

interface PaymentMethod {
    value: string;
    label: string;
}

interface Props {
    sale: Sale;
    statuses: { value: string; label: string; color: string }[];
    paymentMethods: PaymentMethod[];
}

export default function Show({ sale, statuses, paymentMethods }: Props) {
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<typeof sale.status>(sale.status);
    const { toast } = useToast();
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) {
            toast({
                title: 'Operação bem sucedida',
                description: flash.success,
                variant: 'success',
            });
        }

        if (flash?.error) {
            toast({
                title: 'Erro',
                description: flash.error,
                variant: 'destructive',
            });
        }
    }, [flash, toast]);

    const handleStatusChange = (newStatus: string) => {
        setSelectedStatus(newStatus);
        setStatusDialogOpen(true);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Vendas',
            href: '/admin/sales',
        },
        {
            title: sale.sale_number,
            href: `/admin/sales/${sale.id}`,
        },
    ];

    const formatDate = (dateStr: string | undefined | null) => {
        if (!dateStr) return 'N/A';
        return format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: pt });
    };

    const formatCurrency = (value: number | null | undefined, withSymbol = true) => {
        if (value === null || value === undefined) return 'N/A';

        if (!sale.currency) {
            return new Intl.NumberFormat('pt-PT', {
                style: withSymbol ? 'currency' : 'decimal',
                currency: 'MZN',
            }).format(value);
        }

        const { decimal_separator, thousand_separator, decimal_places, symbol } = sale.currency;

        const formattedValue = value
            .toFixed(decimal_places)
            .replace('.', 'DECIMAL')
            .replace(/\B(?=(\d{3})+(?!\d))/g, thousand_separator)
            .replace('DECIMAL', decimal_separator);

        return withSymbol ? `${symbol} ${formattedValue}` : formattedValue;
    };

    const getStatusBadgeVariant = (status: string): 'default' | 'destructive' | 'secondary' | 'outline' | null | undefined => {
        const statusObj = statuses.find((s) => s.value === status);
        return (statusObj?.color as 'default' | 'destructive' | 'secondary' | 'outline' | null | undefined) || 'secondary';
    };

    const isOverdue = () => {
        if (sale.status === 'overdue') return true;
        if (!sale.due_date) return false;
        return new Date(sale.due_date) < new Date() && sale.amount_due > 0;
    };

    const isEditable = () => {
        return ['draft', 'pending'].includes(sale.status);
    };

    const hasStockWarning = (item: any) => {
        if (!item.warehouse_id) return false;
        if (item.available_quantity === undefined || item.available_quantity === null) return false;
        return item.available_quantity < item.quantity;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Venda ${sale.sale_number}`} />

            <div className="container px-4 py-6">
                <SaleHeader
                    sale={sale}
                    statuses={statuses}
                    isEditable={isEditable}
                    isOverdue={isOverdue}
                    formatDate={formatDate}
                    getStatusBadgeVariant={getStatusBadgeVariant}
                    handleStatusChange={handleStatusChange}
                    setDeleteAlertOpen={setDeleteAlertOpen}
                />

                {/* Conteúdo principal */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Coluna da esquerda - Informações organizadas em ABAS */}

                    <div className="col-span-2">
                        <Tabs defaultValue="details" className="">
                            <TabsList className="flex w-full max-w-[calc(100vw-60px)] justify-between overflow-x-auto">
                                <TabsTrigger value="details">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Detalhes
                                </TabsTrigger>
                                <TabsTrigger value="payments">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Pagamentos ({sale.payments?.length || 0})
                                </TabsTrigger>
                                <TabsTrigger value="delivery-guides">
                                    <Truck className="mr-2 h-4 w-4" />
                                    Guias de Entrega ({sale.delivery_guides?.length || 0})
                                </TabsTrigger>
                                {can('admin-sale.viewrevenue') && (
                                    <TabsTrigger value="revenue">
                                        <TrendingUp className="mr-2 h-4 w-4" />
                                        Receita
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            {/* ABA 1: DETALHES */}
                            <TabsContent value="details">
                                <SaleDetailsCard
                                    sale={sale}
                                    formatDate={formatDate}
                                    formatCurrency={formatCurrency}
                                    hasStockWarning={hasStockWarning}
                                />
                            </TabsContent>

                            {/* ABA 2: PAGAMENTOS */}
                            <TabsContent value="payments">
                                <PaymentsTab
                                    sale={sale}
                                    paymentMethods={paymentMethods}
                                    formatDate={formatDate}
                                    formatCurrency={formatCurrency}
                                    setPaymentDialogOpen={setPaymentDialogOpen}
                                />
                            </TabsContent>

                            {/* ABA 3: GUIAS DE ENTREGA */}
                            <TabsContent value="delivery-guides">
                                <DeliveryGuidesTab sale={sale} formatDate={formatDate} />
                            </TabsContent>

                            {/* ABA 4: RECEITA */}
                            {can('admin-sale.viewrevenue') && (
                                <TabsContent value="revenue">
                                    <RevenueTab sale={sale} formatCurrency={formatCurrency} />
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>

                    {/* Coluna da direita - Informações e ações globais */}
                    <FinancialSummary
                        sale={sale}
                        formatCurrency={formatCurrency}
                        isEditable={isEditable}
                        isOverdue={isOverdue}
                        formatDate={formatDate}
                        getStatusBadgeVariant={getStatusBadgeVariant}
                        statuses={statuses}
                        setPaymentDialogOpen={setPaymentDialogOpen}
                        setDeleteAlertOpen={setDeleteAlertOpen}
                    />
                </div>
            </div>

            <StatusChangeDialog
                open={statusDialogOpen}
                onOpenChange={setStatusDialogOpen}
                saleId={sale.id}
                selectedStatus={selectedStatus}
                statuses={statuses}
            />

            <PaymentDialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen} sale={sale} paymentMethods={paymentMethods} />

            <DeleteAlert
                isOpen={deleteAlertOpen}
                onClose={() => setDeleteAlertOpen(false)}
                title="Eliminar Venda"
                description="Tem certeza que deseja eliminar esta venda? Esta ação não pode ser desfeita."
                deleteUrl={`/admin/sales/${sale.id}`}
            />
        </AppLayout>
    );
}
