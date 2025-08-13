import { Badge } from '@/components/ui/badge';
import { can } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteAlert } from '@/components/delete-alert';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash, Contact, Building, Mail, Phone, Globe, MapPin, Calendar, FileText, User, ShoppingCart, DollarSign, Eye, Download } from 'lucide-react';
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

interface Stats {
    salesCount: number;
    salesTotal: number;
    quotationsCount: number;
    quotationsTotal: number;
}

interface Sale {
    id: string;
    sale_number: string;
    issue_date: string;
    total: number;
    status: string;
    currency_code: string;
}

interface Quotation {
    id: string;
    quotation_number: string;
    issue_date: string;
    expiry_date: string | null;
    total: number;
    status: string;
    currency_code: string;
}

interface Props {
    customer: Customer;
    stats: Stats;
    recentSales: Sale[];
    recentQuotations: Quotation[];
}

export default function Show({ customer, stats, recentSales, recentQuotations }: Props) {
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const { toast } = useToast();
    const { flash } = usePage().props;

    const formatCurrency = (amount: number, currency = 'MZN') => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: currency,
        }).format(amount)
    }

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

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.salesCount}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(stats.salesTotal)}
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Cotações</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.quotationsCount}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(stats.quotationsTotal)}
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(stats.salesTotal + stats.quotationsTotal)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Vendas + Cotações
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 mt-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalhes do Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <User className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Nome</p>
                                            <p className="font-medium">{customer.name}</p>
                                        </div>
                                    </div>

                                    {customer.company_name && (
                                        <div className="flex items-center space-x-3">
                                            <Building className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Empresa</p>
                                                <p className="font-medium">{customer.company_name}</p>
                                            </div>
                                        </div>
                                    )}

                                    {customer.tax_id && (
                                        <div className="flex items-center space-x-3">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">CNPJ/CPF</p>
                                                <p className="font-medium">{customer.tax_id}</p>
                                            </div>
                                        </div>
                                    )}

                                    {customer.contact_person && (
                                        <div className="flex items-center space-x-3">
                                            <Contact className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Pessoa de Contacto</p>
                                                <p className="font-medium">{customer.contact_person}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-5 h-5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Tipo de Cliente</p>
                                            <Badge variant="outline">
                                                {customer.client_type === 'company' ? 'Empresa' : 'Pessoa Física'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="w-5 h-5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Estado</p>
                                            <Badge variant={customer.active ? "default" : "secondary"}>
                                                {customer.active ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Data de Registo</p>
                                            <p className="font-medium">{formatDateTime(customer.created_at)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Última Actualização</p>
                                            <p className="font-medium">{formatDateTime(customer.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Informações de Contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    {customer.email && (
                                        <div className="flex items-center space-x-3">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Email</p>
                                                <p className="font-medium">{customer.email}</p>
                                            </div>
                                        </div>
                                    )}

                                    {customer.phone && (
                                        <div className="flex items-center space-x-3">
                                            <Phone className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Telefone</p>
                                                <p className="font-medium">{customer.phone}</p>
                                            </div>
                                        </div>
                                    )}

                                    {customer.mobile && (
                                        <div className="flex items-center space-x-3">
                                            <Phone className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Telemóvel</p>
                                                <p className="font-medium">{customer.mobile}</p>
                                            </div>
                                        </div>
                                    )}

                                    {customer.website && (
                                        <div className="flex items-center space-x-3">
                                            <Globe className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Website</p>
                                                <a
                                                    href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    {customer.website}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {(customer.address || customer.billing_address) && (
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-sm text-gray-600">Endereço de Cobrança</p>
                                                <p className="font-medium">{customer.billing_address || customer.address}</p>
                                                {customer.city && (
                                                    <p className="text-sm text-gray-600">{customer.city}, {customer.province}</p>
                                                )}
                                                {customer.postal_code && (
                                                    <p className="text-sm text-gray-600">CEP: {customer.postal_code}</p>
                                                )}
                                                {customer.country && (
                                                    <p className="text-sm text-gray-600">{customer.country}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {customer.shipping_address && customer.shipping_address !== customer.billing_address && customer.shipping_address !== customer.address && (
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-sm text-gray-600">Endereço de Entrega</p>
                                                <p className="font-medium">{customer.shipping_address}</p>
                                            </div>
                                        </div>
                                    )}

                                    {customer.birth_date && (
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Data de Nascimento</p>
                                                <p className="font-medium">{formatDate(customer.birth_date)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {customer.notes && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-gray-600 mb-2">Observações</p>
                                    <p className="text-gray-800 whitespace-pre-line">{customer.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Sales */}
                <Card className="mt-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Vendas Recentes</CardTitle>
                            <CardDescription>Últimas vendas registadas</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <a 
                                    href={`/admin/customers/${customer.id}/sales-extract?start_date=${new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]}&end_date=${new Date().toISOString().split('T')[0]}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Extrato Anual
                                </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <a 
                                    href={`/admin/customers/${customer.id}/sales-extract`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Extrato Completo
                                </a>
                            </Button>
                            {can('admin-sale.index') && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/sales?customer_id=${customer.id}`}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        Ver Todas
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentSales.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Número</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentSales.map((sale) => (
                                        <TableRow key={sale.id}>
                                            <TableCell className="font-medium">{sale.sale_number}</TableCell>
                                            <TableCell>{format(new Date(sale.issue_date), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell>{formatCurrency(sale.total, sale.currency_code)}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    sale.status === 'paid' ? 'default' :
                                                    sale.status === 'partial' ? 'secondary' :
                                                    sale.status === 'pending' ? 'destructive' : 'outline'
                                                }>
                                                    {sale.status === 'paid' ? 'Pago' :
                                                     sale.status === 'partial' ? 'Parcial' :
                                                     sale.status === 'pending' ? 'Pendente' : 
                                                     sale.status === 'draft' ? 'Rascunho' : 'Cancelado'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {can('admin-sale.show') && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/admin/sales/${sale.id}`}>
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-center text-muted-foreground py-4">
                                Nenhuma venda registada ainda.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Quotations */}
                <Card className="mt-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Cotações Recentes</CardTitle>
                            <CardDescription>Últimas cotações criadas</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <a 
                                    href={`/admin/customers/${customer.id}/quotations-extract?start_date=${new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]}&end_date=${new Date().toISOString().split('T')[0]}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Extrato Anual
                                </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <a 
                                    href={`/admin/customers/${customer.id}/quotations-extract`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Extrato Completo
                                </a>
                            </Button>
                            {can('admin-quotation.index') && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/quotations?customer_id=${customer.id}`}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        Ver Todas
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentQuotations.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Número</TableHead>
                                        <TableHead>Data Emissão</TableHead>
                                        <TableHead>Data Validade</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentQuotations.map((quotation) => (
                                        <TableRow key={quotation.id}>
                                            <TableCell className="font-medium">{quotation.quotation_number}</TableCell>
                                            <TableCell>{format(new Date(quotation.issue_date), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell>
                                                {quotation.expiry_date ? format(new Date(quotation.expiry_date), 'dd/MM/yyyy') : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {quotation.status === 'draft' || quotation.status === 'pending' ? 
                                                    'Confidencial' : 
                                                    formatCurrency(quotation.total, quotation.currency_code)
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    quotation.status === 'approved' ? 'default' :
                                                    quotation.status === 'pending' ? 'secondary' :
                                                    quotation.status === 'draft' ? 'outline' :
                                                    quotation.status === 'expired' ? 'destructive' : 'secondary'
                                                }>
                                                    {quotation.status === 'approved' ? 'Aprovada' :
                                                     quotation.status === 'pending' ? 'Pendente' :
                                                     quotation.status === 'draft' ? 'Rascunho' :
                                                     quotation.status === 'expired' ? 'Expirada' : 'Convertida'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {can('admin-quotation.show') && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/admin/quotations/${quotation.id}`}>
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-center text-muted-foreground py-4">
                                Nenhuma cotação registada ainda.
                            </p>
                        )}
                    </CardContent>
                </Card>

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
