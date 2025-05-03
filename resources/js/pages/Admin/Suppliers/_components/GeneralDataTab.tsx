import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { SupplierFormValues, User } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GeneralDataTabProps {
  form: UseFormReturn<SupplierFormValues>;
  users?: User[];
}

export function GeneralDataTab({ form, users = [] }: GeneralDataTabProps) {
  return (
    <div className="space-y-6">
      {/* Cabeçalho com o switch de estado */}
      <div className="flex justify-end items-center border-b pb-3">
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <div className="flex items-center space-x-1">
                <span className={`text-sm ${!field.value ? "font-medium" : "text-muted-foreground"}`}>Inactivo</span>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <span className={`text-sm ${field.value ? "font-medium" : "text-muted-foreground"}`}>Activo</span>
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* Nome e detalhes básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da empresa *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome oficial da empresa fornecedora"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome comercial</FormLabel>
              <FormControl>
                <Input placeholder="Nome pelo qual a empresa é conhecida" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tax_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NUIT</FormLabel>
              <FormControl>
                <Input placeholder="Número de identificação fiscal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Campo tipo de fornecedor */}
      <FormField
        control={form.control}
        name="supplier_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de fornecedor</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de fornecedor" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="products">Produtos</SelectItem>
                <SelectItem value="services">Serviços</SelectItem>
                <SelectItem value="both">Ambos</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              O tipo de fornecimento que este fornecedor providencia
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
