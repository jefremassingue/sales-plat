import { DeleteAlert } from '@/components/delete-alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// IMPORTAÇÃO ADICIONADA: Componentes de Tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
    Calendar,
    CreditCard,
    FileText,
    TrendingUp,
    Truck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import DeliveryGuideDialog from './_components/DeliveryGuideDialog';
import { SaleHeader } from './_components/SaleHeader';
import { SaleDetailsCard } from './_components/SaleDetailsCard';
import { PaymentsTab } from './_components/PaymentsTab';
import { DeliveryGuidesTab } from './_components/DeliveryGuidesTab';
import { RevenueTab } from './_components/RevenueTab';
import { FinancialSummary } from './_components/FinancialSummary';

// ... (Interfaces Sale, PaymentMethod, etc. permanecem as mesmas)
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

interface DeliveryGuideItem {
    id: number;
    sale_item_id: number;
    quantity: number;
    sale_item?: any; // Opcional, se o backend enviar
}

interface DeliveryGuide {
    id: number;
    notes: string | null;
    created_at: string;
    items: DeliveryGuideItem[];
}

const paymentSchema = z.object({
    amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: 'O valor deve ser um número maior que zero',
    }),
    payment_date: z.date({
        required_error: 'Data de pagamento é obrigatória',
    }),
    payment_method: z.string({
        required_error: 'Método de pagamento é obrigatório',
    }),
    reference: z.string().optional(),
    notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function Show({ sale, statuses, paymentMethods }: Props) {
    // ... (Todos os hooks e funções permanecem os mesmos)
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [deliveryGuideDialogOpen, setDeliveryGuideDialogOpen] = useState(false);
    const [editingDeliveryGuide, setEditingDeliveryGuide] = useState<DeliveryGuide | null>(null);
    const [deletingDeliveryGuide, setDeletingDeliveryGuide] = useState<DeliveryGuide | null>(null);

    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<typeof sale.status>(sale.status);
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    const paymentForm = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: sale.amount_due.toString(),
            payment_date: new Date(),
            payment_method: '',
            reference: '',
            notes: '',
        },
    });

    const onSubmitPayment = (values: PaymentFormValues) => {
        setIsSubmitting(true);

        const data = {
            ...values,
            amount: parseFloat(values.amount),
            payment_date: format(values.payment_date, 'yyyy-MM-dd'),
        };

        router.post(`/admin/sales/${sale.id}/payment`, data, {
            onSuccess: () => {
                setPaymentDialogOpen(false);
                setIsSubmitting(false);
                toast({
                    title: 'Pagamento registrado',
                    description: 'O pagamento foi registrado com sucesso.',
                    variant: 'success',
                });
            },
            onError: (errors) => {
                setIsSubmitting(false);
                console.error(errors);
                toast({
                    title: 'Erro',
                    description: 'Ocorreu um erro ao registrar o pagamento.',
                    variant: 'destructive',
                });
            },
        });
    };

    const handleStatusChange = (newStatus: string) => {
        setSelectedStatus(newStatus);
        setStatusDialogOpen(true);
    };

    const confirmStatusChange = () => {
        router.post(
            `/admin/sales/${sale.id}/status`,
            {
                status: selectedStatus,
            },
            {
                onSuccess: () => {
                    setStatusDialogOpen(false);
                    toast({
                        title: 'Status atualizado',
                        description: 'O status da venda foi atualizado com sucesso.',
                        variant: 'success',
                    });
                },
                onError: () => {
                    toast({
                        title: 'Erro',
                        description: 'Ocorreu um erro ao atualizar o status da venda.',
                        variant: 'destructive',
                    });
                },
            },
        );
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

    const getStatusBadgeVariant = (status: string): "default" | "destructive" | "secondary" | "outline" | null | undefined => {
        const statusObj = statuses.find((s) => s.value === status);
        return statusObj?.color as "default" | "destructive" | "secondary" | "outline" | null | undefined || 'secondary';
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
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
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
                                <TabsTrigger value="revenue">
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    Receita
                                </TabsTrigger>
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
                                <DeliveryGuidesTab
                                    sale={sale}
                                    formatDate={formatDate}
                                    setDeliveryGuideDialogOpen={setDeliveryGuideDialogOpen}
                                />
                            </TabsContent>

                            {/* ABA 4: RECEITA */}
                            <TabsContent value="revenue">
                                <RevenueTab
                                    sale={sale}
                                    formatCurrency={formatCurrency}
                                />
                            </TabsContent>
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

            {/* Diálogos e Alertas (Permanecem os mesmos) */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Alterar status da venda</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja alterar o status para {statuses.find((s) => s.value === selectedStatus)?.label}?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-muted-foreground text-sm">Esta ação pode afetar relatórios e a visibilidade da venda no sistema.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={confirmStatusChange}>Confirmar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Registrar Pagamento</DialogTitle>
                        <DialogDescription>Informe os dados do pagamento para esta venda.</DialogDescription>
                    </DialogHeader>

                    <Form {...paymentForm}>
                        <form onSubmit={paymentForm.handleSubmit(onSubmitPayment)} className="space-y-4 py-4">
                            <FormField
                                control={paymentForm.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" step="0.01" min="0.01" max={sale.amount_due} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={paymentForm.control}
                                name="payment_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Data do Pagamento</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={'outline'}
                                                        className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, 'dd/MM/yyyy', { locale: pt })
                                                        ) : (
                                                            <span>Selecione uma data</span>
                                                        )}
                                                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={paymentForm.control}
                                name="payment_method"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Método de Pagamento</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione um método" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {paymentMethods.map((method) => (
                                                    <SelectItem key={method.value} value={method.value}>
                                                        {method.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={paymentForm.control}
                                name="reference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Referência</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Número de comprovante ou referência" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={paymentForm.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notas</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Observações sobre este pagamento" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Processando...' : 'Registrar Pagamento'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <DeleteAlert
                isOpen={deleteAlertOpen}
                onClose={() => setDeleteAlertOpen(false)}
                title="Eliminar Venda"
                description="Tem certeza que deseja eliminar esta venda? Esta ação não pode ser desfeita."
                deleteUrl={`/admin/sales/${sale.id}`}
            />
            <DeliveryGuideDialog
                open={deliveryGuideDialogOpen}
                onOpenChange={setDeliveryGuideDialogOpen}
                sale={sale}
                deliveryGuide={editingDeliveryGuide}
            />
        </AppLayout>
    );
}
