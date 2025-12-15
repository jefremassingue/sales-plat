import { DeleteAlert } from '@/components/delete-alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/utils';
import { type BreadcrumbItem, type Sale } from '@/types/index.d';
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
import UpdateUserDialog from '../Quotations/_components/UpdateUserDialog';
import { type User } from '@/types';

interface PaymentMethod {
    value: string;
    label: string;
}

interface Props {
    sale: Sale;
    statuses: { value: string; label: string; color: string }[];
    paymentMethods: PaymentMethod[];
    users: User[];
}

export default function Show({ sale, statuses, paymentMethods, users }: Props) {
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [updateUserDialogOpen, setUpdateUserDialogOpen] = useState(false);

    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<typeof sale.status>(sale.status);
    const { toast } = useToast();
    const { flash } = usePage().props as { flash?: { success?: string; error?: string } };

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
        setSelectedStatus(newStatus as typeof sale.status);
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

        // Ensure value is a number
        const numericValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;

        if (!sale.currency) {
            return new Intl.NumberFormat('pt-PT', {
                style: withSymbol ? 'currency' : 'decimal',
                currency: 'MZN',
            }).format(numericValue);
        }

        const { decimal_separator, thousand_separator, decimal_places, symbol } = sale.currency;

        const formattedValue = numericValue
            .toFixed(decimal_places || 2)
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

    const hasStockWarning = (item: Sale['items'][0]) => {
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
                                {can('admin-sale.showrevenue') && (
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
                            {can('admin-sale.showrevenue') && (
                                <TabsContent value="revenue">
                                    <RevenueTab 
                                        sale={sale as Sale & {
                                            commission_rate?: number;
                                            backup_rate?: number;
                                            total_cost?: number;
                                            commission_amount?: number;
                                            backup_amount?: number;
                                            expenses?: Array<{
                                                id: string;
                                                description: string;
                                                amount: number;
                                                created_at: string;
                                            }>;
                                            items: Array<Sale['items'][0] & {
                                                cost?: number;
                                            }>;
                                        }} 
                                        formatCurrency={formatCurrency} 
                                    />
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
                        setUpdateUserDialogOpen={setUpdateUserDialogOpen}
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

            <PaymentDialog 
                open={paymentDialogOpen} 
                onOpenChange={setPaymentDialogOpen} 
                sale={{
                    id: sale.id,
                    amount_due: sale.amount_due,
                    currency: sale.currency
                }} 
                paymentMethods={paymentMethods} 
            />

            <UpdateUserDialog
                open={updateUserDialogOpen}
                onOpenChange={setUpdateUserDialogOpen}
                entityId={sale.id}
                entityType="sale"
                currentUserId={sale.user_id?.toString()}
                users={users}
            />

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
