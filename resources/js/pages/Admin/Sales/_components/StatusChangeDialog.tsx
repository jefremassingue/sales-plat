import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface StatusChangeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    saleId: string;
    selectedStatus: string;
    statuses: { value: string; label: string; color: string }[];
}

export function StatusChangeDialog({ open, onOpenChange, saleId, selectedStatus, statuses }: StatusChangeDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const confirmStatusChange = () => {
        setIsSubmitting(true);
        router.post(
            `/admin/sales/${saleId}/status`,
            {
                status: selectedStatus,
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    setIsSubmitting(false);
                    toast({
                        title: 'Status atualizado',
                        description: 'O status da venda foi atualizado com sucesso.',
                        variant: 'success',
                    });
                },
                onError: () => {
                    setIsSubmitting(false);
                    toast({
                        title: 'Erro',
                        description: 'Ocorreu um erro ao atualizar o status da venda.',
                        variant: 'destructive',
                    });
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Alterar status da venda</DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja alterar o status para {statuses.find((s) => s.value === selectedStatus)?.label}?
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-muted-foreground text-sm">Esta ação pode afetar relatórios e a visibilidade da venda no sistema.</p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button onClick={confirmStatusChange} disabled={isSubmitting}>
                        {isSubmitting ? 'Confirmando...' : 'Confirmar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
