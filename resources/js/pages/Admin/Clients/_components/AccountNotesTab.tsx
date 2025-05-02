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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UseFormReturn } from "react-hook-form";
import { ClientFormValues } from "./ClientForm";

interface AccountNotesTabProps {
  form: UseFormReturn<ClientFormValues>;
  isEditMode: boolean;
}

export function AccountNotesTab({ form, isEditMode }: AccountNotesTabProps) {
  const createUser = form.watch("create_user");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conta de Utilizador</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="create_user"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 rounded-md border p-4">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1">
                <FormLabel className="text-base">Criar conta de utilizador</FormLabel>
                <FormDescription>
                  Permite que este cliente faça login na plataforma.
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {createUser && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 pl-4 border-l-2 border-muted">
            <FormField
              control={form.control}
              name="user_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de utilizador *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email para login" {...field} />
                  </FormControl>
                  <FormDescription>
                    {form.getValues("email") && !field.value && (
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto font-normal"
                        onClick={() =>
                          form.setValue("user_email", form.getValues("email") || "")
                        }
                      >
                        Usar o email do cliente
                      </Button>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha {!isEditMode && "*"}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        isEditMode
                          ? "Deixe em branco para não alterar"
                          : "Senha para o utilizador"
                      }
                      {...field}
                    />
                  </FormControl>
                  {isEditMode && (
                    <FormDescription>
                      Preencha apenas se quiser alterar a senha actual.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <Separator />

        {/* Notas */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações ou informações adicionais sobre o cliente"
                  className="h-24"
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
