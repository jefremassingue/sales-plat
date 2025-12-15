import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    employee?: {
        id: string;
        name: string;
    } | null;
}

interface UpdateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entityId: string;
    entityType: 'quotation' | 'sale';
    currentUserId?: string | null;
    users: User[];
}

export default function UpdateUserDialog({
    open,
    onOpenChange,
    entityId,
    entityType,
    currentUserId,
    users,
}: UpdateUserDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>(currentUserId || 'none');

    const handleSubmit = () => {
        setIsSubmitting(true);

        const url = entityType === 'quotation' 
            ? `/admin/quotations/${entityId}/update-user`
            : `/admin/sales/${entityId}/update-user`;

        // Convert 'none' back to null for the backend
        const userId = selectedUserId === 'none' ? null : selectedUserId;

        router.post(url, { user_id: userId }, {
            onSuccess: () => {
                onOpenChange(false);
                setIsSubmitting(false);
                toast({
                    title: 'Responsável atualizado',
                    description: 'O responsável foi atualizado com sucesso.',
                    variant: 'success',
                });
            },
            onError: () => {
                setIsSubmitting(false);
                toast({
                    title: 'Erro',
                    description: 'Ocorreu um erro ao atualizar o responsável.',
                    variant: 'destructive',
                });
            },
        });
    };

    const getDisplayName = (user: User) => {
        return user.employee?.name || user.name;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Alterar Responsável</DialogTitle>
                    <DialogDescription>
                        Selecione o funcionário responsável por esta {entityType === 'quotation' ? 'cotação' : 'venda'}.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <Select
                        value={selectedUserId}
                        onValueChange={setSelectedUserId}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um responsável" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Nenhum (Sistema)</SelectItem>
                            {users.map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                    {getDisplayName(user)}
                                    {user.employee && (
                                        <span className="text-muted-foreground ml-1 text-xs">(Funcionário)</span>
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                A guardar...
                            </>
                        ) : (
                            'Guardar'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
