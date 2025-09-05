import React, { use, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import SiteLayout from '@/layouts/site-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Building, 
    Calendar,
    ShoppingCart,
    FileText,
    DollarSign,
    Edit,
    Eye,
    Download,
    Globe
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAppearance } from '@/hooks/use-appearance'

interface Customer {
    id: string
    name: string
    company_name?: string
    tax_id?: string
    email: string
    phone?: string
    mobile?: string
    address?: string
    city?: string
    province?: string
    postal_code?: string
    country?: string
    birth_date?: string
    contact_person?: string
    billing_address?: string
    shipping_address?: string
    website?: string
    client_type: 'individual' | 'company'
    notes?: string
    active: boolean
    created_at: string
    user?: {
        id: string
        name: string
        email: string
    }
}

interface Sale {
    id: string
    sale_number: string
    status: string
    total: number
    currency_code: string
    issue_date: string
    created_at: string
}

interface Quotation {
    id: string
    quotation_number: string
    status: string
    total: number | null
    currency_code: string
    issue_date: string
    expiry_date?: string
    created_at: string
    hide_price?: boolean
}

interface Stats {
    salesCount: number
    salesTotal: number
    quotationsCount: number
}

interface Props {
    customer: Customer
    stats: Stats
    recentSales: Sale[]
    recentQuotations: Quotation[]
}

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    partial: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-red-100 text-red-800',
    converted: 'bg-purple-100 text-purple-800',
}

export default function Profile({ customer, stats, recentSales, recentQuotations }: Props) {
   
       const { appearance, updateAppearance } = useAppearance();

       useEffect(() => {
           updateAppearance('light');
       }, [appearance, updateAppearance]);

    const formatCurrency = (amount: number, currency = 'MZN') => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: currency,
        }).format(amount)
    }

    const formatDate = (date: string) => {
        return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
    }

    return (
        <SiteLayout>
            <Head title={`Minha Conta - ${customer.name}`} />
            
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
                        <p className="text-gray-600 mt-2">Gerencie suas informações e histórico</p>
                    </div>
                    <Link href="/profile/edit">
                        <Button>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar Perfil
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                            <CardTitle className="text-sm font-medium">Cotações</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.quotationsCount}</div>
                            <p className="text-xs text-muted-foreground">
                                Solicitações enviadas
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cliente desde</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatDate(customer.created_at)}</div>
                            <p className="text-xs text-muted-foreground">
                                {customer.client_type === 'company' ? 'Empresa' : 'Pessoa física'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                        <TabsTrigger value="sales">Vendas</TabsTrigger>
                        <TabsTrigger value="quotations">Cotações</TabsTrigger>
                        <TabsTrigger value="profile">Dados Pessoais</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Sales */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Vendas Recentes</CardTitle>
                                    <CardDescription>Suas últimas 5 compras</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {recentSales.length > 0 ? (
                                        <div className="space-y-3">
                                            {recentSales.map((sale) => (
                                                <div key={sale.id} className="flex items-center justify-between p-3 border rounded">
                                                    <div>
                                                        <p className="font-medium">{sale.sale_number}</p>
                                                        <p className="text-sm text-gray-600">{formatDate(sale.issue_date)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">{formatCurrency(sale.total, sale.currency_code)}</p>
                                                        <Badge className={statusColors[sale.status as keyof typeof statusColors]}>
                                                            {sale.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">Nenhuma venda encontrada</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Quotations */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cotações Recentes</CardTitle>
                                    <CardDescription>Suas últimas 5 solicitações</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {recentQuotations.length > 0 ? (
                                        <div className="space-y-3">
                                            {recentQuotations.map((quotation) => (
                                                <div key={quotation.id} className="flex items-center justify-between p-3 border rounded">
                                                    <div>
                                                        <p className="font-medium">{quotation.quotation_number}</p>
                                                        <p className="text-sm text-gray-600">{formatDate(quotation.issue_date)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">
                                                            {quotation.hide_price || quotation.total === null 
                                                                ? '***' 
                                                                : formatCurrency(quotation.total, quotation.currency_code)
                                                            }
                                                        </p>
                                                        <Badge className={statusColors[quotation.status as keyof typeof statusColors]}>
                                                            {quotation.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">Nenhuma cotação encontrada</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Sales Tab */}
                    <TabsContent value="sales">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Histórico de Vendas</CardTitle>
                                        <CardDescription>Todas as suas compras</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={route('profile.sales.statement')}>
                                                <FileText className="h-4 w-4 mr-2" />
                                                Ver Extrato Completo
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={route('profile.export.sales')} target="_blank">
                                                <Download className="h-4 w-4 mr-2" />
                                                Exportar PDF
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {recentSales.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Número</TableHead>
                                                <TableHead>Data</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead>Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentSales.map((sale) => (
                                                <TableRow key={sale.id}>
                                                    <TableCell className="font-medium">{sale.sale_number}</TableCell>
                                                    <TableCell>{formatDate(sale.issue_date)}</TableCell>
                                                    <TableCell>
                                                        <Badge className={statusColors[sale.status as keyof typeof statusColors]}>
                                                            {sale.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{formatCurrency(sale.total, sale.currency_code)}</TableCell>
                                                    <TableCell>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            Ver
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8">
                                        <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">Nenhuma venda encontrada</p>
                                        <p className="text-sm text-gray-400">Comece fazendo sua primeira compra!</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Quotations Tab */}
                    <TabsContent value="quotations">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Histórico de Cotações</CardTitle>
                                        <CardDescription>Todas as suas solicitações de cotação</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={route('profile.quotations.statement')}>
                                                <FileText className="h-4 w-4 mr-2" />
                                                Ver Extrato Completo
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={route('profile.export.quotations')} target="_blank">
                                                <Download className="h-4 w-4 mr-2" />
                                                Exportar PDF
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {recentQuotations.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Número</TableHead>
                                                <TableHead>Data</TableHead>
                                                <TableHead>Validade</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead>Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentQuotations.map((quotation) => (
                                                <TableRow key={quotation.id}>
                                                    <TableCell className="font-medium">{quotation.quotation_number}</TableCell>
                                                    <TableCell>{formatDate(quotation.issue_date)}</TableCell>
                                                    <TableCell>
                                                        {quotation.expiry_date ? formatDate(quotation.expiry_date) : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={statusColors[quotation.status as keyof typeof statusColors]}>
                                                            {quotation.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {quotation.hide_price || quotation.total === null 
                                                            ? '***' 
                                                            : formatCurrency(quotation.total, quotation.currency_code)
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            Ver
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8">
                                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">Nenhuma cotação encontrada</p>
                                        <p className="text-sm text-gray-400">Solicite sua primeira cotação!</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>Dados Pessoais</CardTitle>
                                <CardDescription>Suas informações cadastrais</CardDescription>
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

                                        <div className="flex items-center space-x-3">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Email</p>
                                                <p className="font-medium">{customer.email}</p>
                                            </div>
                                        </div>

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
                                                    <p className="text-sm text-gray-600">Celular</p>
                                                    <p className="font-medium">{customer.mobile}</p>
                                                </div>
                                            </div>
                                        )}

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
                                                <User className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Pessoa de Contato</p>
                                                    <p className="font-medium">{customer.contact_person}</p>
                                                </div>
                                            </div>
                                        )}

                                        {customer.website && (
                                            <div className="flex items-center space-x-3">
                                                <Globe className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Website</p>
                                                    <a href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`} 
                                                       target="_blank" 
                                                       rel="noopener noreferrer" 
                                                       className="font-medium text-blue-600 hover:text-blue-800">
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

                                        <div className="flex items-center space-x-3">
                                            <div className="w-5 h-5" />
                                            <div>
                                                <p className="text-sm text-gray-600">Tipo de Cliente</p>
                                                <Badge variant="outline">
                                                    {customer.client_type === 'company' ? 'Empresa' : 'Pessoa Física'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {customer.notes && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm text-gray-600 mb-2">Observações</p>
                                        <p className="text-gray-800">{customer.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </SiteLayout>
    )
}