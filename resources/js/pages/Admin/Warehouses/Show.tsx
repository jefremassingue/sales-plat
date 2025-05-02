import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteAlert } from '@/components/delete-alert';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Building2, Edit, MapPin, Phone, Mail, User, Database, Trash } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Warehouse } from './_components';

interface Props {
  warehouse: Warehouse;
}

export default function Show({ warehouse }: Props) {
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const { toast } = useToast();
  const { flash } = usePage().props as any;

  // Mostrar mensagens flash vindas do backend
  useEffect(() => {
    if (flash?.success) {
      toast({
        title: "Operação bem sucedida",
        description: flash.success,
        variant: "success",
      });
    }

    if (flash?.error) {
      toast({
        title: "Erro",
        description: flash.error,
        variant: "destructive",
      });
    }
  }, [flash, toast]);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Armazéns',
      href: '/admin/warehouses',
    },
    {
      title: warehouse.name,
      href: `/admin/warehouses/${warehouse.id}`,
    },
  ];

  const formatDateTime = (dateTimeString: string) => {
    return format(new Date(dateTimeString), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: pt });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={warehouse.name} />

      <div className="container px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/warehouses">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {warehouse.name}
              </h1>
              {warehouse.code && (
                <p className="text-muted-foreground">Código: {warehouse.code}</p>
              )}
            </div>
            <Badge variant={warehouse.active ? "success" : "secondary"}>
              {warehouse.active ? 'Activo' : 'Inactivo'}
            </Badge>
            {warehouse.is_main && (
              <Badge variant="primary">Armazém Principal</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/warehouses/${warehouse.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteAlertOpen(true)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>

        <div className="grid gap-6 mt-6 md:grid-cols-2">
          {/* Card de Detalhes Gerais do Armazém */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Armazém</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Nome do Armazém</h3>
                <p>{warehouse.name}</p>
              </div>

              {warehouse.code && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Código</h3>
                  <p>{warehouse.code}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Estado</h3>
                <p className="flex items-center gap-2">
                  <Badge variant={warehouse.active ? "success" : "secondary"}>
                    {warehouse.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Tipo</h3>
                <p className="flex items-center gap-2">
                  {warehouse.is_main ? (
                    <Badge variant="primary">Armazém Principal</Badge>
                  ) : (
                    <span>Armazém Secundário</span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Criado em</h3>
                  <p>{formatDateTime(warehouse.created_at)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Última actualização</h3>
                  <p>{formatDateTime(warehouse.updated_at)}</p>
                </div>
              </div>

              {warehouse.description && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Descrição</h3>
                  <p className="whitespace-pre-line">{warehouse.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card de Contacto e Localização */}
          <Card>
            <CardHeader>
              <CardTitle>Contacto & Localização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {warehouse.email && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Email</h3>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${warehouse.email}`} className="text-blue-600 hover:underline">
                      {warehouse.email}
                    </a>
                  </p>
                </div>
              )}

              {warehouse.phone && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Telefone</h3>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${warehouse.phone}`} className="hover:underline">
                      {warehouse.phone}
                    </a>
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Localização</h3>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                  <div>
                    {warehouse.address ? (
                      <>
                        <p>{warehouse.address}</p>
                        <p>
                          {warehouse.city || ''}
                          {warehouse.province ? (warehouse.city ? `, ${warehouse.province}` : warehouse.province) : ''}
                          {warehouse.postal_code ? ` ${warehouse.postal_code}` : ''}
                        </p>
                        <p>{warehouse.country}</p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Sem endereço definido</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card do Gestor do Armazém */}
        {warehouse.manager && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Gestor do Armazém
                </div>
              </CardTitle>
              <CardDescription>
                Utilizador responsável por este armazém
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Nome</h3>
                  <p>{warehouse.manager.name}</p>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Email</h3>
                  <p>
                    <a href={`mailto:${warehouse.manager.email}`} className="text-blue-600 hover:underline">
                      {warehouse.manager.email}
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card de Inventário e Estatísticas (pode ser expandido mais tarde) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Gestão de Stocks
              </div>
            </CardTitle>
            <CardDescription>
              Informações sobre produtos e stocks disponíveis neste armazém
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center py-8">
              A funcionalidade de gestão de stocks será implementada em breve.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de confirmação de exclusão */}
      <DeleteAlert
        isOpen={deleteAlertOpen}
        onClose={() => setDeleteAlertOpen(false)}
        title="Eliminar Armazém"
        description="Tem certeza que deseja eliminar este armazém? Esta acção não pode ser desfeita."
        deleteUrl={`/admin/warehouses/${warehouse.id}`}
      />
    </AppLayout>
  );
}
