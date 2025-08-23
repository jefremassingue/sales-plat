import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type HeroSlider } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { MoreHorizontal, Plus, Trash, Edit } from 'lucide-react';

interface Props {
    slides: HeroSlider[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Hero Sliders',
        href: '/admin/hero-sliders',
    },
];

export default function Index({ slides }: Props) {
    function destroy(slide: HeroSlider) {
        if (confirm('Are you sure you want to delete this slide?')) {
            router.delete(route('admin.hero-sliders.destroy', slide.id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerir Hero Sliders" />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Gerir Hero Sliders</h1>
                    <Button asChild>
                        <Link href={route('admin.hero-sliders.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Novo Slide</span>
                        </Link>
                    </Button>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Slides</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ordem</TableHead>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[100px]">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {slides.length > 0 ? (
                                    slides.map((slide) => (
                                        <TableRow key={slide.id}>
                                            <TableCell>{slide.order}</TableCell>
                                            <TableCell>{slide.title}</TableCell>
                                            <TableCell>
                                                <Badge variant={slide.active ? 'success' : 'secondary'}>
                                                    {slide.active ? 'Ativo' : 'Inativo'}
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
                                                            <Link href={route('admin.hero-sliders.edit', slide.id)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>Editar</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => destroy(slide)}
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
                                        <TableCell colSpan={4} className="text-center py-6">
                                            Nenhum slide encontrado
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
