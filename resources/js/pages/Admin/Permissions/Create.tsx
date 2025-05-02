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
import { PermissionFormValues } from './_components';

// Schema de validação do formulário
const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres",
  }),
  guard_name: z.string().default('web'),
});

type FormValues = z.infer<typeof formSchema>;

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
    title: 'Nova Permissão',
    href: '/admin/permissions/create',
  },
];

export default function Create() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors } = usePage().props as any;

  // Inicializar o formulário com valores padrão
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      guard_name: 'web',
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
      // Criar nova permissão
      router.post('/admin/permissions', values, {
        onSuccess: () => {
          setIsSubmitting(false);
          toast({
            title: "Permissão criada",
            description: "A permissão foi criada com sucesso.",
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
      <Head title="Nova Permissão" />

      <div className="container px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/permissions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Nova Permissão</h1>
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
                        A criar...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Criar Permissão
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
