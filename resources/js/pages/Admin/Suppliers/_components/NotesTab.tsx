import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { SupplierFormValues } from "./types";

interface NotesTabProps {
  form: UseFormReturn<SupplierFormValues>;
}

export function NotesTab({ form }: NotesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notas e Informações Adicionais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="products_services"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produtos/Serviços</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição dos produtos ou serviços fornecidos por este fornecedor"
                  className="resize-y"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações importantes sobre este fornecedor"
                  className="resize-y"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
