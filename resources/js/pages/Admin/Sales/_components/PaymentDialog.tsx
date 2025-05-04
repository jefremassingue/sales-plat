import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  formatCurrency: (value: number) => string;
  paymentMethods: { value: string; label: string }[];
  onSubmit: (data: PaymentData) => void;
}

export interface PaymentData {
  amount_paid: number;
  payment_method: string;
  change_amount: number;
  status: 'paid' | 'partial';
}

export default function PaymentDialog({
  open,
  onOpenChange,
  totalAmount,
  formatCurrency,
  paymentMethods,
  onSubmit
}: PaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const formSchema = z.object({
    amount_paid: z.string()
      .min(1, { message: "Valor é obrigatório" })
      .refine(val => !isNaN(parseFloat(val)), { message: "Deve ser um número válido" })
      .refine(val => parseFloat(val) > 0, { message: "Deve ser maior que zero" }),
    payment_method: z.string().min(1, { message: "Método de pagamento é obrigatório" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount_paid: totalAmount.toString(),
      payment_method: paymentMethods.length > 0 ? paymentMethods[0].value : '',
    }
  });

  useEffect(() => {
    if (open) {
      form.setValue('amount_paid', totalAmount.toString());
    }
  }, [open, totalAmount, form]);

  const amountPaid = parseFloat(form.watch('amount_paid') || '0');
  const changeAmount = amountPaid - totalAmount;
  const paymentStatus = amountPaid >= totalAmount ? 'paid' : 'partial';

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const amountValue = parseFloat(values.amount_paid);

      if (amountValue <= 0) {
        toast({
          title: "Valor inválido",
          description: "O valor pago deve ser maior que zero",
          variant: "destructive",
        });
        return;
      }

      onSubmit({
        amount_paid: amountValue,
        payment_method: values.payment_method,
        change_amount: Math.max(0, amountValue - totalAmount),
        status: amountValue >= totalAmount ? 'paid' : 'partial'
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar o pagamento",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="mb-5 text-lg font-bold">
              Total a Pagar: {formatCurrency(totalAmount)}
            </div>

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods.map(method => (
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
              control={form.control}
              name="amount_paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Recebido</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="0.01"
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {changeAmount !== 0 && (
              <div className={`py-3 px-4 rounded-md ${changeAmount >= 0 ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                {changeAmount > 0 ? (
                  <div className="text-emerald-600 font-medium">
                    Troco: {formatCurrency(changeAmount)}
                  </div>
                ) : (
                  <div className="text-amber-600 font-medium">
                    Em falta: {formatCurrency(Math.abs(changeAmount))}
                  </div>
                )}
              </div>
            )}

            {paymentStatus === 'partial' && (
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Pagamento Parcial</AlertTitle>
                <AlertDescription>
                  O valor pago é inferior ao total da venda. A venda será marcada como "Pagamento Parcial".
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {paymentStatus === 'paid' ? 'Finalizar Venda' : 'Registrar Pagamento Parcial'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
