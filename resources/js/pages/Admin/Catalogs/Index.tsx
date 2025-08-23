import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Catalog } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { MoreHorizontal, Plus, Trash, Edit, Eye } from 'lucide-react';

interface Props {
    catalogs: {
        data: Catalog[];
        links: any[];
    };
    filters: {
        search: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Catálogos',
        href: '/admin/catalogs',
    },
];

export default function Index({ catalogs, filters }: Props) {
    function destroy(catalog: Catalog) {
        if (confirm('Are you sure you want to delete this catalog?')) {
            router.delete(route('admin.catalogs.destroy', catalog.id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerir Catálogos" />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Gerir Catálogos</h1>
                    <Button asChild>
                        <Link href={route('admin.catalogs.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Novo Catálogo</span>
                        </Link>
                    </Button>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Catálogos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Versão</TableHead>
                                    <TableHead>Ano</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[100px]">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {catalogs.data.length > 0 ? (
                                    catalogs.data.map((catalog) => (
                                        <TableRow key={catalog.id}>
                                            <TableCell>{catalog.title}</TableCell>
                                            <TableCell>{catalog.version}</TableCell>
                                            <TableCell>{catalog.publish_year}</TableCell>
                                            <TableCell>
                                                <Badge variant={catalog.status === 'available' ? 'success' : 'secondary'}>
                                                    {catalog.status === 'available' ? 'Disponível' : 'Indisponível'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Abrir Menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('admin.catalogs.show', catalog.id)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                <span>Ver</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('admin.catalogs.edit', catalog.id)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>Editar</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => destroy(catalog)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            <span>Eliminar</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-6">
                                            Nenhum catálogo encontrado
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
