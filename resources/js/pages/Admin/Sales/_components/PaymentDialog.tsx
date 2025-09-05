import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface Sale {
    id: string;
    amount_due: number;
    currency?: {
        code: string;
        name: string;
        symbol: string;
        decimal_places: number;
        decimal_separator: string;
        thousand_separator: string;
    };
}

interface PaymentMethod {
    value: string;
    label: string;
}

interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sale: Sale;
    paymentMethods: PaymentMethod[];
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

export function PaymentDialog({ open, onOpenChange, sale, paymentMethods }: PaymentDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                onOpenChange(false);
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Pagamento</DialogTitle>
                    <DialogDescription>Informe os dados do pagamento para esta venda.</DialogDescription>
                </DialogHeader>
{/* <pre>{JSON.stringify(sale)}</pre> */}
                <Form {...paymentForm}>
                    <form onSubmit={paymentForm.handleSubmit(onSubmitPayment)} className="space-y-4 py-4">
                        <FormField
                            control={paymentForm.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" step="0.01" />
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
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
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
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
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
    );
}
