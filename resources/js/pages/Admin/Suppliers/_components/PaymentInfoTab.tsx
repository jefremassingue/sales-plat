import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SupplierFormValues } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentInfoTabProps {
  form: UseFormReturn<SupplierFormValues>;
}

export function PaymentInfoTab({ form }: PaymentInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Moeda e Limite de Crédito */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moeda preferencial</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a moeda" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MZN">Metical (MZN)</SelectItem>
                  <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  <SelectItem value="ZAR">Rand Sul-Africano (ZAR)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="credit_limit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limite de crédito</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0.00"
                  {...field}
                  value={field.value === null ? '' : field.value}
                  onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                />
              </FormControl>
              <FormDescription>
                Montante máximo de crédito concedido a este fornecedor
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Termos de pagamento */}
      <FormField
        control={form.control}
        name="payment_terms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Termos de Pagamento</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || ""}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione os termos de pagamento" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="immediate">Imediato</SelectItem>
                <SelectItem value="7days">7 dias</SelectItem>
                <SelectItem value="15days">15 dias</SelectItem>
                <SelectItem value="30days">30 dias</SelectItem>
                <SelectItem value="45days">45 dias</SelectItem>
                <SelectItem value="60days">60 dias</SelectItem>
                <SelectItem value="90days">90 dias</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Prazo típico para pagamento das faturas deste fornecedor
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Informações bancárias */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-medium mb-4">Informações Bancárias</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bank_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banco</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do banco" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bank_branch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agência</FormLabel>
                <FormControl>
                  <Input placeholder="Agência ou balcão" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bank_account"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conta Bancária</FormLabel>
                <FormControl>
                  <Input placeholder="Número da conta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
