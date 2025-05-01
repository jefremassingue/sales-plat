import { useState } from "react";
import { router } from "@inertiajs/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";

interface DeleteAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  deleteUrl: string;
  onSuccess?: () => void;
}

export function DeleteAlert({
  isOpen,
  onClose,
  title,
  description,
  deleteUrl,
  onSuccess,
}: DeleteAlertProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);

    router.delete(deleteUrl, {
      onSuccess: () => {
        toast({
          title: "Operação bem sucedida",
          description: "O item foi eliminado com sucesso.",
          variant: "success",
        });
        onClose();
        onSuccess?.();
      },
      onError: (error) => {
        toast({
          title: "Erro",
          description: "Não foi possível eliminar este item: " + error,
          variant: "destructive",
        });
        onClose();
      },
      onFinish: () => {
        setIsDeleting(false);
      },
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "A eliminar..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
