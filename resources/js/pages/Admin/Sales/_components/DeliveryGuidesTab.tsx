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
import { router, Sale } from '@inertiajs/react'; // O tipo 'Sale' do Inertia já deve ter a estrutura de 'items' que precisamos
import { Eye, MoreHorizontal, Pencil, Plus, Printer, Trash2, Upload } from 'lucide-react';
import { FormEvent, useState } from 'react';
// Importe seu dialog de criação/edição já existente
import DeliveryGuideDialog from './DeliveryGuideDialog';

// =================================================================================
// 1. DEFINIÇÕES DE TIPO (TYPESCRIPT)
// =================================================================================
interface SaleItemForGuide {
    id: string;
    name: string;
}

interface DeliveryGuideItem {
    id: string;
    sale_item_id: string;
    quantity: number;
    notes: string | null;
    sale_item: SaleItemForGuide;
}

interface DeliveryGuide {
    id: string;
    code: string;
    notes: string | null;
    created_at: string;
    items: DeliveryGuideItem[];
    verified_file: string | null;
}

// O tipo 'Sale' importado do Inertia/types já deve incluir a lista de items com os campos:
// id, name, quantity, delivered_quantity, pending_quantity.
// Este tipo abaixo apenas garante que 'delivery_guides' também esteja presente.
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
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!file || !deliveryGuide) return;
        setIsSubmitting(true);
        router.post(`/admin/delivery-guides/${deliveryGuide.id}/attachment`, { attachment: file }, {
            onSuccess: () => {
                toast({ title: 'Upload bem-sucedido!', variant: 'success' });
                onOpenChange(false);
            },
            onError: (errors) => toast({ title: 'Erro no Upload', description: errors.attachment, variant: 'destructive' }),
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) setFile(null); }}>
            <DialogContent>
                {!deliveryGuide ? (
                    <DialogHeader><DialogTitle>Carregando...</DialogTitle></DialogHeader>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Anexar Documento à Guia {deliveryGuide.code}</DialogTitle>
                            <DialogDesc>Selecione o documento para associar a esta guia.</DialogDesc>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <Label htmlFor="attachment-file">Arquivo</Label>
                                <Input id="attachment-file" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} disabled={isSubmitting} />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
                                <Button type="submit" disabled={!file || isSubmitting}>{isSubmitting ? 'Enviando...' : 'Salvar Anexo'}</Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

// =================================================================================
// 4. COMPONENTE PRINCIPAL (DeliveryGuidesTab) COM O NOVO CARD
// =================================================================================
export function DeliveryGuidesTab({ sale, formatDate }: DeliveryGuidesTabProps) {
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
                                    sale.items.map((item: any) => ( // Usando 'any' para flexibilidade com a prop `sale`
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
                                    sale.delivery_guides.map((guide) => (
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
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setViewingGuide(guide)}><Eye className="mr-2 h-4 w-4" /> Visualizar</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => handleEdit(guide)}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setUploadingGuide(guide)}><Upload className="mr-2 h-4 w-4" /> Anexar Doc.</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onSelect={(e) => e.preventDefault()} onClick={() => setDeletingGuide(guide)}><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
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
        </div>
    );
}
