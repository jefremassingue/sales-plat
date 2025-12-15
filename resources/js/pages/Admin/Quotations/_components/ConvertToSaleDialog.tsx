import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ConvertToSaleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    quotationId: number | string;
    quotationNumber: string;
}

export default function ConvertToSaleDialog({
    open,
    onOpenChange,
    quotationId,
    quotationNumber,
}: ConvertToSaleDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = () => {
        if (!quotationId) return;

        setIsSubmitting(true);
        router.post(
            `/admin/quotations/${quotationId}/convert-to-sale`,
            {},
            {
                onSuccess: () => {
                    toast({
                        title: 'Sucesso',
                        description: 'Cotação convertida em venda com sucesso!',
                        variant: 'success',
                    });
                    onOpenChange(false);
                },
                onError: (errors: any) => {
                    toast({
                        title: 'Erro',
                        description: errors.message || 'Ocorreu um erro ao converter a cotação.',
                        variant: 'destructive',
                    });
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Converter em Venda</DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja converter a cotação <strong>#{quotationNumber}</strong> em uma venda?
                        Isso criará uma nova venda com os mesmos itens e alterará o status desta cotação para "Convertida".
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Convertendo...
                            </>
                        ) : (
                            'Confirmar Conversão'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
