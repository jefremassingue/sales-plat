import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ContactMessage } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { MoreHorizontal, Eye, Trash, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
    messages: {
        data: ContactMessage[];
        links: any[];
    };
    filters: {
        search?: string;
        read_status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Mensagens de Contato',
        href: '/admin/contact-messages',
    },
];

export default function Index({ messages, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [readStatusFilter, setReadStatusFilter] = useState(filters.read_status || '');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    const applyFilters = (search = searchTerm, readStatus = readStatusFilter) => {
        router.get(
            route('admin.contact-messages.index'),
            {
                search: search || null,
                read_status: readStatus || null,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const debouncedSearch = (value: string) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        setSearchTerm(value);
        const timeout = setTimeout(() => {
            applyFilters(value, readStatusFilter);
        }, 500);
        setSearchTimeout(timeout);
    };

    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    function destroy(message: ContactMessage) {
        if (confirm('Tem certeza que deseja remover esta mensagem?')) {
            router.delete(route('admin.contact-messages.destroy', message.id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerir Mensagens de Contato" />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Mensagens de Contato</h1>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Mensagens</CardTitle>
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <div className="md:col-span-2">
                                <Input
                                    placeholder="Pesquisar por nome, email ou assunto"
                                    value={searchTerm}
                                    onChange={(e) => debouncedSearch(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <Select value={readStatusFilter} onValueChange={(value) => {
                                    setReadStatusFilter(value);
                                    applyFilters(searchTerm, value);
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* <SelectItem value="">Todos os Status</SelectItem> */}
                                        <SelectItem value="read">Lidas</SelectItem>
                                        <SelectItem value="unread">Não Lidas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end md:col-span-3">
                                <Button onClick={() => applyFilters()} className="w-full md:w-auto">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Aplicar Filtros
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Assunto</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead className="w-[100px]">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {messages.data.length > 0 ? (
                                    messages.data.map((message) => (
                                        <TableRow key={message.id} className={!message.read ? 'bg-blue-50/50 font-medium' : ''}>
                                            <TableCell>{message.name}</TableCell>
                                            <TableCell>{message.email}</TableCell>
                                            <TableCell>{message.subject}</TableCell>
                                            <TableCell>
                                                <Badge variant={message.read ? 'default' : 'secondary'}>
                                                    {message.read ? 'Lida' : 'Não Lida'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(message.created_at).toLocaleDateString()}</TableCell>
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
                                                            <Link href={route('admin.contact-messages.show', message.id)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                <span>Ver Detalhes</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => destroy(message)}
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
                                        <TableCell colSpan={6} className="text-center py-6">
                                            Nenhuma mensagem encontrada
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
