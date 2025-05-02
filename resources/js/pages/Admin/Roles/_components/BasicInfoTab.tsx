import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { RoleFormValues } from "./types";

interface BasicInfoTabProps {
  form: UseFormReturn<RoleFormValues>;
}

export function BasicInfoTab({ form }: BasicInfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes da Função</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da função *</FormLabel>
              <FormControl>
                <Input placeholder="Nome da função" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
