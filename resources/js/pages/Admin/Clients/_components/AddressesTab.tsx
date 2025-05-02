import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ClientFormValues } from "./ClientForm";

interface AddressesTabProps {
  form: UseFormReturn<ClientFormValues>;
}

export function AddressesTab({ form }: AddressesTabProps) {
  const clientType = form.watch("client_type");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moradas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Morada principal</FormLabel>
                <FormControl>
                  <Input placeholder="Rua, Número, Bairro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Cidade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Província</FormLabel>
                  <FormControl>
                    <Input placeholder="Província" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código postal</FormLabel>
                  <FormControl>
                    <Input placeholder="Código postal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um país" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Moçambique">Moçambique</SelectItem>
                    <SelectItem value="Angola">Angola</SelectItem>
                    <SelectItem value="Portugal">Portugal</SelectItem>
                    <SelectItem value="Brasil">Brasil</SelectItem>
                    <SelectItem value="Cabo Verde">Cabo Verde</SelectItem>
                    <SelectItem value="Guiné-Bissau">Guiné-Bissau</SelectItem>
                    <SelectItem value="São Tomé e Príncipe">São Tomé e Príncipe</SelectItem>
                    <SelectItem value="Timor-Leste">Timor-Leste</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {clientType === "company" && (
            <>
              <FormField
                control={form.control}
                name="billing_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Morada de faturação</FormLabel>
                    <FormControl>
                      <Input placeholder="Se diferente da morada principal" {...field} />
                    </FormControl>
                    <FormDescription>
                      Deixe em branco se for igual à morada principal.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shipping_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Morada de entrega</FormLabel>
                    <FormControl>
                      <Input placeholder="Se diferente da morada principal" {...field} />
                    </FormControl>
                    <FormDescription>
                      Deixe em branco se for igual à morada principal.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
