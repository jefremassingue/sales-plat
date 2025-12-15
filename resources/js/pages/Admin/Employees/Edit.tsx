import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types/index';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Upload, User as UserIcon, CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
// Link import consolidated above

interface Employee {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    position: string | null;
    department: string | null;
    status: string;
    photo_path: string | null;
    base_salary: string | number;
    commission_rate: string | number;
    admission_date: string | null;
    birth_date: string | null;
    gender: string | null;
    academic_level: string | null;
    nuit: string | null;
    bi_number: string | null;
    notes: string | null;
    user_id: string | null;
}

interface Props {
    employee: Employee;
    users: User[];
}

const formSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional().nullable(),
    position: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    base_salary: z.string().optional().nullable(),
    commission_rate: z.string().optional().nullable(),
    admission_date: z.date().optional().nullable(),
    birth_date: z.date().optional().nullable(),
    gender: z.enum(['Masculino', 'Feminino', 'Outro']).optional(),
    academic_level: z.string().optional().nullable(),
    nuit: z.string().optional().nullable(),
    bi_number: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive', 'vacation', 'terminated']),
    notes: z.string().optional().nullable(),
    user_id: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Edit({ employee, users }: Props) {
    const { toast } = useToast();
    const [photoPreview, setPhotoPreview] = useState<string | null>(employee.photo_path ? `/storage/${employee.photo_path}` : null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Funcionários', href: '/admin/employees' },
        { title: 'Editar', href: `/admin/employees/${employee.id}/edit` },
    ];

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: employee.name,
            email: employee.email || '',
            phone: employee.phone || '',
            position: employee.position || '',
            department: employee.department || '',
            base_salary: employee.base_salary?.toString() || '',
            commission_rate: employee.commission_rate?.toString() || '',
            admission_date: employee.admission_date ? parseISO(employee.admission_date) : undefined,
            birth_date: employee.birth_date ? parseISO(employee.birth_date) : undefined,
            gender: employee.gender as any || undefined,
            academic_level: employee.academic_level || '',
            nuit: employee.nuit || '',
            bi_number: employee.bi_number || '',
            status: employee.status as any || 'active',
            notes: employee.notes || '',
            user_id: employee.user_id || undefined,
        },
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = (values: FormValues) => {
        router.post(`/admin/employees/${employee.id}`, {
            _method: 'put',
            ...values,
            photo: photoFile,
            admission_date: values.admission_date ? format(values.admission_date, 'yyyy-MM-dd') : undefined,
            birth_date: values.birth_date ? format(values.birth_date, 'yyyy-MM-dd') : undefined,
        }, {
            forceFormData: true,
            onSuccess: () => {
                toast({
                    title: 'Sucesso',
                    description: 'Funcionário atualizado com sucesso.',
                    variant: 'success',
                });
            },
            onError: (errors) => {
                toast({
                    title: 'Erro',
                    description: 'Verifique os erros no formulário.',
                    variant: 'destructive',
                });
                Object.keys(errors).forEach((key) => {
                    form.setError(key as any, { message: errors[key] });
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${employee.name}`} />

            <div className="container max-w-4xl px-4 py-6">
                <div className="mb-6 flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/employees">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Editar Funcionário</h1>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Tabs defaultValue="personal" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                                <TabsTrigger value="contact">Contacto</TabsTrigger>
                                <TabsTrigger value="employment">Profissional</TabsTrigger>
                                <TabsTrigger value="financial">Financeiro</TabsTrigger>
                            </TabsList>

                            {/* DADOS PESSOAIS */}
                            <TabsContent value="personal" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Dados Pessoais</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-muted">
                                                    {photoPreview ? (
                                                        <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-muted">
                                                            <UserIcon className="h-12 w-12 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex w-full items-center justify-center">
                                                    <label htmlFor="photo-upload" className="cursor-pointer">
                                                        <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/80">
                                                            <Upload className="h-3 w-3" />
                                                            Alterar Foto
                                                        </div>
                                                        <input 
                                                            id="photo-upload" 
                                                            type="file" 
                                                            accept="image/*" 
                                                            className="hidden" 
                                                            onChange={handlePhotoChange}
                                                        />
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="flex-1 space-y-4">
                                                <FormField control={form.control} name="name" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Nome Completo *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ex: João Manuel" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField control={form.control} name="gender" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Género</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Selecione o género" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Masculino">Masculino</SelectItem>
                                                                    <SelectItem value="Feminino">Feminino</SelectItem>
                                                                    <SelectItem value="Outro">Outro</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    
                                                    <FormField control={form.control} name="birth_date" render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel>Data de Nascimento</FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button
                                                                            variant={"outline"}
                                                                            className={cn(
                                                                                "w-full pl-3 text-left font-normal",
                                                                                !field.value && "text-muted-foreground"
                                                                            )}
                                                                        >
                                                                            {field.value ? (
                                                                                format(field.value, "PPP", { locale: pt })
                                                                            ) : (
                                                                                <span>Selecione a data</span>
                                                                            )}
                                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={field.value}
                                                                        onSelect={field.onChange}
                                                                        disabled={(date) =>
                                                                            date > new Date() || date < new Date("1900-01-01")
                                                                        }
                                                                        initialFocus
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <FormField control={form.control} name="bi_number" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nº de BI/Passaporte</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="nuit" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>NUIT</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="academic_level" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nível Académico</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: Licenciatura" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* CONTACTO */}
                            <TabsContent value="contact" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informações de Contacto</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="email" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="email@exemplo.com" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="phone" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Telefone</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="+258..." {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* PROFISSIONAL */}
                            <TabsContent value="employment" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informações Profissionais</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="position" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cargo/Posição</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: Vendedor" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="department" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Departamento</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: Vendas" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="status" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Status *</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione o status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="active">Activo</SelectItem>
                                                            <SelectItem value="inactive">Inactivo</SelectItem>
                                                            <SelectItem value="vacation">Férias</SelectItem>
                                                            <SelectItem value="terminated">Desligado</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            <FormField control={form.control} name="admission_date" render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Data de Admissão</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "PPP", { locale: pt })
                                                                    ) : (
                                                                        <span>Selecione a data</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value || undefined}
                                                                onSelect={field.onChange}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div className="pt-4 border-t">
                                            <FormField control={form.control} name="user_id" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Associar Utilizador (Login)</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value || 'unassigned'}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione um utilizador do sistema (opcional)" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="unassigned">Sem utilizador associado</SelectItem>
                                                            {users.map((user) => (
                                                                <SelectItem key={user.id} value={user.id}>
                                                                    {user.name} ({user.email})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>
                                                        O utilizador associado poderá fazer login e agir como este funcionário.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* FINANCEIRO */}
                            <TabsContent value="financial" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Dados Financeiros</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="base_salary" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Salário Base (MZN)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="commission_rate" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Taxa de Comissão (%)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="0" max="100" step="0.1" placeholder="0" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>

                                        <FormField control={form.control} name="notes" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Observações</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Notas adicionais sobre o funcionário..." {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/admin/employees">Cancelar</Link>
                            </Button>
                            <Button type="submit">Atualizar Funcionário</Button>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
