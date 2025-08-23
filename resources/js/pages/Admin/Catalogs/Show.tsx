import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Catalog } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, Edit, Trash } from 'lucide-react';

interface Props {
    catalog: Catalog;
}

export default function Show({ catalog }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Catálogos',
            href: '/admin/catalogs',
        },
        {
            title: catalog.title,
            href: `/admin/catalogs/${catalog.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={catalog.title} />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={route('admin.catalogs.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">{catalog.title}</h1>
                        <Badge variant={catalog.status === 'available' ? 'success' : 'secondary'}>
                            {catalog.status === 'available' ? 'Disponível' : 'Indisponível'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <a href={catalog.file_url} target="_blank" rel="noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                Baixar PDF
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={route('admin.catalogs.edit', catalog.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={() => confirm('Tem certeza?') && router.delete(route('admin.catalogs.destroy', catalog.id))}>
                            <Trash className="h-4 w-4 mr-2" />
                            Eliminar
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 mt-6 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Detalhes do Catálogo</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Descrição</h3>
                                    <p>{catalog.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Versão</h3>
                                        <p>{catalog.version}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Ano de Publicação</h3>
                                        <p>{catalog.publish_year}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Criado por</h3>
                                    <p>{catalog.user?.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Data de Criação</h3>
                                        <p>{new Date(catalog.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Última Atualização</h3>
                                        <p>{new Date(catalog.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Capa</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {catalog.cover_url ? (
                                    <img src={catalog.cover_url} alt={catalog.title} className="w-full h-auto rounded-lg" />
                                ) : (
                                    <p>Nenhuma capa disponível.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
