import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DeleteAlert } from '@/components/delete-alert';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types/index';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Trash, Search, User as UserIcon, Building, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Employee {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    position: string | null;
    department: string | null;
    status: string;
    photo_path: string | null;
    user?: User;
}

interface Props {
    employees: {
        data: Employee[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters?: {
        search?: string;
        department?: string;
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Funcionários',
        href: '/admin/employees',
    },
];

export default function Index({ employees, filters = {} }: Props) {
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [departmentFilter, setDepartmentFilter] = useState(filters.department || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    
    const { toast } = useToast();
    const { flash } = usePage().props as { flash?: { success?: string; error?: string } };

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

    const handleDeleteClick = (id: string) => {
        setEmployeeToDelete(id);
        setDeleteAlertOpen(true);
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        if (searchTimeout) clearTimeout(searchTimeout);
        
        const timeout = setTimeout(() => {
            applyFilters({ search: value });
        }, 500);
        
        setSearchTimeout(timeout);
    };

    const applyFilters = (newFilters: any) => {
        router.get('/admin/employees', {
            search: searchQuery,
            department: departmentFilter === 'all' ? null : departmentFilter,
            status: statusFilter === 'all' ? null : statusFilter,
            ...newFilters
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>;
            case 'inactive':
                return <Badge variant="secondary">Inactivo</Badge>;
            case 'vacation':
                return <Badge className="bg-blue-500 hover:bg-blue-600">Férias</Badge>;
            case 'terminated':
                return <Badge variant="destructive">Desligado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Funcionários" />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Gestão de Funcionários</h1>
                    <Button asChild>
                        <Link href="/admin/employees/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Funcionário
                        </Link>
                    </Button>
                </div>

                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Filtros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Pesquisar por nome, email ou cargo..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Select 
                                    value={statusFilter} 
                                    onValueChange={(val) => {
                                        setStatusFilter(val);
                                        applyFilters({ status: val === 'all' ? null : val });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os Status</SelectItem>
                                        <SelectItem value="active">Activo</SelectItem>
                                        <SelectItem value="inactive">Inactivo</SelectItem>
                                        <SelectItem value="vacation">Férias</SelectItem>
                                        <SelectItem value="terminated">Desligado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Department filter could be dynamic if we had a departments list */}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Foto</TableHead>
                                    <TableHead>Nome / Email</TableHead>
                                    <TableHead>Cargo / Departamento</TableHead>
                                    <TableHead>Contacto</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.data.length > 0 ? (
                                    employees.data.map((employee) => (
                                        <TableRow key={employee.id}>
                                            <TableCell>
                                                {employee.photo_path ? (
                                                    <img 
                                                        src={`/storage/${employee.photo_path}`} 
                                                        alt={employee.name} 
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{employee.name}</div>
                                                <div className="text-sm text-muted-foreground">{employee.email || '-'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Briefcase className="h-3 w-3 text-muted-foreground" />
                                                    <span>{employee.position || 'Não definido'}</span>
                                                </div>
                                                {employee.department && (
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                                                        <Building className="h-3 w-3" />
                                                        <span>{employee.department}</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{employee.phone || '-'}</div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(employee.status)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/admin/employees/${employee.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteClick(employee.id)}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Nenhum funcionário encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                
                 {/* Pagination - Simplified version */}
                 {employees.links && employees.links.length > 3 && (
                    <div className="mt-4 flex justify-end gap-1">
                        {employees.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                disabled={!link.url}
                                asChild={!!link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                onClick={() => link.url && router.get(link.url)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <DeleteAlert
                isOpen={deleteAlertOpen}
                onClose={() => setDeleteAlertOpen(false)}
                title="Eliminar Funcionário"
                description="Tem certeza que deseja eliminar este funcionário? Esta acção não pode ser desfeita."
                deleteUrl={`/admin/employees/${employeeToDelete}`}
            />
        </AppLayout>
    );
}
