import React from "react";
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
import { Loader2 } from "lucide-react";
import { router } from "@inertiajs/react";
import { useToast } from "@/components/ui/use-toast";
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
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);

        router.delete(`/admin/inventories/${inventoryId}/adjustments/${adjustmentId}`, {
            onSuccess: () => {
                setIsDeleting(false);
                onOpenChange(false);
                toast({
                    title: "Ajuste eliminado",
                    description: "O ajuste de inventário foi eliminado e a quantidade foi revertida.",
                    variant: "success",
                });
            },
            onError: (errors) => {
                setIsDeleting(false);
                console.error(errors);
                toast({
                    title: "Erro",
                    description: "Ocorreu um erro ao eliminar o ajuste de inventário.",
                    variant: "destructive",
                });
            },
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar Ajuste de Inventário?</AlertDialogTitle>
                    <AlertDialogDescription>
                        <p>
                            Tem a certeza que pretende eliminar este ajuste do tipo <strong>{adjustmentType}</strong>?
                        </p>
                        <p className="mt-2">
                            Esta ação irá reverter a {quantity > 0 ? "adição" : "subtração"} de{" "}
                            <span className="font-bold">{Math.abs(quantity)}</span> unidades e não pode ser desfeita.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                A eliminar...
                            </>
                        ) : (
                            "Eliminar"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
