import { DeleteAlert } from '@/components/delete-alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type PageProps, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Building, Contact, Edit, Eye, FileDown, Filter, GridIcon, ListIcon, Plus, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    client_type: 'individual' | 'company';
    active: boolean;
    user_id: number | null;
    user?: User;
    created_at: string;
    updated_at: string;
}

interface Props {
    customers: {
        data: Customer[];
        links: any[];
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
    filters?: {
        search?: string | null;
        client_type?: string | null;
        active?: string | null;
        sort_field?: string;
        sort_order?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Clientes',
        href: '/admin/customers',
    },
];

export default function Index({ customers, filters = {} }: Props) {
    const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
    const [viewTab, setViewTab] = useState<string>('table');
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
    const [bulkDeleteAlertOpen, setBulkDeleteAlertOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [clientTypeFilter, setClientTypeFilter] = useState(filters.client_type || '');
    const [activeFilter, setActiveFilter] = useState(filters.active || '');
    const [sortField, setSortField] = useState(filters.sort_field || 'name');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    const { toast } = useToast();
    const { flash } = usePage<PageProps>().props;

    const handleExportPDF = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (clientTypeFilter) params.append('client_type', clientTypeFilter);
        if (activeFilter) params.append('active', activeFilter);
        if (sortField) params.append('sort_field', sortField);
        if (sortOrder) params.append('sort_order', sortOrder);

        const url = `/admin/customers/export/pdf?${params.toString()}`;
        window.open(url, '_blank');
    };

    // Mostrar mensagens flash vindas do backend
    useEffect(() => {
        if (flash?.success) {
            toast({
                title: 'Operação bem sucedida',
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

    const handleSelectAll = () => {
        if (selectedCustomers.length === customers.data.length) {
            setSelectedCustomers([]);
        } else {
            setSelectedCustomers(customers.data.map((customer) => customer.id));
        }
    };

    const handleSelect = (id: number) => {
        if (selectedCustomers.includes(id)) {
            setSelectedCustomers(selectedCustomers.filter((customerId) => customerId !== id));
        } else {
            setSelectedCustomers([...selectedCustomers, id]);
        }
    };

    const handleDeleteClick = (id: number) => {
        setCustomerToDelete(id);
        setDeleteAlertOpen(true);
    };

    const handleBulkDeleteClick = () => {
        if (selectedCustomers.length === 0) return;
        setBulkDeleteAlertOpen(true);
    };

    const handleBulkDelete = () => {
        toast({
            title: 'Não implementado',
            description: 'A exclusão em massa ainda não foi implementada.',
            variant: 'default',
        });
        setBulkDeleteAlertOpen(false);
    };

    // Função de debounce para pesquisa
    const debouncedSearch = (value: string) => {
        // Limpa o timeout anterior se existir
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Define o valor da pesquisa imediatamente para atualizar a UI
        setSearchQuery(value);

        // Cria um novo timeout para enviar a pesquisa após 500ms
        const timeout = setTimeout(() => {
            applyFilters({
                search: value,
                client_type: clientTypeFilter,
                active: activeFilter,
                sort_field: sortField,
                sort_order: sortOrder,
            });
        }, 500);

        setSearchTimeout(timeout);
    };

    // Limpar o timeout quando o componente for desmontado
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    // Aplicar filtros
    const applyFilters = (filterParams: {
        search?: string | null;
        client_type?: string | null;
        active?: string | null;
        sort_field?: string;
        sort_order?: string;
    }) => {
        router.get(
            '/admin/customers',
            {
                search: filterParams.search || null,
                client_type: filterParams.client_type || null,
                active: filterParams.active || null,
                sort_field: filterParams.sort_field || 'name',
                sort_order: filterParams.sort_order || 'asc',
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Alternar ordem de classificação
    const toggleSort = (field: string) => {
        const newOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(newOrder);
        applyFilters({
            search: searchQuery,
            client_type: clientTypeFilter,
            active: activeFilter,
            sort_field: field,
            sort_order: newOrder,
        });
    };

    // Função para renderizar cards de clientes
    const renderCustomerCard = (customer: Customer) => {
        return (
            <Card key={customer.id} className="flex h-full flex-col">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            <div className="flex items-center space-x-2">
                                {customer.client_type === 'company' ? (
                                    <Building size={16} className="shrink-0" />
                                ) : (
                                    <Contact size={16} className="shrink-0" />
                                )}
                                <span>
                                    {customer.name}
                                    {customer.company_name && <span className="ml-2 text-sm font-normal">({customer.company_name})</span>}
                                </span>
                            </div>
                        </CardTitle>
                        <Badge variant={customer.active ? 'default' : 'secondary'}>{customer.active ? 'Activo' : 'Inactivo'}</Badge>
                    </div>
                    <div className="text-muted-foreground text-sm">
                        {customer.email && <div>{customer.email}</div>}
                        {customer.phone && <div>Tel: {customer.phone}</div>}
                        {customer.mobile && <div>Telemóvel: {customer.mobile}</div>}
                    </div>
                </CardHeader>
                <CardContent className="flex-grow text-sm">
                    {customer.address && (
                        <div className="mb-2">
                            <div className="font-medium">Morada:</div>
                            <div>{customer.address}</div>
                            <div>
                                {customer.city}
                                {customer.province ? `, ${customer.province}` : ''}
                                {customer.postal_code ? ` ${customer.postal_code}` : ''}
                            </div>
                            <div>{customer.country}</div>
                        </div>
                    )}

                    {customer.user && (
                        <div className="bg-primary/10 mt-2 rounded-md p-2">
                            <div className="font-medium">Utilizador associado:</div>
                            <div>{customer.user.name}</div>
                            <div>{customer.user.email}</div>
                        </div>
                    )}
                </CardContent>
                <div className="mt-auto flex justify-end gap-2 border-t p-4 pt-0">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/customers/${customer.id}`}>
                            <Eye className="mr-1 h-4 w-4" />
                            Ver
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/customers/${customer.id}/edit`}>
                            <Edit className="mr-1 h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(customer.id)}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash className="mr-1 h-4 w-4" />
                        Eliminar
                    </Button>
                </div>
            </Card>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerir Clientes" />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Gerir Clientes</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportPDF}>
                            <FileDown className="mr-2 h-4 w-4" />
                            <span>Exportar PDF</span>
                        </Button>
                        <Button asChild>
                            <Link href="/admin/customers/create">
                                <Plus className="mr-2 h-4 w-4" />
                                <span>Novo Cliente</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Clientes</CardTitle>

                                <div className="flex items-center gap-2">
                                    {selectedCustomers.length > 0 && (
                                        <Button variant="destructive" size="sm" onClick={handleBulkDeleteClick}>
                                            <Trash className="mr-2 h-4 w-4" />
                                            Eliminar Selecionados
                                        </Button>
                                    )}
                                    <Tabs value={viewTab} onValueChange={setViewTab} className="w-auto">
                                        <TabsList>
                                            <TabsTrigger value="table">
                                                <ListIcon className="mr-1 h-4 w-4" />
                                                Tabela
                                            </TabsTrigger>
                                            <TabsTrigger value="cards">
                                                <GridIcon className="mr-1 h-4 w-4" />
                                                Cards
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                            </div>

                            {/* Área de filtros */}
                            <div className="mt-4 grid gap-4 md:grid-cols-4">
                                <div className="md:col-span-2">
                                    <Input
                                        placeholder="Pesquisar por nome, empresa, email ou telefone"
                                        value={searchQuery}
                                        onChange={(e) => debouncedSearch(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <Select
                                        value={clientTypeFilter}
                                        onValueChange={(value) => {
                                            setClientTypeFilter(value);
                                            applyFilters({
                                                search: searchQuery,
                                                client_type: value,
                                                active: activeFilter,
                                                sort_field: sortField,
                                                sort_order: sortOrder,
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tipo de cliente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* <SelectItem value="">Todos os tipos</SelectItem> */}
                                            <SelectItem value="individual">Particular</SelectItem>
                                            <SelectItem value="company">Empresa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Select
                                        value={activeFilter}
                                        onValueChange={(value) => {
                                            setActiveFilter(value);
                                            applyFilters({
                                                search: searchQuery,
                                                client_type: clientTypeFilter,
                                                active: value,
                                                sort_field: sortField,
                                                sort_order: sortOrder,
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Estado do cliente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* <SelectItem value="">Todos os estados</SelectItem> */}
                                            <SelectItem value="true">Activos</SelectItem>
                                            <SelectItem value="false">Inactivos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end md:col-span-4">
                                    <Button
                                        onClick={() =>
                                            applyFilters({
                                                search: searchQuery,
                                                client_type: clientTypeFilter,
                                                active: activeFilter,
                                                sort_field: sortField,
                                                sort_order: sortOrder,
                                            })
                                        }
                                        className="w-full md:w-auto"
                                    >
                                        <Filter className="mr-2 h-4 w-4" />
                                        Aplicar Filtros
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <Tabs value={viewTab} className="w-full">
                                <TabsContent value="table" className="mt-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]">
                                                    <Checkbox
                                                        checked={customers.data.length > 0 && selectedCustomers.length === customers.data.length}
                                                        onCheckedChange={handleSelectAll}
                                                    />
                                                </TableHead>
                                                <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                                                    Nome {sortField === 'name' && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                                                </TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Contacto</TableHead>
                                                <TableHead>Morada</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Utilizador</TableHead>
                                                <TableHead className="w-[100px]">Acções</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {customers.data.length > 0 ? (
                                                customers.data.map((customer) => (
                                                    <TableRow key={customer.id}>
                                                        <TableCell className="w-[50px]">
                                                            <Checkbox
                                                                checked={selectedCustomers.includes(customer.id)}
                                                                onCheckedChange={() => handleSelect(customer.id)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">
                                                                {customer.name}
                                                                {customer.company_name && (
                                                                    <span className="text-muted-foreground block text-xs">
                                                                        {customer.company_name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {customer.client_type === 'company' ? (
                                                                <div className="flex items-center">
                                                                    <Building className="mr-1 h-4 w-4" />
                                                                    <span>Empresa</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center">
                                                                    <Contact className="mr-1 h-4 w-4" />
                                                                    <span>Particular</span>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {customer.email && <div className="text-xs">{customer.email}</div>}
                                                            {customer.phone && <div className="text-xs">Tel: {customer.phone}</div>}
                                                            {customer.mobile && <div className="text-xs">Mob: {customer.mobile}</div>}
                                                        </TableCell>
                                                        <TableCell>
                                                            {customer.address ? (
                                                                <div className="text-xs">
                                                                    <div>{customer.address}</div>
                                                                    <div>
                                                                        {customer.city}
                                                                        {customer.province ? `, ${customer.province}` : ''}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground text-xs">Sem morada</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={customer.active ? 'default' : 'secondary'}>
                                                                {customer.active ? 'Activo' : 'Inactivo'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {customer.user ? (
                                                                <div className="text-xs">
                                                                    <div className="font-medium">{customer.user.name}</div>
                                                                    <div className="text-muted-foreground">{customer.user.email}</div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground text-xs">Não associado</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Button variant="ghost" size="icon" asChild>
                                                                    <Link href={`/admin/customers/${customer.id}`}>
                                                                        <Eye className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                                <Button variant="ghost" size="icon" asChild>
                                                                    <Link href={`/admin/customers/${customer.id}/edit`}>
                                                                        <Edit className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteClick(customer.id)}
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="py-6 text-center">
                                                        Nenhum cliente encontrado
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>

                                    {/* Paginação */}
                                    {customers.last_page > 1 && (
                                        <div className="flex items-center justify-between px-2 py-4">
                                            <div className="text-muted-foreground text-sm">
                                                Mostrando {customers.from} a {customers.to} de {customers.total} registos
                                            </div>
                                            <div className="flex gap-1">
                                                {customers.current_page > 1 && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.get(`/admin/customers?page=${customers.current_page - 1}`)}
                                                    >
                                                        Anterior
                                                    </Button>
                                                )}

                                                {customers.current_page < customers.last_page && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.get(`/admin/customers?page=${customers.current_page + 1}`)}
                                                    >
                                                        Próximo
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="cards" className="mt-0">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {customers.data.length > 0 ? (
                                            customers.data.map((customer) => renderCustomerCard(customer))
                                        ) : (
                                            <div className="col-span-full py-6 text-center">Nenhum cliente encontrado</div>
                                        )}
                                    </div>

                                    {/* Paginação */}
                                    {customers.last_page > 1 && (
                                        <div className="flex items-center justify-between px-2 py-4">
                                            <div className="text-muted-foreground text-sm">
                                                Mostrando {customers.from} a {customers.to} de {customers.total} registos
                                            </div>
                                            <div className="flex gap-1">
                                                {customers.current_page > 1 && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.get(`/admin/customers?page=${customers.current_page - 1}`)}
                                                    >
                                                        Anterior
                                                    </Button>
                                                )}

                                                {customers.current_page < customers.last_page && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.get(`/admin/customers?page=${customers.current_page + 1}`)}
                                                    >
                                                        Próximo
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Alerta de confirmação de exclusão */}
            {customerToDelete && (
                <DeleteAlert
                    isOpen={deleteAlertOpen}
                    onClose={() => {
                        setDeleteAlertOpen(false);
                        setCustomerToDelete(null);
                    }}
                    title="Eliminar Cliente"
                    description="Tem certeza que deseja eliminar este cliente? Esta acção não pode ser desfeita."
                    deleteUrl={`/admin/customers/${customerToDelete}`}
                />
            )}

            {/* Alerta de confirmação para exclusão em massa */}
            <AlertDialog open={bulkDeleteAlertOpen} onOpenChange={setBulkDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Clientes Selecionados</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja eliminar {selectedCustomers.length} clientes? Esta acção não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
