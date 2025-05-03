import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { router } from "@inertiajs/react";
import { AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

interface DeleteAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryId: number;
  adjustmentId: number;
  adjustmentType: string;
  quantity: number;
}

export default function DeleteAdjustmentDialog({
  open,
  onOpenChange,
  inventoryId,
  adjustmentId,
  adjustmentType,
  quantity,
}: DeleteAdjustmentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = () => {
    setIsDeleting(true);

    router.delete(`/admin/inventories/${inventoryId}/adjustments/${adjustmentId}`, {
      onSuccess: () => {
        setIsDeleting(false);
        onOpenChange(false);
        toast({
          title: "Ajuste eliminado",
          description: "O ajuste foi removido e o inventário foi atualizado.",
          variant: "success",
        });
      },
      onError: (error) => {
        setIsDeleting(false);
        toast({
          title: "Erro",
          description: `Não foi possível eliminar o ajuste: ${error}`,
          variant: "destructive",
        });
      },
    });
  };

  // Verificar se é um ajuste positivo ou negativo
  const isPositiveAdjustment = quantity > 0;
  const impactDescription = isPositiveAdjustment
    ? `${Math.abs(quantity)} unidades serão removidas do inventário`
    : `${Math.abs(quantity)} unidades serão adicionadas ao inventário`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Ajuste de Inventário</DialogTitle>
          <DialogDescription>
            Esta ação reverterá o efeito deste ajuste e não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Aviso</AlertTitle>
          <AlertDescription>
            Este ajuste é do tipo <strong>{adjustmentType}</strong> e ao eliminá-lo, {impactDescription}
            para restaurar o inventário ao estado anterior.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A eliminar...
              </>
            ) : (
              "Eliminar Ajuste"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
