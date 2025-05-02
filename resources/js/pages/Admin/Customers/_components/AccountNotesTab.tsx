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
import { Search, Loader2, Check } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
import { User } from "./types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface FormValues {
  connect_user: boolean;
  user_id: number | null;
  notes: string;
  [key: string]: any;
}

interface AccountNotesTabProps {
  form: UseFormReturn<FormValues>;
  isEditMode: boolean;
}

export function AccountNotesTab({ form, isEditMode }: AccountNotesTabProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const connectUser = form.watch("connect_user");
  const userId = form.watch("user_id");

  // Buscar o utilizador inicial, se existir
  useEffect(() => {
    if (userId && !selectedUser) {
      fetch(`/admin/api/users/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setSelectedUser(data);
          }
        })
        .catch(error => {
          console.error("Erro ao carregar utilizador:", error);
        });
    }
  }, [userId, selectedUser]);

  // Função para buscar utilizadores pelo termo de pesquisa
  const searchUsers = async (term: string) => {
    if (!term || term.length < 2) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/admin/api/users/search?term=${encodeURIComponent(term)}`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao buscar utilizadores:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Função para selecionar um utilizador
  const selectUser = (user: User) => {
    setSelectedUser(user);
    form.setValue('user_id', user.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Associar Conta de Utilizador</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="connect_user"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 rounded-md border p-4">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1">
                <FormLabel className="text-base">Associar conta de utilizador</FormLabel>
                <FormDescription>
                  Permite que este cliente faça login na plataforma.
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {connectUser && (
          <div className="pt-4 pl-4 border-l-2 border-muted">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Utilizador *</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        readOnly
                        placeholder="Selecione um utilizador existente"
                        value={selectedUser ? `${selectedUser.name} (${selectedUser.email})` : ''}
                      />
                    </FormControl>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline">
                          <Search className="h-4 w-4 mr-2" />
                          Procurar
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Procurar Utilizador</DialogTitle>
                          <DialogDescription>
                            Procure e selecione um utilizador existente para associar a este cliente.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Procurar por nome ou email"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button
                              type="button"
                              onClick={() => searchUsers(searchTerm)}
                              disabled={isSearching || searchTerm.length < 2}
                            >
                              {isSearching ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Search className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          <Command>
                            <CommandList>
                              <CommandEmpty>Nenhum utilizador encontrado.</CommandEmpty>
                              <CommandGroup>
                                {users.map((user) => (
                                  <CommandItem
                                    key={user.id}
                                    onSelect={() => selectUser(user)}
                                  >
                                    <div className="flex flex-col">
                                      <span>{user.name}</span>
                                      <span className="text-sm text-muted-foreground">
                                        {user.email}
                                      </span>
                                    </div>
                                    {selectedUser?.id === user.id && (
                                      <Check className="ml-auto h-4 w-4" />
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </div>

                        <DialogFooter>
                          <Button type="button" variant="outline">
                            Fechar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <FormMessage />

                  {field.value === null && connectUser && (
                    <p className="text-sm font-medium text-destructive mt-1">
                      É necessário selecionar um utilizador.
                    </p>
                  )}
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
