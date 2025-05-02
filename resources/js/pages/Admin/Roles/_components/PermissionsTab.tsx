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
import { Permission, RoleFormValues } from "./types";

interface PermissionsTabProps {
  form: UseFormReturn<RoleFormValues>;
  permissions: Permission[];
}

export function PermissionsTab({ form, permissions }: PermissionsTabProps) {
  // Organizar as permissões por prefixo (agrupamento)
  const groupedPermissions = permissions.reduce((acc, permission) => {
    // Extrair o prefixo da permissão (por exemplo, "users." de "users.create")
    const prefix = permission.name.split('.')[0];

    if (!acc[prefix]) {
      acc[prefix] = [];
    }

    acc[prefix].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleSelectGroupPermissions = (group: string, checked: boolean) => {
    const permissionIds = form.getValues('permissions');
    const groupPermissionIds = groupedPermissions[group].map(p => p.id);

    if (checked) {
      // Adicionar todas as permissões do grupo que ainda não estão selecionadas
      const newPermissionIds = [
        ...permissionIds,
        ...groupPermissionIds.filter(id => !permissionIds.includes(id))
      ];
      form.setValue('permissions', newPermissionIds);
    } else {
      // Remover todas as permissões do grupo
      const newPermissionIds = permissionIds.filter(id =>
        !groupPermissionIds.includes(id)
      );
      form.setValue('permissions', newPermissionIds);
    }
  };

  // Verificar se todas as permissões de um grupo estão selecionadas
  const isGroupSelected = (group: string) => {
    const permissionIds = form.getValues('permissions');
    return groupedPermissions[group].every(p => permissionIds.includes(p.id));
  };

  // Verificar se algumas permissões de um grupo estão selecionadas (para estado indeterminado)
  const isSomeInGroupSelected = (group: string) => {
    const permissionIds = form.getValues('permissions');
    return groupedPermissions[group].some(p => permissionIds.includes(p.id)) &&
           !groupedPermissions[group].every(p => permissionIds.includes(p.id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissões</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <FormField
          control={form.control}
          name="permissions"
          render={({ field }) => (
            <FormItem>
              <div className="text-sm text-muted-foreground mb-4">
                Selecione as permissões que deseja atribuir a esta função:
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([group, permissions]) => (
                    <div key={group} className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={isGroupSelected(group)}
                          indeterminate={isSomeInGroupSelected(group)}
                          onCheckedChange={(checked) => {
                            handleSelectGroupPermissions(group, !!checked);
                          }}
                          id={`group-${group}`}
                        />
                        <label
                          htmlFor={`group-${group}`}
                          className="font-medium text-sm cursor-pointer capitalize"
                        >
                          {group}
                        </label>
                      </div>

                      <div className="ml-6 space-y-1 border-l pl-4">
                        {permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <FormField
                              control={form.control}
                              name="permissions"
                              render={({ field }) => (
                                <FormItem
                                  key={permission.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(permission.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, permission.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== permission.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {permission.name.split('.').slice(1).join('.')}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
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
