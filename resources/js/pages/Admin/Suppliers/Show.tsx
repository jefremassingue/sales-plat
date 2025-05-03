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
import {
  ArrowLeft, Edit, Trash, Building, Mail, Phone, Globe,
  MapPin, Calendar, FileText, User, CreditCard, DollarSign
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
  supplier: Supplier;
}

export default function Show({ supplier }: Props) {
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
      title: 'Fornecedores',
      href: '/admin/suppliers',
    },
    {
      title: supplier.name,
      href: `/admin/suppliers/${supplier.id}`,
    },
  ];

  const formatDateTime = (dateTimeString: string) => {
    return format(new Date(dateTimeString), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: pt });
  };

  // Função para renderizar o HTML das notas
  const renderHtml = (html: string | null) => {
    if (!html) return null;
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // Função para renderizar o tipo de fornecedor
  const getSupplierTypeLabel = (type: 'products' | 'services' | 'both') => {
    switch (type) {
      case 'products': return 'Produtos';
      case 'services': return 'Serviços';
      case 'both': return 'Produtos e Serviços';
      default: return type;
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Fornecedor - ${supplier.name}`} />

      <div className="container px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/suppliers">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Building className="h-5 w-5" />
                {supplier.name}
              </h1>
              {supplier.company_name && (
                <p className="text-muted-foreground">{supplier.company_name}</p>
              )}
            </div>
            <Badge variant={supplier.active ? "success" : "secondary"}>
              {supplier.active ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/suppliers/${supplier.id}/edit`}>
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
          {/* Detalhes do Fornecedor */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Fornecedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Nome</h3>
                <p>{supplier.name}</p>
              </div>

              {supplier.company_name && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Nome Comercial</h3>
                  <p>{supplier.company_name}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Tipo de Fornecedor</h3>
                <p className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {getSupplierTypeLabel(supplier.supplier_type)}
                </p>
              </div>

              {supplier.tax_id && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">NUIT</h3>
                  <p>{supplier.tax_id}</p>
                </div>
              )}

              {supplier.contact_person && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Pessoa de Contacto</h3>
                  <p>{supplier.contact_person}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Data de Registo</h3>
                  <p>{formatDateTime(supplier.created_at)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Última Actualização</h3>
                  <p>{formatDateTime(supplier.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {supplier.email && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </h3>
                  <p>{supplier.email}</p>
                </div>
              )}

              {supplier.phone && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </h3>
                  <p>{supplier.phone}</p>
                </div>
              )}

              {supplier.mobile && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Telemóvel
                  </h3>
                  <p>{supplier.mobile}</p>
                </div>
              )}

              {supplier.website && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    Website
                  </h3>
                  <p>
                    <a
                      href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {supplier.website}
                    </a>
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-4">
                  <MapPin className="h-4 w-4" />
                  Morada Principal
                </h3>
                {supplier.address ? (
                  <div className="mt-1">
                    <p>{supplier.address}</p>
                    <p>{supplier.city}{supplier.province ? `, ${supplier.province}` : ''}</p>
                    <p>{supplier.postal_code ? `${supplier.postal_code}, ` : ''}{supplier.country}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Nenhuma morada registada</p>
                )}
              </div>

              {supplier.billing_address && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-4">
                    <MapPin className="h-4 w-4" />
                    Morada de Faturação
                  </h3>
                  <p className="mt-1">{supplier.billing_address}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 mt-6 md:grid-cols-2">
          {/* Informações de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Informações de Pagamento
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {supplier.payment_terms && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Termos de Pagamento</h3>
                  <p>{supplier.payment_terms}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Moeda</h3>
                <p>{supplier.currency}</p>
              </div>

              {supplier.credit_limit !== null && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Limite de Crédito
                  </h3>
                  <p>{supplier.credit_limit.toLocaleString('pt-PT', {
                    style: 'currency',
                    currency: supplier.currency
                  })}</p>
                </div>
              )}

              <div className="pt-3 border-t">
                <h3 className="font-medium mb-2">Dados Bancários</h3>

                {supplier.bank_name || supplier.bank_account || supplier.bank_branch ? (
                  <div className="space-y-2">
                    {supplier.bank_name && (
                      <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">Banco</h4>
                        <p>{supplier.bank_name}</p>
                      </div>
                    )}

                    {supplier.bank_account && (
                      <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">Conta</h4>
                        <p>{supplier.bank_account}</p>
                      </div>
                    )}

                    {supplier.bank_branch && (
                      <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">Agência</h4>
                        <p>{supplier.bank_branch}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Nenhuma informação bancária registada</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notas */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notas
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {supplier.notes ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {renderHtml(supplier.notes)}
                </div>
              ) : (
                <p className="text-muted-foreground italic">Nenhuma nota adicionada</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Utilizador associado */}
        {supplier.user && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Acesso ao Sistema
                </span>
              </CardTitle>
              <CardDescription>
                Este fornecedor tem acesso ao sistema através de uma conta de utilizador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Nome do Utilizador</h3>
                  <p>{supplier.user.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Email do Utilizador</h3>
                  <p>{supplier.user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Alerta de confirmação de exclusão */}
      <DeleteAlert
        isOpen={deleteAlertOpen}
        onClose={() => setDeleteAlertOpen(false)}
        title="Eliminar Fornecedor"
        description="Tem certeza que deseja eliminar este fornecedor? Esta acção não pode ser desfeita."
        deleteUrl={`/admin/suppliers/${supplier.id}`}
      />
    </AppLayout>
  );
}
