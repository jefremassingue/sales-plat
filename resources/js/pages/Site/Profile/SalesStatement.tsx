import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import SiteLayout from '@/layouts/site-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
    ArrowLeft,
    Download,
    FileText,
    Filter,
    SortAsc,
    SortDesc,
    Search
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Sale {
    id: string
    sale_number: string
    status: string
    total: number
    amount_paid: number
    amount_due: number
    currency_code: string
    issue_date: string
    due_date?: string
    items: any[]
}

interface Customer {
    id: string
    name: string
    email: string
}

interface Stats {
    totalSales: number
    totalAmount: number
    paidAmount: number
    pendingAmount: number
}

interface Props {
    customer: Customer
    sales: {
        data: Sale[]
        links: any[]
        meta: any
    }
    filters: {
        status?: string
        date_from?: string
        date_to?: string
        order_by?: string
        order_direction?: string
    }
    stats: Stats
}

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    partial: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
}

const statusLabels = {
    pending: 'Pendente',
    paid: 'Pago',
    partial: 'Parcial',
    cancelled: 'Cancelado',
}

export default function SalesStatement({ customer, sales, filters, stats }: Props) {
    const [filterData, setFilterData] = useState({
        status: filters.status || 'all',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        order_by: filters.order_by || 'issue_date',
        order_direction: filters.order_direction || 'desc',
    })

    const formatCurrency = (amount: number, currencyCode = 'MZN') => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: currencyCode
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
    }

    const handleFilter = () => {
        router.get(route('profile.sales.statement'), filterData, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handleSort = (column: string) => {
        const newDirection = filterData.order_by === column && filterData.order_direction === 'asc' ? 'desc' : 'asc'
        setFilterData(prev => ({ ...prev, order_by: column, order_direction: newDirection }))
        
        router.get(route('profile.sales.statement'), {
            ...filterData,
            order_by: column,
            order_direction: newDirection
        }, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const exportPDF = () => {
        const params = new URLSearchParams(filterData).toString()
        window.open(`${route('profile.export.sales')}?${params}`, '_blank')
    }

    return (
        <SiteLayout>
            <Head title="Extrato de Vendas" />
            
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Button variant="outline" asChild>
                            <Link href={route('profile')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar ao Perfil
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Extrato de Vendas</h1>
                            <p className="text-gray-600">{customer.name}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-gray-600">Total de Vendas</div>
                            <div className="text-2xl font-bold">{stats.totalSales}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-gray-600">Valor Total</div>
                            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-gray-600">Valor Pago</div>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidAmount)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-gray-600">Valor Pendente</div>
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.pendingAmount)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={filterData.status} onValueChange={(value) => setFilterData(prev => ({ ...prev, status: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="pending">Pendente</SelectItem>
                                        <SelectItem value="paid">Pago</SelectItem>
                                        <SelectItem value="partial">Parcial</SelectItem>
                                        <SelectItem value="cancelled">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="date_from">Data Inicial</Label>
                                <Input 
                                    type="date" 
                                    value={filterData.date_from}
                                    onChange={(e) => setFilterData(prev => ({ ...prev, date_from: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="date_to">Data Final</Label>
                                <Input 
                                    type="date" 
                                    value={filterData.date_to}
                                    onChange={(e) => setFilterData(prev => ({ ...prev, date_to: e.target.value }))}
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <Button onClick={handleFilter} className="flex-1">
                                    <Search className="h-4 w-4 mr-2" />
                                    Filtrar
                                </Button>
                            </div>
                            <div className="flex items-end">
                                <Button variant="outline" onClick={exportPDF} className="w-full">
                                    <Download className="h-4 w-4 mr-2" />
                                    Exportar PDF
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Vendas ({sales.meta?.total || sales.data.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sales.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead 
                                                className="cursor-pointer hover:bg-gray-50"
                                                onClick={() => handleSort('sale_number')}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Número
                                                    {filterData.order_by === 'sale_number' && (
                                                        filterData.order_direction === 'asc' ? 
                                                        <SortAsc className="h-4 w-4" /> : 
                                                        <SortDesc className="h-4 w-4" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="cursor-pointer hover:bg-gray-50"
                                                onClick={() => handleSort('issue_date')}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Data de Emissão
                                                    {filterData.order_by === 'issue_date' && (
                                                        filterData.order_direction === 'asc' ? 
                                                        <SortAsc className="h-4 w-4" /> : 
                                                        <SortDesc className="h-4 w-4" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead>Vencimento</TableHead>
                                            <TableHead 
                                                className="cursor-pointer hover:bg-gray-50"
                                                onClick={() => handleSort('status')}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Status
                                                    {filterData.order_by === 'status' && (
                                                        filterData.order_direction === 'asc' ? 
                                                        <SortAsc className="h-4 w-4" /> : 
                                                        <SortDesc className="h-4 w-4" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="cursor-pointer hover:bg-gray-50"
                                                onClick={() => handleSort('total')}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Total
                                                    {filterData.order_by === 'total' && (
                                                        filterData.order_direction === 'asc' ? 
                                                        <SortAsc className="h-4 w-4" /> : 
                                                        <SortDesc className="h-4 w-4" />
                                                    )}
                                                </div>
                                            </TableHead>
                                            <TableHead>Valor Pago</TableHead>
                                            <TableHead>Saldo</TableHead>
                                            <TableHead>Itens</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sales.data.map((sale) => (
                                            <TableRow key={sale.id}>
                                                <TableCell className="font-medium">{sale.sale_number}</TableCell>
                                                <TableCell>{formatDate(sale.issue_date)}</TableCell>
                                                <TableCell>
                                                    {sale.due_date ? formatDate(sale.due_date) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusColors[sale.status as keyof typeof statusColors]}>
                                                        {statusLabels[sale.status as keyof typeof statusLabels] || sale.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    {formatCurrency(sale.total, sale.currency_code)}
                                                </TableCell>
                                                <TableCell className="text-green-600">
                                                    {formatCurrency(sale.amount_paid, sale.currency_code)}
                                                </TableCell>
                                                <TableCell className="text-red-600">
                                                    {formatCurrency(sale.amount_due, sale.currency_code)}
                                                </TableCell>
                                                <TableCell>{sale.items?.length || 0}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Nenhuma venda encontrada</p>
                                <p className="text-sm text-gray-400">Ajuste os filtros ou faça sua primeira compra!</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {sales.links && sales.links.length > 3 && (
                            <div className="flex justify-center mt-6 gap-2">
                                {sales.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? "default" : "outline"}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </SiteLayout>
    )
}
