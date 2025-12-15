import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { router } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface ExtendExpiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotationId: string;
  currentExpiryDate: string | null | undefined;
}

export default function ExtendExpiryDialog({
  open,
  onOpenChange,
  quotationId,
  currentExpiryDate,
}: ExtendExpiryDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [expiryDate, setExpiryDate] = useState(currentExpiryDate ? currentExpiryDate.split('T')[0] : "");
  const { toast } = useToast();

  const handleExtend = () => {
    if (!expiryDate) {
        toast({
            title: "Erro",
            description: "Por favor, selecione uma data válida.",
            variant: "destructive",
        });
        return;
    }

    setIsProcessing(true);

    router.post(
      `/admin/quotations/${quotationId}/extend-expiry`,
      {
        expiry_date: expiryDate,
      },
      {
        onSuccess: () => {
          setIsProcessing(false);
          onOpenChange(false);
          toast({
            title: "Sucesso",
            description: "O prazo de validade foi estendido.",
            variant: "success",
          });
        },
        onError: (error) => {
          setIsProcessing(false);
          toast({
            title: "Erro",
            description: `Ocorreu um erro ao estender o prazo: ${error}`,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Estender Validade</DialogTitle>
          <DialogDescription>
            Defina uma nova data de validade para esta cotação. Se a cotação estiver expirada, ela será reativada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="expiry_date">
              Nova Data de Validade
            </label>
            <Input
              id="expiry_date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExtend} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A processar...
              </>
            ) : (
              "Salvar Nova Data"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
