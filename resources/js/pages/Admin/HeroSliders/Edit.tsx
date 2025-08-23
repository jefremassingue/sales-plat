import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type HeroSlider } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Props {
    slide: HeroSlider;
}

export default function Edit({ slide }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Hero Sliders',
            href: '/admin/hero-sliders',
        },
        {
            title: `Editar ${slide.title}`,
            href: `/admin/hero-sliders/${slide.id}/edit`,
        },
    ];

    const { data, setData, post, errors } = useForm({
        supertitle: slide.supertitle || '',
        title: slide.title,
        subtitle: slide.subtitle || '',
        cta_text: slide.cta_text || '',
        cta_link: slide.cta_link || '',
        text_position: slide.text_position,
        text_color: slide.text_color,
        overlay_color: slide.overlay_color,
        active: slide.active,
        order: slide.order,
        image: null as File | null,
        _method: 'put',
    });

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post(route('admin.hero-sliders.update', slide.id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${slide.title}`} />

            <div className="container px-4 py-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('admin.hero-sliders.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Editar Slide</h1>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Detalhes do Slide</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="title">Título</Label>
                                    <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="supertitle">Super Título</Label>
                                    <Input id="supertitle" value={data.supertitle} onChange={(e) => setData('supertitle', e.target.value)} />
                                    {errors.supertitle && <p className="text-red-500 text-xs mt-1">{errors.supertitle}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="subtitle">Subtítulo</Label>
                                <Textarea id="subtitle" value={data.subtitle} onChange={(e) => setData('subtitle', e.target.value)} />
                                {errors.subtitle && <p className="text-red-500 text-xs mt-1">{errors.subtitle}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="cta_text">Texto do CTA</Label>
                                    <Input id="cta_text" value={data.cta_text} onChange={(e) => setData('cta_text', e.target.value)} />
                                    {errors.cta_text && <p className="text-red-500 text-xs mt-1">{errors.cta_text}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="cta_link">Link do CTA</Label>
                                    <Input id="cta_link" value={data.cta_link} onChange={(e) => setData('cta_link', e.target.value)} />
                                    {errors.cta_link && <p className="text-red-500 text-xs mt-1">{errors.cta_link}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="text_position">Posição do Texto</Label>
                                    <Select onValueChange={(value) => setData('text_position', value)} defaultValue={data.text_position}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a posição" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="left">Esquerda</SelectItem>
                                            <SelectItem value="center">Centro</SelectItem>
                                            <SelectItem value="right">Direita</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.text_position && <p className="text-red-500 text-xs mt-1">{errors.text_position}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="text_color">Cor do Texto</Label>
                                    <Input id="text_color" value={data.text_color} onChange={(e) => setData('text_color', e.target.value)} />
                                    {errors.text_color && <p className="text-red-500 text-xs mt-1">{errors.text_color}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="overlay_color">Cor do Overlay</Label>
                                <Input id="overlay_color" value={data.overlay_color} onChange={(e) => setData('overlay_color', e.target.value)} />
                                {errors.overlay_color && <p className="text-red-500 text-xs mt-1">{errors.overlay_color}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="order">Ordem</Label>
                                    <Input id="order" type="number" value={data.order} onChange={(e) => setData('order', parseInt(e.target.value))}/>
                                    {errors.order && <p className="text-red-500 text-xs mt-1">{errors.order}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch id="active" checked={data.active} onCheckedChange={(checked) => setData('active', checked)} />
                                    <Label htmlFor="active">Ativo</Label>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="image">Imagem</Label>
                                <Input id="image" type="file" onChange={(e) => setData('image', e.target.files?.[0] || null)} />
                                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('admin.hero-sliders.index')}>Cancelar</Link>
                                </Button>
                                <Button type="submit">Salvar Alterações</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
