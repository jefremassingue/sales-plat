import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Receipt, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface SummaryProps {
  totals: {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    shippingAmount: number;
    total: number;
  };
  itemCount: number;
  status: string;
  isSubmitting: boolean;
  formatCurrency: (value: number) => string;
  paymentMethods: {value: string; label: string}[];
  onPaymentMethodChange: (method: string) => void;
  onPaymentAmountChange: (amount: string) => void;
  paymentMethod: string;
  paymentAmount: string;
  onReset?: () => void; // Opcional para o botão reset
}

export default function SaleSummary({
  totals,
  itemCount,
  status,
  isSubmitting,
  formatCurrency,
  paymentMethods,
  onPaymentMethodChange,
  onPaymentAmountChange,
  paymentMethod,
  paymentAmount,
  onReset
}: SummaryProps) {
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'pending'>('pending');

  // Calcular troco ou valor em falta quando o valor pago muda
  useEffect(() => {
    const amountValue = parseFloat(paymentAmount) || 0;
    const difference = amountValue - totals.total;
    setChangeAmount(difference);

    if (totals.total > 0 && amountValue >= totals.total) {
      setPaymentStatus('paid');
    } else if (amountValue > 0) {
      setPaymentStatus('partial');
    } else {
      setPaymentStatus('pending');
    }
  }, [paymentAmount, totals.total]);

  return (
    <Card className='sticky top-14'>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Resumo da Venda</span>
          <Badge variant="outline">{itemCount} itens</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Desconto:</span>
              <span>-{formatCurrency(totals.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">IVA:</span>
            <span>{formatCurrency(totals.taxAmount)}</span>
          </div>
          {totals.shippingAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Envio:</span>
              <span>{formatCurrency(totals.shippingAmount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between pt-2">
            <span className="font-medium">Total:</span>
            <span className="font-bold text-lg">{formatCurrency(totals.total)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Método de Pagamento</label>
            <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um método de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map(method => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Valor Pago</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={paymentAmount}
              onChange={(e) => onPaymentAmountChange(e.target.value)}
              className={parseFloat(paymentAmount) >= totals.total ? "border-green-500" : ""}
            />
          </div>

          {parseFloat(paymentAmount) > 0 && (
            <div className={`flex justify-between py-2 font-medium ${changeAmount >= 0 ? 'text-green-600' : 'text-amber-600'}`}>
              <span>{changeAmount >= 0 ? 'Troco:' : 'Em falta:'}</span>
              <span>{formatCurrency(Math.abs(changeAmount))}</span>
            </div>
          )}

          {parseFloat(paymentAmount) > 0 && (
            <div className="flex justify-center">
              <Badge variant={
                paymentStatus === 'paid' ? 'success' :
                paymentStatus === 'partial' ? 'warning' : 'default'
              }>
                {paymentStatus === 'paid' ? 'Pagamento Completo' :
                 paymentStatus === 'partial' ? 'Pagamento Parcial' : 'Pendente'}
              </Badge>
            </div>
          )}
        </div>

        <div className="pt-4">
          {onReset && (
            <Button
              type="button"
              variant="outline"
              className="w-full mb-2"
              onClick={onReset}
            >
              Reset Formulário
            </Button>
          )}
          <Button
            className="w-full"
            size="lg"
            disabled={isSubmitting || itemCount === 0}
            type="submit" // << CORREÇÃO: Tipo 'submit' para acionar o form
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A processar...
              </>
            ) : (
              <>
                <Receipt className="mr-2 h-5 w-5" />
                Finalizar Venda
              </>
            )}
          </Button>
        </div>

        {itemCount === 0 && (
          <div className="text-center text-muted-foreground text-sm">
            Adicione produtos ao carrinho para finalizar a venda
          </div>
        )}
      </CardContent>
    </Card>
  );
}