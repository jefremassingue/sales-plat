import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Permission } from './_components';

// Schema de validação do formulário
const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres",
  }),
  guard_name: z.string().default('web'),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  permission: Permission;
}

export default function Edit({ permission }: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors } = usePage().props as any;

  // Preparar breadcrumbs para a navegação
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Permissões',
      href: '/admin/permissions',
    },
    {
      title: `Editar ${permission.name}`,
      href: `/admin/permissions/${permission.id}/edit`,
    },
  ];

  // Inicializar o formulário com os dados da permissão
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: permission.name,
      guard_name: permission.guard_name,
    },
    mode: 'onChange'
  });

  // Mapear erros do Laravel para os erros do formulário
  useEffect(() => {
    if (errors) {
      Object.keys(errors).forEach(key => {
        form.setError(key as any, {
          type: 'manual',
          message: errors[key],
        });
      });
    }
  }, [errors, form]);

  // Função para submeter o formulário
  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Atualizar permissão existente
      router.put(`/admin/permissions/${permission.id}`, values, {
        onSuccess: () => {
          setIsSubmitting(false);
          toast({
            title: "Permissão atualizada",
            description: "A permissão foi atualizada com sucesso.",
            variant: "success",
          });
        },
        onError: () => {
          setIsSubmitting(false);
          toast({
            title: "Erro",
            description: "Verifique os erros no formulário.",
            variant: "destructive",
          });
        },
        preserveState: false // Corrige problemas de estado no localStorage
      });
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar o pedido.",
        variant: "destructive",
      });
      console.error('Erro ao processar permissão:', error);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar ${permission.name}`} />

      <div className="container px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/permissions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Editar Permissão: {permission.name}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Permissão</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da permissão *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da permissão (ex: users.create)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guard_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guard name</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um guard" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="web">web</SelectItem>
                            <SelectItem value="api">api</SelectItem>
                            <SelectItem value="sanctum">sanctum</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        A guardar...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Guardar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
