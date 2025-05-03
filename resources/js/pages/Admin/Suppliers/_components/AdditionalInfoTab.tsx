import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { SupplierFormValues } from "./types";
import { EditorComponent } from "@/components/editor-component";

interface AdditionalInfoTabProps {
  form: UseFormReturn<SupplierFormValues>;
}

export function AdditionalInfoTab({ form }: AdditionalInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Campo de notas usando o editor rich text */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>Notas</FormLabel>
            <FormControl>
              <EditorComponent
                value={field.value || ""}
                onChange={field.onChange}
                placeholder="Introduza observações importantes sobre este fornecedor..."
                height={300}
              />
            </FormControl>
            <FormDescription>
              Utilize este campo para registar informações detalhadas sobre o fornecedor,
              histórico de relacionamento, especificidades dos produtos ou serviços oferecidos, etc.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
