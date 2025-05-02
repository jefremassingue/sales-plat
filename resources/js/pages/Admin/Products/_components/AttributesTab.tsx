import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash, Plus, AlertCircle } from 'lucide-react';

export interface ProductAttribute {
    id?: number;
    name: string;
    value: string;
    description: string;
    type: string;
    filterable: boolean;
    visible: boolean;
    order: number;
    _tempId: string;
}

interface AttributesTabProps {
    attributes: ProductAttribute[];
    setAttributes: (attributes: ProductAttribute[]) => void;
    attrName: string;
    setAttrName: (value: string) => void;
    attrValue: string;
    setAttrValue: (value: string) => void;
    attrDescription: string;
    setAttrDescription: (value: string) => void;
    handleAddAttribute: () => void;
    handleRemoveAttribute: (tempId: string) => void;
    errors: Record<string, string>;
}

export default function AttributesTab({
    attributes,
    setAttributes,
    attrName,
    setAttrName,
    attrValue,
    setAttrValue,
    attrDescription,
    setAttrDescription,
    handleAddAttribute,
    handleRemoveAttribute,
    errors
}: AttributesTabProps) {
    return (
        <div className="space-y-4">
            {errors.attributes && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro nos atributos</AlertTitle>
                    <AlertDescription>{errors.attributes}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="attrName">Nome do Atributo</Label>
                    <Input
                        id="attrName"
                        value={attrName}
                        onChange={(e) => setAttrName(e.target.value)}
                        placeholder="Ex: Nível de Proteção"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="attrValue">Valor</Label>
                    <Input
                        id="attrValue"
                        value={attrValue}
                        onChange={(e) => setAttrValue(e.target.value)}
                        placeholder="Ex: IP65"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="attrDescription">Descrição (opcional)</Label>
                    <Input
                        id="attrDescription"
                        value={attrDescription}
                        onChange={(e) => setAttrDescription(e.target.value)}
                        placeholder="Ex: Proteção contra poeira e jatos de água"
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    type="button"
                    onClick={handleAddAttribute}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Atributo
                </Button>
            </div>

            {attributes.length > 0 && (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead className="w-[100px]">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attributes.map((attr) => (
                                <TableRow key={attr._tempId}>
                                    <TableCell>{attr.name}</TableCell>
                                    <TableCell>{attr.value}</TableCell>
                                    <TableCell>{attr.description || '-'}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveAttribute(attr._tempId)}
                                        >
                                            <Trash className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {attributes.length === 0 && (
                <div className="text-center p-4 border rounded-md bg-muted/50">
                    <p className="text-muted-foreground">Nenhum atributo adicionado</p>
                </div>
            )}
        </div>
    );
}
