import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Control, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

// Interface do Cliente com todos os campos de endereço
interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string; // Endereço geral
  billing_address?: string; // Endereço de cobrança
  shipping_address?: string; // Endereço de entrega
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface SaleStatus {
  value: string;
  label: string;
}

// Props do componente permanecem inalteradas
interface SaleDetailsProps {
  control: Control<any>;
  customers: Customer[];
  currencies: Currency[];
  statuses: SaleStatus[];
}

export default function SaleDetails({
  control,
  customers,
  currencies,
  statuses
}: SaleDetailsProps) {
  const today = new Date();
  
  // Acessa as funções do formulário diretamente do contexto, sem precisar de props
  const { setValue, getValues } = useFormContext();

  /**
   * Lida com a seleção de um novo cliente, preenchendo os
   * endereços se os campos estiverem vazios.
   */
  const handleCustomerChange = (customerId: string) => {
    // Atualiza o valor do campo do ID do cliente no formulário
    setValue('customer_id', customerId, { shouldValidate: true });

    // Encontra o objeto completo do cliente selecionado
    const selectedCustomer = customers.find(c => c.id.toString() === customerId);

    if (selectedCustomer) {
      // Pega os valores atuais dos campos de endereço do formulário
      const currentShippingAddress = getValues('shipping_address');
      const currentBillingAddress = getValues('billing_address');

      // Define o endereço a ser usado, com fallback para o endereço geral do cliente
      const shippingAddressToSet = selectedCustomer.shipping_address || selectedCustomer.address || '';
      const billingAddressToSet = selectedCustomer.billing_address || selectedCustomer.address || '';

      // Atualiza o campo SOMENTE SE ele estiver vazio para não sobrescrever dados já digitados
      if (!currentShippingAddress && shippingAddressToSet) {
        setValue('shipping_address', shippingAddressToSet);
      }
      if (!currentBillingAddress && billingAddressToSet) {
        setValue('billing_address', billingAddressToSet);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

      {/* --- COLUNA ESQUERDA: CLIENTE, DATAS E ENDEREÇOS --- */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cliente e Datas</CardTitle>
            <CardDescription>
              Informações do cliente e datas da venda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name="sale_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número da Venda</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select
                    onValueChange={handleCustomerChange} // Usa a função para preencher os endereços
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers?.map(customer => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="issue_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Emissão <span className="text-destructive">*</span></FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        {/* ✅ CORREÇÃO: <Button> é o filho direto do Trigger */}
                        <Button
                          variant="outline"
                          className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          type="button"
                        >
                          {field.value ? format(field.value, "dd/MM/yyyy", { locale: pt }) : <span>Selecione</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
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
                control={control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Vencimento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                         {/* ✅ CORREÇÃO: <Button> é o filho direto do Trigger */}
                        <Button
                          variant="outline"
                          className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          type="button"
                        >
                          {field.value ? format(field.value, "dd/MM/yyyy", { locale: pt }) : <span>Selecione</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < today} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card de Endereços Adicionado */}
        <Card>
          <CardHeader>
            <CardTitle>Endereços</CardTitle>
            <CardDescription>Endereços de entrega e de cobrança da venda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name="shipping_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço de Entrega</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Será preenchido automaticamente ao selecionar um cliente, se estiver vazio."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="billing_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço de Cobrança</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Será preenchido automaticamente ao selecionar um cliente, se estiver vazio."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* --- COLUNA DIREITA: INFORMAÇÕES ADICIONAIS --- */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações da Venda</CardTitle>
            <CardDescription>Moeda, envio, impostos e estado da transação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name="currency_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moeda <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={true}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma moeda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies?.map(currency => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.name} ({currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="shipping_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor de Envio</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses?.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="include_tax"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Incluir Imposto</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Notas Adicionais</CardTitle>
            </CardHeader>
            <CardContent>
                <FormField
                    control={control}
                    name="notes"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                        <Textarea
                            placeholder="Notas internas ou observações para o cliente..."
                            className="min-h-[120px]"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </CardContent>
        </Card>
      </div>

    </div>
  );
}