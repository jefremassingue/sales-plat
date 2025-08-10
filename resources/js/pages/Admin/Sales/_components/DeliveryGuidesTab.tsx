// COPIE E COLE TODO ESTE CONTEÚDO NO SEU ARQUIVO

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription as DialogDesc, // Renomeado para evitar conflito com CardDescription
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { router, useForm } from '@inertiajs/react';
import { Eye, MoreHorizontal, Pencil, Plus, Printer, Trash2, Upload } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Sale, DeliveryGuide } from '@/types';
// Importe seu dialog de criação/edição já existente
import DeliveryGuideDialog from './DeliveryGuideDialog';

type SaleWithDeliveryGuides = Sale & {
    delivery_guides: DeliveryGuide[];
};

interface DeliveryGuidesTabProps {
    sale: SaleWithDeliveryGuides;
    formatDate: (dateStr: string | undefined | null) => string;
}

// =================================================================================
// 2. DIALOG DE VISUALIZAÇÃO (ViewDeliveryGuideDialog)
// =================================================================================
interface ViewDeliveryGuideDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deliveryGuide: DeliveryGuide | null;
    formatDate: (dateStr: string | undefined | null) => string;
}

function ViewDeliveryGuideDialog({ open, onOpenChange, deliveryGuide, formatDate }: ViewDeliveryGuideDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                {!deliveryGuide ? (
                    <DialogHeader><DialogTitle>Carregando...</DialogTitle></DialogHeader>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Detalhes da Guia de Entrega: {deliveryGuide.code}</DialogTitle>
                            <DialogDesc>Emitida em: {formatDate(deliveryGuide.created_at)}</DialogDesc>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {deliveryGuide.notes && (
                                <div>
                                    <h4 className="font-semibold">Notas Gerais</h4>
                                    <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{deliveryGuide.notes}</p>
                                </div>
                            )}
                            <div>
                                <h4 className="font-semibold">Itens Entregues</h4>
                                <div className="mt-2 rounded-md border">
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Produto</TableHead><TableHead className="w-[120px] text-right">Qtd. Entregue</TableHead><TableHead>Notas do Item</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {deliveryGuide.items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.sale_item.name}</TableCell>
                                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">{item.notes || '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

// =================================================================================
// 3. DIALOG DE UPLOAD DE ANEXO (UploadAttachmentDialog)
// =================================================================================
interface UploadAttachmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deliveryGuide: DeliveryGuide | null;
}

function UploadAttachmentDialog({ open, onOpenChange, deliveryGuide }: UploadAttachmentDialogProps) {
    const { toast } = useToast();
    const { data, setData, post, processing, errors, reset } = useForm({
        attachment: null as File | null,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!deliveryGuide) return;

        post(route('admin.delivery-guides.upload-attachment', deliveryGuide.id), {
            onSuccess: () => {
                toast({ title: 'Sucesso', description: 'Anexo carregado com sucesso!' });
                onOpenChange(false);
                reset();
            },
            onError: (err) => {
                console.error(err);
                toast({
                    variant: 'destructive',
                    title: 'Erro ao carregar anexo',
                    description: err.attachment || 'Ocorreu um erro inesperado.',
                });
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Anexar Documento à Guia: {deliveryGuide?.code}</DialogTitle>
                    <DialogDesc>
                        Carregue um ficheiro (PDF, JPG, PNG) para associar a esta guia de entrega.
                    </DialogDesc>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="attachment">Ficheiro</Label>
                        <Input
                            id="attachment"
                            type="file"
                            onChange={(e) => setData('attachment', e.target.files ? e.target.files[0] : null)}
                            className="mt-1"
                        />
                        {errors.attachment && <p className="mt-1 text-sm text-red-600">{errors.attachment}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={!data.attachment || processing}>
                            {processing ? 'A carregar...' : 'Carregar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// =================================================================================
// 4. COMPONENTE PRINCIPAL (DeliveryGuidesTab) COM O NOVO CARD
// =================================================================================
export function DeliveryGuidesTab({ sale, formatDate }: DeliveryGuidesTabProps) {
    const { toast } = useToast();
    const [isCreateEditDialogOpen, setCreateEditDialogOpen] = useState(false);
    const [editingGuide, setEditingGuide] = useState<DeliveryGuide | null>(null);
    const [viewingGuide, setViewingGuide] = useState<DeliveryGuide | null>(null);
    const [uploadingGuide, setUploadingGuide] = useState<DeliveryGuide | null>(null);
    const [deletingGuide, setDeletingGuide] = useState<DeliveryGuide | null>(null);

    const handleEdit = (guide: DeliveryGuide) => {
        setEditingGuide(guide);
        setCreateEditDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingGuide(null);
        setCreateEditDialogOpen(true);
    };

    const handlePrint = (guide: DeliveryGuide) => {
        window.open(route('admin.delivery-guides.print', guide.id));
    };

    const handleDelete = () => {
        if (!deletingGuide) return;
        router.delete(route('admin.delivery-guides.destroy', deletingGuide.id), {
            onSuccess: () => {
                setDeletingGuide(null);
                toast({ title: 'Sucesso', description: 'Guia de entrega eliminada com sucesso!' });
            },
            onError: (err: any) => {
                toast({
                    variant: 'destructive',
                    title: 'Erro ao eliminar',
                    description: err.message || 'Ocorreu um erro inesperado.',
                });
            },
        });
    };

    return (
        <div className="space-y-6 pt-6">
            {/* ============================================================================ */}
            {/* NOVO CARD: STATUS DA ENTREGA DOS ITENS                                        */}
            {/* ============================================================================ */}
            <Card>
                <CardHeader>
                    <CardTitle>Status da Entrega dos Itens</CardTitle>
                    <CardDescription>
                        Resumo das quantidades entregues e pendentes para cada item da venda.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produto</TableHead>
                                    <TableHead className="w-[120px] text-center">Qtd. Total</TableHead>
                                    <TableHead className="w-[130px] text-center">Qtd. Entregue</TableHead>
                                    <TableHead className="w-[130px] text-center">Qtd. Pendente</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sale.items && sale.items.length > 0 ? (
                                    sale.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                            <TableCell className="text-center font-medium text-emerald-600">{item.delivered_quantity}</TableCell>
                                            <TableCell className={`text-center font-bold ${item.pending_quantity > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                {item.pending_quantity}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-4 text-center text-muted-foreground">
                                            Nenhum item encontrado nesta venda.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* CARD EXISTENTE: LISTA DE GUIAS DE ENTREGA */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                        <CardTitle>Guias de Entrega</CardTitle>
                        <Button onClick={handleAddNew}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Adicionar Nova Guia</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Nota</TableHead><TableHead>Data</TableHead><TableHead>Anexo</TableHead><TableHead className="text-right"></TableHead></TableRow></TableHeader>
                            <TableBody>
                                {sale.delivery_guides?.length > 0 ? (
                                    sale.delivery_guides.map((guide, index) => {
                                        const isLastGuide = index === 0; // Assuming guides are sorted descending by creation date
                                        return (
                                            <TableRow key={guide.id}>
                                                <TableCell className="font-mono">{guide.code}</TableCell>
                                                <TableCell>{guide.notes || 'Sem nota'}</TableCell>
                                                <TableCell>{formatDate(guide.created_at)}</TableCell>
                                                <TableCell className="font-medium">
                                                    {guide.verified_file ? (<a href={guide.verified_file} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver Anexo</a>) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu modal={false}>
                                                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => setViewingGuide(guide)}><Eye className="mr-2 h-4 w-4" /> Visualizar</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handlePrint(guide)}><Printer className="mr-2 h-4 w-4" /> Gerar PDF</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => setUploadingGuide(guide)}><Upload className="mr-2 h-4 w-4" /> Anexar Doc.</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleEdit(guide)} disabled={!isLastGuide}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeletingGuide(guide)} disabled={!isLastGuide}><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow><TableCell colSpan={5} className="py-4 text-center text-muted-foreground">Nenhuma guia de entrega encontrada.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Dialogs que são controlados pelos estados */}
            <DeliveryGuideDialog
                open={isCreateEditDialogOpen}
                onOpenChange={(isOpen) => { setCreateEditDialogOpen(isOpen); if (!isOpen) setEditingGuide(null); }}
                sale={sale}
                deliveryGuide={editingGuide}
            />
            <ViewDeliveryGuideDialog
                open={!!viewingGuide}
                onOpenChange={(isOpen) => { if (!isOpen) setViewingGuide(null); }}
                deliveryGuide={viewingGuide}
                formatDate={formatDate}
            />
            <UploadAttachmentDialog
                open={!!uploadingGuide}
                onOpenChange={(isOpen) => { if (!isOpen) setUploadingGuide(null); }}
                deliveryGuide={uploadingGuide}
            />

            {/* Confirmation Dialog for Deletion */}
            <Dialog open={!!deletingGuide} onOpenChange={(isOpen) => { if (!isOpen) setDeletingGuide(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Eliminação</DialogTitle>
                        <DialogDesc>
                            Tem a certeza que deseja eliminar a guia de entrega <strong>{deletingGuide?.code}</strong>? Esta ação não pode ser revertida.
                        </DialogDesc>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingGuide(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
