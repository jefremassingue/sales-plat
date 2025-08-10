import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { router } from "@inertiajs/react";
import { FormEvent, useState } from "react";
import { FileDropzone } from "@/components/file-dropzone"; // <-- Importe o novo componente

interface DeliveryGuide {
    id: number;
    code: string;
}

interface UploadAttachmentDialogProps {
    open: boolean;
    onOpenChange: (isOpen: boolean) => void;
    deliveryGuide: DeliveryGuide | null;
}

export function UploadAttachmentDialog({ open, onOpenChange, deliveryGuide }: UploadAttachmentDialogProps) {
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
            onError: (errors) => {
                toast({
                    title: 'Erro no Upload',
                    description: errors.attachment || 'Ocorreu um erro desconhecido.',
                    variant: 'destructive'
                });
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };
    
    // Limpa o estado do arquivo ao fechar o diálogo
    const handleOpenChange = (isOpen: boolean) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            setFile(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                {!deliveryGuide ? (
                    <DialogHeader><DialogTitle>Carregando...</DialogTitle></DialogHeader>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Anexar Documento à Guia {deliveryGuide.code}</DialogTitle>
                            <DialogDescription>
                                Arraste o documento para a área abaixo ou clique para selecioná-lo.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                {/* Substitua o Input pela FileDropzone */}
                                <FileDropzone
                                    file={file}
                                    onFileChange={setFile}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={!file || isSubmitting}>
                                    {isSubmitting ? 'Enviando...' : 'Salvar Anexo'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}