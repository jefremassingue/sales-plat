import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UseFormReturn } from "react-hook-form";
import { Role, UserFormValues } from "./types";

interface RolesTabProps {
  form: UseFormReturn<UserFormValues>;
  roles: Role[];
}

export function RolesTab({ form, roles }: RolesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Funções do Utilizador</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <FormField
          control={form.control}
          name="roles"
          render={({ field }) => (
            <FormItem>
              <div className="text-sm text-muted-foreground mb-4">
                Selecione as funções que deseja atribuir a este utilizador:
              </div>

              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {roles.map((role) => (
                    <FormField
                      key={role.id}
                      control={form.control}
                      name="roles"
                      render={({ field }) => (
                        <FormItem
                          key={role.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(role.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, role.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== role.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-base">
                              {role.name}
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              {role.guard_name}
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </ScrollArea>

              <FormMessage className="mt-4" />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
