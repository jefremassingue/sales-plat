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
import { WarehouseFormValues } from "./types";

interface AdditionalInfoTabProps {
  form: UseFormReturn<WarehouseFormValues>;
}

export function AdditionalInfoTab({ form }: AdditionalInfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Adicionais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Informações adicionais sobre este armazém"
                  className="h-32 resize-none"
                  {...field}
                  value={field.value || ''}
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