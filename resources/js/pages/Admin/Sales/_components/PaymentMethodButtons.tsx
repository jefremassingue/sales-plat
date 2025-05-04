import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentMethod {
  value: string;
  label: string;
}

interface PaymentMethodButtonsProps {
  paymentMethods: PaymentMethod[];
  selectedMethod: string | null;
  onSelect: (method: string) => void;
}

export default function PaymentMethodButtons({
  paymentMethods,
  selectedMethod,
  onSelect
}: PaymentMethodButtonsProps) {
  // Limitar a 4 métodos na exibição rápida
  const displayMethods = paymentMethods.slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {displayMethods.map(method => (
            <Button
              key={method.value}
              variant={selectedMethod === method.value ? "default" : "outline"}
              className="justify-start"
              type="button"
              onClick={() => onSelect(method.value)}
            >
              {method.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
