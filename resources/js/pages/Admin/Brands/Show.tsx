import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function Show() {
	const breadcrumbs = [
		{ title: 'Dashboard', href: '/dashboard' },
		{ title: 'Marcas', href: '/admin/brands' },
		{ title: 'Detalhes da Marca', href: '#' },
	];
	const { brand }: { brand: any } = usePage().props;

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title={`Marca: ${brand?.name || ''}`} />
			<div className="container px-4 py-6">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" asChild>
						<Link href="/admin/brands">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<h1 className="text-2xl font-bold">Detalhes da Marca</h1>
				</div>
				<Card className="mt-6">
					<CardHeader>
						<CardTitle>{brand?.name}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-2 gap-6">
							<div>
								<div className="mb-4">
									<span className="font-semibold">Slug:</span> {brand?.slug}
								</div>
								<div className="mb-4">
									<span className="font-semibold">Descrição:</span> {brand?.description || <span className="text-muted-foreground">(sem descrição)</span>}
								</div>
								<div className="mb-4">
									<span className="font-semibold">Status:</span> <Badge variant={brand?.active ? 'default' : 'secondary'}>{brand?.active ? 'Ativo' : 'Inativo'}</Badge>
								</div>
							</div>
							<div className="flex flex-col items-center justify-center">
								{brand?.logo_url ? (
									<img src={brand.logo_url} alt={brand.name} className="h-32 rounded shadow" />
								) : (
									<div className="text-muted-foreground">Sem logo</div>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}
