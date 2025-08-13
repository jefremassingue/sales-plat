import { Badge } from '@/components/ui/badge';
import { can } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteAlert } from '@/components/delete-alert';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';

import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash, Contact, Building, Mail, Phone, Globe, MapPin, Calendar, FileText, User } from 'lucide-react';
import { useState, useEffect } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Customer {
    id: number;
    name: string;
    company_name: string | null;
    tax_id: string | null;
    email: string | null;
    phone: string | null;
    mobile: string | null;
    address: string | null;
    city: string | null;
    province: string | null;
    country: string;
    postal_code: string | null;
    notes: string | null;
    active: boolean;
    birth_date: string | null;
    contact_person: string | null;
    billing_address: string | null;
    shipping_address: string | null;
    website: string | null;
    client_type: 'individual' | 'company';
    user_id: number | null;
    user?: User;
    created_at: string;
    updated_at: string;
}

interface Props {
    customer: Customer;
}

export default function Show({ customer }: Props) {
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

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Clientes',
            href: '/admin/customers',
        },
        {
            title: customer.name,
            href: `/admin/customers/${customer.id}`,
        },
    ];

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: pt });
    };

    const formatDateTime = (dateTimeString: string) => {
        return format(new Date(dateTimeString), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: pt });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={customer.name} />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/admin/customers">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                {customer.client_type === 'company' ? (
                                    <Building className="h-5 w-5" />
                                ) : (
                                    <Contact className="h-5 w-5" />
                                )}
                                {customer.name}
                            </h1>
                            {customer.company_name && (
                                <p className="text-muted-foreground">{customer.company_name}</p>
                            )}
                        </div>
                        <Badge variant={customer.active ? "default" : "secondary"}>
                            {customer.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        {can('admin-customer.edit') && (
                            <Button variant="outline" asChild>
                                <Link href={`/admin/customers/${customer.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                </Link>
                            </Button>
                        )}
                        {can('admin-customer.destroy') && (
                            <Button
                                variant="destructive"
                                onClick={() => setDeleteAlertOpen(true)}
                            >
                                <Trash className="h-4 w-4 mr-2" />
                                Eliminar
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 mt-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalhes do Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Nome</h3>
                                <p>{customer.name}</p>
                            </div>

                            <div>
                                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Tipo de Cliente</h3>
                                <p className="flex items-center gap-2">
                                    {customer.client_type === 'company' ? (
                                        <>
                                            <Building className="h-4 w-4" />
                                            Empresa
                                        </>
                                    ) : (
                                        <>
                                            <Contact className="h-4 w-4" />
                                            Particular
                                        </>
                                    )}
                                </p>
                            </div>

                            {customer.company_name && (
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Nome da Empresa</h3>
                                    <p>{customer.company_name}</p>
                                </div>
                            )}

                            {customer.tax_id && (
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">NUIT</h3>
                                    <p>{customer.tax_id}</p>
                                </div>
                            )}

                            {customer.birth_date && (
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            Data de Nascimento
                                        </span>
                                    </h3>
                                    <p>{formatDate(customer.birth_date)}</p>
                                </div>
                            )}

                            {customer.contact_person && (
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Pessoa de Contacto</h3>
                                    <p>{customer.contact_person}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Data de Registo</h3>
                                    <p>{formatDateTime(customer.created_at)}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Última Actualização</h3>
                                    <p>{formatDateTime(customer.updated_at)}</p>
                                </div>
                            </div>

                            {customer.notes && (
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <FileText className="h-4 w-4" />
                                        Notas
                                    </h3>
                                    <p className="whitespace-pre-line">{customer.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {customer.email && (
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </h3>
                                    <p>{customer.email}</p>
                                </div>
                            )}

                            {customer.phone && (
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        Telefone
                                    </h3>
                                    <p>{customer.phone}</p>
                                </div>
                            )}

                            {customer.mobile && (
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        Telemóvel
                                    </h3>
                                    <p>{customer.mobile}</p>
                                </div>
                            )}

                            {customer.website && (
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Globe className="h-4 w-4" />
                                        Website
                                    </h3>
                                    <p>
                                        <a
                                            href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            {customer.website}
                                        </a>
                                    </p>
                                </div>
                            )}

                            <div>
                                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-4">
                                    <MapPin className="h-4 w-4" />
                                    Morada Principal
                                </h3>
                                {customer.address ? (
                                    <div className="mt-1">
                                        <p>{customer.address}</p>
                                        <p>{customer.city}{customer.province ? `, ${customer.province}` : ''}</p>
                                        <p>{customer.postal_code ? `${customer.postal_code}, ` : ''}{customer.country}</p>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic">Nenhuma morada registada</p>
                                )}
                            </div>

                            {customer.billing_address && (
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-4">
                                        <MapPin className="h-4 w-4" />
                                        Morada de Faturação
                                    </h3>
                                    <p className="mt-1">{customer.billing_address}</p>
                                </div>
                            )}

                            {customer.shipping_address && (
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-4">
                                        <MapPin className="h-4 w-4" />
                                        Morada de Entrega
                                    </h3>
                                    <p className="mt-1">{customer.shipping_address}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {customer.user && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>
                                <span className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Acesso ao Sistema
                                </span>
                            </CardTitle>
                            <CardDescription>
                                Este cliente tem acesso ao sistema através de uma conta de utilizador
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Nome do Utilizador</h3>
                                    <p>{customer.user.name}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Email do Utilizador</h3>
                                    <p>{customer.user.email}</p>
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
                title="Eliminar Cliente"
                description="Tem certeza que deseja eliminar este cliente? Esta acção não pode ser desfeita."
                deleteUrl={`/admin/customers/${customer.id}`}
            />
        </AppLayout>
    );
}
