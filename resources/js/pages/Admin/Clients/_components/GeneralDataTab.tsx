import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Building, Check, Contact } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ClientFormValues } from "./ClientForm";

interface GeneralDataTabProps {
  form: UseFormReturn<ClientFormValues>;
}

export function GeneralDataTab({ form }: GeneralDataTabProps) {
  const clientType = form.watch("client_type");

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Dados do Cliente</CardTitle>
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-end space-x-2 rounded-md space-y-0">
                <FormLabel className="font-normal">Activo</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipo de cliente */}
        <FormField
          control={form.control}
          name="client_type"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel>Tipo de cliente</FormLabel>
              <div className="flex mt-2 space-x-2">
                <Button
                  type="button"
                  variant={field.value === "individual" ? "default" : "outline"}
                  onClick={() => field.onChange("individual")}
                  className="flex items-center gap-2"
                >
                  <Contact className="h-4 w-4" />
                  Particular
                  {field.value === "individual" && (
                    <Check className="h-4 w-4 ml-2" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant={field.value === "company" ? "default" : "outline"}
                  onClick={() => field.onChange("company")}
                  className="flex items-center gap-2"
                >
                  <Building className="h-4 w-4" />
                  Empresa
                  {field.value === "company" && (
                    <Check className="h-4 w-4 ml-2" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nome e detalhes básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nome {clientType === "individual" ? "completo" : "de contacto"}{" "}
                  *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      clientType === "individual"
                        ? "Nome completo"
                        : "Nome do contacto principal"
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {clientType === "company" && (
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da empresa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome comercial" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
        </div>
      </CardContent>
    </Card>
  );
}
