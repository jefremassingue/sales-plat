import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Loader2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { Permission, RoleFormValues } from './types';

interface RoleFormProps {
  form: UseFormReturn<RoleFormValues>;
  permissions: Permission[];
  isSubmitting: boolean;
  isEditMode: boolean;
}

export function RoleForm({ form, permissions, isSubmitting, isEditMode }: RoleFormProps) {
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

  // Verificar se algumas permissões de um grupo estão selecionadas (para indeterminate state)
  const isSomeInGroupSelected = (group: string) => {
    const permissionIds = form.getValues('permissions');
    return groupedPermissions[group].some(p => permissionIds.includes(p.id)) &&
           !groupedPermissions[group].every(p => permissionIds.includes(p.id));
  };

  return (
    <form onSubmit={form.handleSubmit(e => e)} className="space-y-8">
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

      <div className="sticky bottom-0 p-4 border-t shadow-lg flex justify-end items-center mt-8 bg-background">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? 'A guardar...' : 'A criar...'}
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              {isEditMode ? 'Guardar Alterações' : 'Criar Função'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
