import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { router } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotationId: number;
  currentStatus: string;
  newStatus: string;
  statusLabel: string;
}

export default function StatusChangeDialog({
  open,
  onOpenChange,
  quotationId,
  currentStatus,
  newStatus,
  statusLabel,
}: StatusChangeDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const handleStatusChange = () => {
    setIsProcessing(true);

    router.post(
      `/admin/quotations/${quotationId}/status`,
      {
        status: newStatus,
        notes: notes,
      },
      {
        onSuccess: () => {
          setIsProcessing(false);
          onOpenChange(false);
          toast({
            title: "Status atualizado",
            description: `A cotação foi alterada para "${statusLabel}"`,
            variant: "success",
          });
        },
        onError: (error) => {
          setIsProcessing(false);
          toast({
            title: "Erro",
            description: `Ocorreu um erro ao atualizar o status: ${error}`,
            variant: "destructive",
          });
        },
      }
    );
  };

  // Textos específicos para cada transição de status
  const getDialogText = () => {
    if (currentStatus === "draft" && newStatus === "sent") {
      return {
        title: "Enviar cotação?",
        description: "Isto irá marcar a cotação como enviada ao cliente.",
        confirmButton: "Enviar cotação",
        notesLabel: "Mensagem para o cliente (opcional)",
        notesPlaceholder: "Escreva uma mensagem para o cliente...",
      };
    }

    if (newStatus === "approved") {
      return {
        title: "Aprovar cotação?",
        description: "Isto irá marcar a cotação como aprovada pelo cliente.",
        confirmButton: "Aprovar cotação",
        notesLabel: "Notas adicionais (opcional)",
        notesPlaceholder: "Detalhes sobre a aprovação...",
      };
    }

    if (newStatus === "rejected") {
      return {
        title: "Rejeitar cotação?",
        description: "Isto irá marcar a cotação como rejeitada pelo cliente.",
        confirmButton: "Rejeitar cotação",
        notesLabel: "Motivo da rejeição (opcional)",
        notesPlaceholder: "Explique o motivo da rejeição...",
      };
    }

    return {
      title: `Alterar status para "${statusLabel}"?`,
      description: `Isto irá alterar o status da cotação para "${statusLabel}".`,
      confirmButton: "Confirmar alteração",
      notesLabel: "Notas (opcional)",
      notesPlaceholder: "Adicione notas sobre esta alteração...",
    };
  };

  const dialogText = getDialogText();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogText.title}</DialogTitle>
          <DialogDescription>{dialogText.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="notes">
              {dialogText.notesLabel}
            </label>
            <Textarea
              id="notes"
              placeholder={dialogText.notesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleStatusChange} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A processar...
              </>
            ) : (
              dialogText.confirmButton
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
