import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteAlert } from '@/components/delete-alert';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, Edit, MoreHorizontal, Plus, Star, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import LucideIcon from '@/components/lucide-icon';

interface PaymentMethod {
  id: number;
  code: string;
  name: string;
  description: string | null;
  instructions: string | null;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  icon: string | null;
}

interface Props {
  paymentMethods: PaymentMethod[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Definições',
    href: '/admin/settings',
  },
  {
    title: 'Métodos de Pagamento',
    href: '/admin/settings/payment-methods',
  },
];

export default function Index({ paymentMethods }: Props) {
  const [methodToDelete, setMethodToDelete] = useState<number | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const { toast } = useToast();
  const { flash } = usePage().props as any;

  // Mostrar mensagens de sucesso/erro
  useEffect(() => {
    if (flash?.success) {
      toast({
        title: 'Sucesso',
        description: flash.success,
        variant: 'success',
      });
    }
    if (flash?.error) {
      toast({
        title: 'Erro',
        description: flash.error,
        variant: 'destructive',
      });
    }
  }, [flash, toast]);

  // Ordenar métodos para mostrar os ativos primeiro, depois por ordem
  const sortedMethods = [...paymentMethods].sort((a, b) => {
    // Primeiro ordenar por ativo/inativo
    if (a.is_active && !b.is_active) return -1;
    if (!a.is_active && b.is_active) return 1;

    // Depois por ordem de classificação
    return a.sort_order - b.sort_order;
  });

  const handleDelete = (id: number) => {
    setMethodToDelete(id);
    setDeleteAlertOpen(true);
  };

  const toggleActive = (method: PaymentMethod) => {
    router.post(`/admin/settings/payment-methods/${method.id}/status`, {
      is_active: !method.is_active
    });
  };

  const setAsDefault = (method: PaymentMethod) => {
    if (!method.is_default) {
      router.post(`/admin/settings/payment-methods/${method.id}/set-default`);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Métodos de Pagamento" />

      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Métodos de Pagamento</h1>
          <Button asChild>
            <Link href="/admin/settings/payment-methods/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo Método
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pagamento Disponíveis</CardTitle>
            <CardDescription>
              Gerencie os métodos de pagamento disponíveis para o sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedMethods.map((method) => (
                <Card key={method.id} className={`overflow-hidden ${!method.is_active ? 'opacity-60' : ''}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <LucideIcon name={method.icon || "credit-card"} className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{method.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/settings/payment-methods/${method.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </Link>
                        </DropdownMenuItem>
                        {!method.is_default && (
                          <DropdownMenuItem onClick={() => setAsDefault(method)}>
                            <Star className="mr-2 h-4 w-4" />
                            <span>Definir como Padrão</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(method.id)} className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="text-sm text-muted-foreground mb-2">
                      {method.description || "Sem descrição"}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        {method.is_default && (
                          <Badge variant="secondary" className="flex items-center">
                            <Star className="h-3 w-3 mr-1" /> Padrão
                          </Badge>
                        )}
                        <Badge variant={method.is_active ? "outline" : "secondary"}>
                          {method.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <Switch
                        checked={method.is_active}
                        onCheckedChange={() => toggleActive(method)}
                        disabled={method.is_default && method.is_active}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {paymentMethods.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Nenhum método de pagamento encontrado.</p>
                <Button asChild>
                  <Link href="/admin/settings/payment-methods/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Método
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <DeleteAlert
          isOpen={deleteAlertOpen}
          onClose={() => setDeleteAlertOpen(false)}
          title="Eliminar Método de Pagamento"
          description="Tem certeza que deseja eliminar este método de pagamento? Esta ação não pode ser desfeita."
          deleteUrl={`/admin/settings/payment-methods/${methodToDelete}`}
        />
      </div>
    </AppLayout>
  );
}
