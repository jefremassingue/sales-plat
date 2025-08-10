// Salve em um novo arquivo, ex: ./UploadAttachmentDialog.tsx

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

// Reutilize o tipo que já definimos na outra aba
interface DeliveryGuide {
    id: string;
    code: string;
    // ... outras propriedades
}

interface UploadAttachmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deliveryGuide: DeliveryGuide | null;
}

export function UploadAttachmentDialog({
    open,
    onOpenChange,
    deliveryGuide,
}: UploadAttachmentDialogProps) {
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!deliveryGuide) return null;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast({
                title: 'Nenhum arquivo selecionado',
                description: 'Por favor, escolha um arquivo para carregar.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('attachment', file);
        // O Inertia adicionará o _method: 'PUT' ou 'PATCH' se necessário, mas POST é o padrão para FormData.
        
        const url = `/admin/delivery-guides/${deliveryGuide.id}/attachment`;

        router.post(url, formData, {
            onSuccess: () => {
                toast({
                    title: 'Upload bem-sucedido!',
                    description: `O anexo foi salvo para a guia ${deliveryGuide.code}.`,
                    variant: 'success',
                });
                onOpenChange(false); // Fecha o dialog
            },
            onError: (errors) => {
                const errorMessage = errors.attachment || 'Ocorreu um erro ao carregar o arquivo.';
                toast({
                    title: 'Erro no Upload',
                    description: errorMessage,
                    variant: 'destructive',
                });
            },
            onFinish: () => {
                setIsSubmitting(false); // Libera o botão
            },
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                onOpenChange(isOpen);
                if (!isOpen) {
                    setFile(null); // Limpa o arquivo ao fechar
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Anexar Documento à Guia {deliveryGuide.code}</DialogTitle>
                    <DialogDescription>
                        Selecione o documento (PDF, imagem, etc.) para associar a esta guia de entrega.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="attachment-file">Arquivo</Label>
                        <Input
                            id="attachment-file"
                            type="file"
                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={!file || isSubmitting}>
                            {isSubmitting ? 'Enviando...' : 'Salvar Anexo'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}