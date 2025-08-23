import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

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
        title: 'Novo Catálogo',
        href: '/admin/catalogs/create',
    },
];

export default function Create() {
    const { data, setData, post, errors } = useForm({
        title: '',
        description: '',
        cover: null as File | null,
        file: null as File | null,
        status: 'available',
        version: '',
        publish_year: new Date().getFullYear().toString(),
    });

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post(route('admin.catalogs.store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Novo Catálogo" />

            <div className="container px-4 py-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('admin.catalogs.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Novo Catálogo</h1>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Detalhes do Catálogo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="title">Título</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Título do catálogo"
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Descrição do catálogo"
                                />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="version">Versão</Label>
                                    <Input
                                        id="version"
                                        value={data.version}
                                        onChange={(e) => setData('version', e.target.value)}
                                        placeholder="Ex: 1.0"
                                    />
                                    {errors.version && <p className="text-red-500 text-xs mt-1">{errors.version}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="publish_year">Ano de Publicação</Label>
                                    <Input
                                        id="publish_year"
                                        type="number"
                                        value={data.publish_year}
                                        onChange={(e) => setData('publish_year', e.target.value)}
                                        placeholder="Ex: 2024"
                                    />
                                    {errors.publish_year && <p className="text-red-500 text-xs mt-1">{errors.publish_year}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select onValueChange={(value) => setData('status', value)} defaultValue={data.status}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Disponível</SelectItem>
                                        <SelectItem value="unavailable">Indisponível</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                            </div>

                            <div>
                                <Label htmlFor="cover">Capa</Label>
                                <Input
                                    id="cover"
                                    type="file"
                                    onChange={(e) => setData('cover', e.target.files?.[0] || null)}
                                />
                                {errors.cover && <p className="text-red-500 text-xs mt-1">{errors.cover}</p>}
                            </div>

                            <div>
                                <Label htmlFor="file">Arquivo PDF</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                />
                                {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('admin.catalogs.index')}>Cancelar</Link>
                                </Button>
                                <Button type="submit">Criar Catálogo</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

