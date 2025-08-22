import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
	name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
	slug: z.string().optional().nullable(),
	description: z.string().optional().nullable(),
	logo: z.any().optional().nullable(),
	active: z.boolean().default(true),
});

const formatSlug = (text: string): string => {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // Remove acentos
		.replace(/[^\w\s-]/g, '') // Remove caracteres especiais
		.replace(/\s+/g, '-') // Substitui espaços por hífens
		.replace(/-+/g, '-') // Remove hífens duplicados
		.trim();
};

export default function Create() {
	const breadcrumbs = [
		{ title: 'Dashboard', href: '/dashboard' },
		{ title: 'Marcas', href: '/admin/brands' },
		{ title: 'Nova Marca', href: '/admin/brands/create' },
	];

	const { toast } = useToast();
		const { flash, errors }: { flash?: { success?: string; error?: string }; errors?: Record<string, string> } = usePage().props;
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

		const form = useForm({
			resolver: zodResolver(formSchema),
			defaultValues: {
				name: '',
				slug: '',
				description: '',
				logo: null,
				active: true,
			},
		});

	useEffect(() => {
		if (flash?.success) {
			toast({ title: 'Operação bem sucedida', description: flash.success, variant: 'success' });
		}
		if (flash?.error) {
			toast({ title: 'Erro', description: flash.error, variant: 'destructive' });
		}
	}, [flash, toast]);

		useEffect(() => {
			if (errors) {
				Object.entries(errors).forEach(([key, message]) => {
					form.setError(key as keyof typeof formSchema.shape, { type: 'manual', message });
				});
			}
		}, [errors, form]);

		const nameValue = form.watch('name');
		useEffect(() => {
			const slugValue = form.getValues('slug');
			if (nameValue && (!slugValue || slugValue === '')) {
				form.setValue('slug', formatSlug(nameValue));
			}
		}, [nameValue, form]);

	const handleSlugChange = (value: string) => {
		form.setValue('slug', formatSlug(value));
	};

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			form.setValue('logo', file);
			const reader = new FileReader();
			reader.onloadend = () => setLogoPreview(reader.result as string);
			reader.readAsDataURL(file);
		} else {
			setLogoPreview(null);
			form.setValue('logo', null);
		}
	};

	function onSubmit(values: z.infer<typeof formSchema>) {
		const data = new FormData();
		data.append('name', values.name);
		data.append('slug', values.slug || formatSlug(values.name));
		data.append('description', values.description || '');
		data.append('active', values.active ? '1' : '0');
		if (values.logo) data.append('logo', values.logo);
		router.post('/admin/brands', data, {
			forceFormData: true,
			onSuccess: () => {
				toast({ title: 'Marca criada', description: 'A marca foi criada com sucesso.', variant: 'success' });
			},
			onError: () => {
				toast({ title: 'Erro ao criar', description: 'Verifique os erros no formulário.', variant: 'destructive' });
			},
		});
	}

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Nova Marca" />
			<div className="container px-4 py-6">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" asChild>
						<Link href="/admin/brands">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<h1 className="text-2xl font-bold">Nova Marca</h1>
				</div>
				<Card className="mt-6">
					<CardHeader>
						<CardTitle>Detalhes da Marca</CardTitle>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
								<div className="grid md:grid-cols-2 gap-4">
														<FormField
															control={form.control}
															name="name"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Nome</FormLabel>
																	<FormControl>
																		<Input placeholder="Nome da marca" {...field} className="h-12 text-lg" />
																	</FormControl>
																	<FormDescription>O slug será gerado automaticamente a partir do nome.</FormDescription>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<FormField
															control={form.control}
															name="slug"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Slug (Opcional)</FormLabel>
																	<FormControl>
																		<Input
																			placeholder="slug-da-marca"
																			{...field}
																			value={field.value || ''}
																			onChange={(e) => handleSlugChange(e.target.value)}
																			className="h-12 text-lg"
																		/>
																	</FormControl>
																	<FormDescription>URL amigável da marca. Se não for fornecido, será gerado automaticamente.</FormDescription>
																	<FormMessage />
																</FormItem>
															)}
														/>
								</div>
												<FormField
													control={form.control}
													name="description"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Descrição</FormLabel>
															<FormControl>
																<Textarea placeholder="Descrição da marca" className="min-h-[120px]" {...field} value={field.value || ''} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
								<div className="grid gap-6 sm:grid-cols-2">
														<FormField
															control={form.control}
															name="logo"
															render={() => (
																<FormItem>
																	<FormLabel>Logo</FormLabel>
																	<FormControl>
																		<div>
																			<input
																				type="file"
																				accept="image/*"
																				ref={fileInputRef}
																				onChange={handleLogoChange}
																				className="hidden"
																			/>
																			<Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
																				<ImagePlus className="mr-2 h-4 w-4" /> Selecionar Logo
																			</Button>
																			{logoPreview && (
																				<div className="mt-2">
																					<img src={logoPreview} alt="Logo Preview" className="h-16 rounded" />
																				</div>
																			)}
																		</div>
																	</FormControl>
																	<FormDescription>Imagem da marca (jpg, png, svg, webp).</FormDescription>
																	<FormMessage />
																</FormItem>
															)}
														/>
									<FormField
										control={form.control}
										name="active"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
												<div className="space-y-0.5">
													<FormLabel className="text-base">Estado Ativo</FormLabel>
													<FormDescription>Determina se a marca está ativa ou não.</FormDescription>
												</div>
												<FormControl>
													<Switch checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
											</FormItem>
										)}
									/>
								</div>
								<div className="flex justify-end gap-4">
									<Button type="button" variant="outline" asChild>
										<Link href="/admin/brands">Cancelar</Link>
									</Button>
									<Button type="submit">Criar Marca</Button>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}
