import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { UseFormReturn } from "react-hook-form";
import { ClientFormValues } from "./ClientForm";

interface ContactsTabProps {
  form: UseFormReturn<ClientFormValues>;
}

export function ContactsTab({ form }: ContactsTabProps) {
  const clientType = form.watch("client_type");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações de Contacto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone fixo</FormLabel>
                <FormControl>
                  <Input placeholder="+258 21 000 000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telemóvel</FormLabel>
                <FormControl>
                  <Input placeholder="+258 84 000 0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="www.exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {clientType === "company" && (
            <FormField
              control={form.control}
              name="contact_person"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pessoa de contacto adicional</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do contacto secundário" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {clientType === "individual" && (
            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de nascimento</FormLabel>
                  <FormControl>
                    <DatePicker date={field.value} onSelect={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
