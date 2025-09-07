
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeleteAlert } from '@/components/delete-alert';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { GridIcon, ListIcon, MoreHorizontal, Plus, Trash, Edit, Search, Download, Upload, TestTube } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface Synonym {
    id: string;
    main_term: string;
    synonyms: string[];
    synonyms_text: string;
    count: number;
}

interface TestResult {
    original_term: string;
    expanded_terms: string[];
    expanded_phrase: string;
    boolean_query: string;
}

interface Props {
    synonyms: Synonym[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Sinônimos',
        href: '/admin/synonyms',
    },
];

// Schema para adicionar sinônimos
const addSynonymSchema = z.object({
    main_term: z.string().min(2, 'O termo principal deve ter pelo menos 2 caracteres'),
    synonyms: z.string().min(1, 'Deve adicionar pelo menos um sinônimo'),
});

// Schema para editar sinônimos
const editSynonymSchema = z.object({
    synonyms: z.string().min(1, 'Deve adicionar pelo menos um sinônimo'),
});

// Schema para testar sinônimos
const testSynonymSchema = z.object({
    search_term: z.string().min(1, 'Digite um termo para testar'),
});

export default function Index({ synonyms }: Props) {
    const [selectedSynonyms, setSelectedSynonyms] = useState<string[]>([]);
    const [viewTab, setViewTab] = useState<string>("table");
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [synonymToDelete, setSynonymToDelete] = useState<string | null>(null);
    const [bulkDeleteAlertOpen, setBulkDeleteAlertOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingSynonym, setEditingSynonym] = useState<Synonym | null>(null);
    const [testDialogOpen, setTestDialogOpen] = useState(false);
    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const [isTestLoading, setIsTestLoading] = useState(false);

    const { toast } = useToast();
    const { flash } = usePage().props as any;

    // Form para adicionar sinônimos
    const addForm = useForm<z.infer<typeof addSynonymSchema>>({
        resolver: zodResolver(addSynonymSchema),
        defaultValues: {
            main_term: '',
            synonyms: '',
        },
    });

    // Form para editar sinônimos
    const editForm = useForm<z.infer<typeof editSynonymSchema>>({
        resolver: zodResolver(editSynonymSchema),
        defaultValues: {
            synonyms: '',
        },
    });

    // Form para testar sinônimos
    const testForm = useForm<z.infer<typeof testSynonymSchema>>({
        resolver: zodResolver(testSynonymSchema),
        defaultValues: {
            search_term: '',
        },
    });

    // Mostrar mensagens flash vindas do backend
    useEffect(() => {
        if (flash?.success) {
            toast({
                title: "Operação bem sucedida",
                description: flash.success,
                variant: "success",
            });
        }

        if (flash?.error) {
            toast({
                title: "Erro",
                description: flash.error,
                variant: "destructive",
            });
        }
    }, [flash, toast]);

    // Filtrar sinônimos baseado na busca
    const filteredSynonyms = synonyms.filter(synonym =>
        synonym.main_term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        synonym.synonyms_text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectAll = () => {
        if (selectedSynonyms.length === filteredSynonyms.length) {
            setSelectedSynonyms([]);
        } else {
            setSelectedSynonyms(filteredSynonyms.map(synonym => synonym.id));
        }
    };

    const handleSelect = (id: string) => {
        if (selectedSynonyms.includes(id)) {
            setSelectedSynonyms(selectedSynonyms.filter(synonymId => synonymId !== id));
        } else {
            setSelectedSynonyms([...selectedSynonyms, id]);
        }
    };

    const handleDeleteClick = (id: string) => {
        setSynonymToDelete(id);
        setDeleteAlertOpen(true);
    };

    const handleEditClick = (synonym: Synonym) => {
        setEditingSynonym(synonym);
        editForm.setValue('synonyms', synonym.synonyms_text);
        setEditDialogOpen(true);
    };

    const handleBulkDeleteClick = () => {
        if (selectedSynonyms.length === 0) return;
        setBulkDeleteAlertOpen(true);
    };

    const handleBulkDelete = () => {
        toast({
            title: "Não implementado",
            description: "A exclusão em massa ainda não foi implementada.",
            variant: "default",
        });
        setBulkDeleteAlertOpen(false);
    };

    const onSubmitAdd = (values: z.infer<typeof addSynonymSchema>) => {
        router.post('/admin/synonyms', values, {
            onSuccess: () => {
                toast({
                    title: 'Sinônimos adicionados',
                    description: 'Os sinônimos foram adicionados com sucesso.',
                    variant: 'success',
                });
                setAddDialogOpen(false);
                addForm.reset();
            },
            onError: () => {
                toast({
                    title: 'Erro ao adicionar',
                    description: 'Verifique os dados e tente novamente.',
                    variant: 'destructive',
                });
            },
        });
    };

    const onSubmitEdit = (values: z.infer<typeof editSynonymSchema>) => {
        if (!editingSynonym) return;

        router.put(`/admin/synonyms/${editingSynonym.main_term}`, values, {
            onSuccess: () => {
                toast({
                    title: 'Sinônimos atualizados',
                    description: 'Os sinônimos foram atualizados com sucesso.',
                    variant: 'success',
                });
                setEditDialogOpen(false);
                setEditingSynonym(null);
                editForm.reset();
            },
            onError: () => {
                toast({
                    title: 'Erro ao atualizar',
                    description: 'Verifique os dados e tente novamente.',
                    variant: 'destructive',
                });
            },
        });
    };

    const onSubmitTest = (values: z.infer<typeof testSynonymSchema>) => {
        setIsTestLoading(true);
        
        router.post('/admin/synonyms/test', values, {
            onSuccess: (page: any) => {
                setTestResult(page.props.testResult);
                setIsTestLoading(false);
            },
            onError: () => {
                toast({
                    title: 'Erro no teste',
                    description: 'Não foi possível testar o termo.',
                    variant: 'destructive',
                });
                setIsTestLoading(false);
            },
            preserveState: true,
        });
    };

    const handleExport = () => {
        window.open('/admin/synonyms/export', '_blank');
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        router.post('/admin/synonyms/import', formData, {
            onSuccess: () => {
                toast({
                    title: 'Sinônimos importados',
                    description: 'Os sinônimos foram importados com sucesso.',
                    variant: 'success',
                });
            },
            onError: () => {
                toast({
                    title: 'Erro na importação',
                    description: 'Verifique o formato do arquivo e tente novamente.',
                    variant: 'destructive',
                });
            },
        });

        // Reset input
        event.target.value = '';
    };

    // Função para renderizar a tabela de sinônimos
    const renderSynonymTable = () => {
        return filteredSynonyms.map((synonym) => (
            <TableRow key={synonym.id}>
                <TableCell className="w-[50px]">
                    <Checkbox
                        checked={selectedSynonyms.includes(synonym.id)}
                        onCheckedChange={() => handleSelect(synonym.id)}
                    />
                </TableCell>
                <TableCell className="font-medium">
                    {synonym.main_term}
                </TableCell>
                <TableCell className="max-w-md">
                    <div className="flex flex-wrap gap-1">
                        {synonym.synonyms.slice(0, 5).map((syn, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {syn}
                            </Badge>
                        ))}
                        {synonym.synonyms.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                                +{synonym.synonyms.length - 5}
                            </Badge>
                        )}
                    </div>
                </TableCell>
                <TableCell className="text-center">
                    <Badge variant="secondary">
                        {synonym.count}
                    </Badge>
                </TableCell>
                <TableCell className="w-[100px]">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir Menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(synonym)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDeleteClick(synonym.id)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Eliminar</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
        ));
    };

    // Função para renderizar cards de sinônimos
    const renderSynonymCard = (synonym: Synonym) => {
        return (
            <Card key={synonym.id} className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">{synonym.main_term}</span>
                        <Badge variant="secondary">
                            {synonym.count} sinônimos
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground">Sinônimos:</h4>
                        <div className="flex flex-wrap gap-1">
                            {synonym.synonyms.map((syn, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    {syn}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(synonym)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(synonym.id)}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash className="h-4 w-4 mr-1" />
                        Eliminar
                    </Button>
                </CardFooter>
            </Card>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerir Sinônimos" />

            <div className="container px-4 py-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Gerir Sinônimos de Busca</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setTestDialogOpen(true)}>
                            <TestTube className="mr-2 h-4 w-4" />
                            <span>Testar</span>
                        </Button>
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Exportar</span>
                        </Button>
                        <Button variant="outline" asChild>
                            <label className="cursor-pointer flex items-center">
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <Upload className="mr-2 h-4 w-4" />
                                <span>Importar</span>
                            </label>
                        </Button>
                        <Button onClick={() => setAddDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Novo Sinônimo</span>
                        </Button>
                    </div>
                </div>

                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Sinônimos Configurados</CardTitle>
                                    <CardDescription>
                                        Gerencie os sinônimos utilizados para melhorar a busca de produtos
                                    </CardDescription>
                                </div>

                                <div className="flex items-center gap-2">
                                    {selectedSynonyms.length > 0 && (
                                        <Button variant="destructive" size="sm" onClick={handleBulkDeleteClick}>
                                            <Trash className="mr-2 h-4 w-4" />
                                            Eliminar Selecionados
                                        </Button>
                                    )}
                                    <Tabs value={viewTab} onValueChange={setViewTab} className="w-auto">
                                        <TabsList>
                                            <TabsTrigger value="table">
                                                <ListIcon className="h-4 w-4 mr-1" />
                                                Tabela
                                            </TabsTrigger>
                                            <TabsTrigger value="cards">
                                                <GridIcon className="h-4 w-4 mr-1" />
                                                Cards
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                            </div>

                            {/* Área de filtros */}
                            <div className="mt-4">
                                <Input
                                    placeholder="Pesquisar por termo principal ou sinônimo..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="max-w-sm"
                                    icon={<Search className="h-4 w-4" />}
                                />
                            </div>
                        </CardHeader>

                        <CardContent>
                            <Tabs value={viewTab} className="w-full">
                                <TabsContent value="table" className="mt-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]">
                                                    <Checkbox
                                                        checked={filteredSynonyms.length > 0 && selectedSynonyms.length === filteredSynonyms.length}
                                                        onCheckedChange={handleSelectAll}
                                                    />
                                                </TableHead>
                                                <TableHead>Termo Principal</TableHead>
                                                <TableHead>Sinônimos</TableHead>
                                                <TableHead className="text-center">Quantidade</TableHead>
                                                <TableHead className="w-[100px]">Acções</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredSynonyms.length > 0 ? (
                                                renderSynonymTable()
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-6">
                                                        {searchQuery ? 'Nenhum sinônimo encontrado para a busca' : 'Nenhum sinônimo configurado'}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TabsContent>

                                <TabsContent value="cards" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredSynonyms.length > 0 ? (
                                            filteredSynonyms.map((synonym) => renderSynonymCard(synonym))
                                        ) : (
                                            <div className="col-span-full text-center py-6">
                                                {searchQuery ? 'Nenhum sinônimo encontrado para a busca' : 'Nenhum sinônimo configurado'}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialog para adicionar sinônimos */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adicionar Sinônimos</DialogTitle>
                        <DialogDescription>
                            Adicione um novo termo principal e seus sinônimos para melhorar a busca
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...addForm}>
                        <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
                            <FormField
                                control={addForm.control}
                                name="main_term"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Termo Principal</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: capacete" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={addForm.control}
                                name="synonyms"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sinônimos (separados por vírgula)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Ex: capacetes, headset, elmo, casco, proteção da cabeça"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">Adicionar</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Dialog para editar sinônimos */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Sinônimos</DialogTitle>
                        <DialogDescription>
                            Edite os sinônimos para o termo: <strong>{editingSynonym?.main_term}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                            <FormField
                                control={editForm.control}
                                name="synonyms"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sinônimos (separados por vírgula)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Ex: capacetes, headset, elmo, casco, proteção da cabeça"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">Atualizar</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Dialog para testar sinônimos */}
            <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Testar Expansão de Sinônimos</DialogTitle>
                        <DialogDescription>
                            Digite um termo para ver como ele será expandido com sinônimos
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...testForm}>
                        <form onSubmit={testForm.handleSubmit(onSubmitTest)} className="space-y-4">
                            <FormField
                                control={testForm.control}
                                name="search_term"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Termo de Busca</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: capacete azul" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isTestLoading}>
                                {isTestLoading ? 'Testando...' : 'Testar'}
                            </Button>
                        </form>
                    </Form>

                    {testResult && (
                        <div className="mt-6 space-y-4">
                            <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-2">Resultado do Teste:</h4>
                                
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Termo Original:</p>
                                        <p className="text-sm bg-muted p-2 rounded">{testResult.original_term}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Termos Expandidos:</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {testResult.expanded_terms.map((term, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {term}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Frase Expandida:</p>
                                        <p className="text-sm bg-muted p-2 rounded font-mono">{testResult.expanded_phrase}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Query Boolean (MySQL):</p>
                                        <p className="text-sm bg-muted p-2 rounded font-mono text-xs break-all">{testResult.boolean_query}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => {
                            setTestDialogOpen(false);
                            setTestResult(null);
                            testForm.reset();
                        }}>
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Alerta de confirmação de exclusão */}
            {synonymToDelete && (
                <DeleteAlert
                    isOpen={deleteAlertOpen}
                    onClose={() => {
                        setDeleteAlertOpen(false);
                        setSynonymToDelete(null);
                    }}
                    title="Eliminar Sinônimo"
                    description="Tem certeza que deseja eliminar este conjunto de sinônimos? Esta acção não pode ser desfeita."
                    deleteUrl={`/admin/synonyms/${synonymToDelete}`}
                />
            )}

            {/* Alerta de confirmação para exclusão em massa */}
            <AlertDialog open={bulkDeleteAlertOpen} onOpenChange={setBulkDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Sinônimos Selecionados</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja eliminar {selectedSynonyms.length} conjuntos de sinônimos? Esta acção não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
