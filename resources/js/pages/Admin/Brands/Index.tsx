import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Edit, Trash, Plus, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Brand {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	logo?: string | null;
	active?: boolean;
    logo_url?: string | null;
}

interface Props {
	brands: {
		data: Brand[];
		links: any[];
		meta?: {
			current_page: number;
			from: number;
			last_page: number;
			path: string;
			per_page: number;
			to: number;
			total: number;
		};
	};
	filters?: {
		search?: string | null;
	};
}

const breadcrumbs = [
	{ title: 'Dashboard', href: '/dashboard' },
	{ title: 'Marcas', href: '/admin/brands' },
];

export default function Index({ brands, filters = {} }: Props) {
	const { flash } = usePage().props as any;
	const [searchQuery, setSearchQuery] = useState(filters.search || '');
	const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (flash?.success) {
			// Toast de sucesso
		}
	}, [flash]);

	// Debounced search
	const debouncedSearch = (value: string) => {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}
		setSearchQuery(value);
		const timeout = setTimeout(() => {
			applyFilters(value);
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

	const applyFilters = (search = searchQuery) => {
		router.get(
			'/admin/brands',
			{
				search: search || null,
			},
			{
				preserveState: true,
				replace: true,
			},
		);
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Gerir Marcas" />
			<div className="container px-4 py-6">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold">Gerir Marcas</h1>
					<Button asChild>
						<Link href="/admin/brands/create">
							<Plus className="mr-2 h-4 w-4" /> Nova Marca
						</Link>
					</Button>
				</div>
				<div className="mt-6">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle>Marcas</CardTitle>
							</div>
							{/* Search input */}
							<div className="mt-4 grid gap-4 md:grid-cols-3">
								<div className="md:col-span-2">
									<Input
										placeholder="Pesquisar por nome, slug ou descrição"
										value={searchQuery}
										onChange={(e) => debouncedSearch(e.target.value)}
										className="w-full"
									/>
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
										<TableHead>Logo</TableHead>
										<TableHead>Nome</TableHead>
										<TableHead>Slug</TableHead>
										<TableHead>Descrição</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Ações</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{brands.data.length > 0 ? (
										brands.data.map((brand) => (
											<TableRow key={brand.id}>
												<TableCell>{(brand.logo && brand.logo_url) && <img src={brand.logo_url} alt={brand.name} className="h-8" />}</TableCell>
												<TableCell>{brand.name}</TableCell>
												<TableCell>{brand.slug}</TableCell>
												<TableCell>{brand.description}</TableCell>
												<TableCell>
													<Badge variant={brand.active ? "default" : "secondary"}>{brand.active ? 'Ativo' : 'Inativo'}</Badge>
												</TableCell>
												<TableCell className="w-[100px]">
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon">
																<Eye className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem asChild>
																<Link href={`/admin/brands/${brand.id}`}>
																	<Eye className="mr-2 h-4 w-4" />
																	<span>Ver Detalhes</span>
																</Link>
															</DropdownMenuItem>
															<DropdownMenuItem asChild>
																<Link href={`/admin/brands/${brand.id}/edit`}>
																	<Edit className="mr-2 h-4 w-4" />
																	<span>Editar</span>
																</Link>
															</DropdownMenuItem>
															<DropdownMenuItem onClick={() => {}} className="text-destructive focus:text-destructive">
																<Trash className="mr-2 h-4 w-4" />
																<span>Excluir</span>
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={6} className="text-center py-6">
												Nenhuma marca encontrada
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>
			</div>
		</AppLayout>
	);
}
