import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Check } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
import { User, WarehouseFormValues } from "./types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface ManagerTabProps {
  form: UseFormReturn<WarehouseFormValues>;
  users?: User[];
}

export function ManagerTab({ form, users = [] }: ManagerTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const managerId = form.watch("manager_id");

  // Buscar o utilizador inicialmente selecionado
  useEffect(() => {
    if (managerId && users.length > 0) {
      const manager = users.find(user => user.id === managerId);
      if (manager) {
        setSelectedUser(manager);
      }
    }
  }, [managerId, users]);

  // Filtrar utilizadores baseado no termo de pesquisa
  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (term.length < 2) {
      setFilteredUsers(users);
      return;
    }

    setIsSearching(true);
    try {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(term.toLowerCase()) ||
        user.email.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredUsers(filtered);
    } catch (error) {
      console.error('Erro ao filtrar utilizadores:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Função para selecionar um utilizador
  const selectUser = (user: User) => {
    setSelectedUser(user);
    form.setValue('manager_id', user.id);
    setIsDialogOpen(false);
  };

  // Função para remover o gestor selecionado
  const removeManager = () => {
    setSelectedUser(null);
    form.setValue('manager_id', null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestor do Armazém</CardTitle>
        <CardDescription>
          Associe um utilizador como gestor responsável por este armazém.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="manager_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gestor</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input
                    readOnly
                    placeholder="Selecione um gestor para este armazém"
                    value={selectedUser ? `${selectedUser.name} (${selectedUser.email})` : ''}
                  />
                </FormControl>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <Search className="h-4 w-4 mr-2" />
                      Selecionar
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Seleccionar Gestor</DialogTitle>
                      <DialogDescription>
                        Pesquise e selecione o utilizador que será responsável por este armazém.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Procurar por nome ou email"
                          value={searchTerm}
                          onChange={(e) => handleSearch(e.target.value)}
                        />
                      </div>

                      <Command>
                        <CommandList>
                          <CommandEmpty>Nenhum utilizador encontrado.</CommandEmpty>
                          <CommandGroup>
                            {isSearching ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : (
                              filteredUsers.map((user) => (
                                <CommandItem
                                  key={user.id}
                                  onSelect={() => selectUser(user)}
                                  className="cursor-pointer"
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
                              ))
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Fechar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {selectedUser && (
                  <Button type="button" variant="ghost" size="icon" onClick={removeManager}>
                    <span className="sr-only">Remover gestor</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </Button>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedUser && (
          <div className="bg-primary/10 p-4 rounded-md">
            <h4 className="font-medium">Detalhes do Gestor:</h4>
            <p className="text-sm">Nome: {selectedUser.name}</p>
            <p className="text-sm">Email: {selectedUser.email}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
