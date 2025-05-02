import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductColor } from './VariantsTab';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export interface ImagePreview {
    file: File;
    preview: string;
    name: string;
    colorId?: string | null;
    isMain: boolean;
    id?: number; // For existing images on update
}

interface ImagesTabProps {
    imageFiles: ImagePreview[];
    setImageFiles: (images: ImagePreview[]) => void;
    colors: ProductColor[];
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveImage: (index: number) => void;
    handleSetMainImage: (index: number) => void;
    handleAssignImageColor: (imageIndex: number, colorId: string | null) => void;
    errors: Record<string, string>;
    mainImageIndex: number;
}

export default function ImagesTab({
    imageFiles,
    setImageFiles,
    colors,
    handleImageChange,
    handleRemoveImage,
    handleSetMainImage,
    handleAssignImageColor,
    errors,
    mainImageIndex
}: ImagesTabProps) {
    const [isDragging, setIsDragging] = useState(false);
    const { toast } = useToast();

    const validateFiles = (files: File[]): File[] => {
        const validFiles: File[] = [];
        const maxSize = 2 * 1024 * 1024; // 2MB
        const validFormats = ['image/jpeg', 'image/png', 'image/gif'];

        Array.from(files).forEach(file => {
            if (!validFormats.includes(file.type)) {
                toast({
                    variant: "destructive",
                    title: "Formato inválido",
                    description: `"${file.name}" não é um formato válido. Apenas JPG, PNG e GIF são permitidos.`
                });
                return;
            }

            if (file.size > maxSize) {
                toast({
                    variant: "destructive",
                    title: "Tamanho excedido",
                    description: `"${file.name}" excede o tamanho máximo de 2MB.`
                });
                return;
            }

            validFiles.push(file);
        });

        return validFiles;
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        try {
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const validFiles = validateFiles(Array.from(e.dataTransfer.files));
                if (validFiles.length > 0) {
                    const event = {
                        target: {
                            files: validFiles
                        }
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    handleImageChange(event);
                }
            }
        } catch (error) {
            console.error("Erro ao processar ficheiros arrastados:", error);
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Ocorreu um erro ao processar as imagens. Por favor, tente novamente."
            });
        }
    };

    const handleManualFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (e.target.files && e.target.files.length > 0) {
                const validFiles = validateFiles(Array.from(e.target.files));
                if (validFiles.length > 0) {
                    const event = {
                        target: {
                            files: validFiles
                        }
                    } as React.ChangeEvent<HTMLInputElement>;
                    handleImageChange(event);
                }
            }
        } catch (error) {
            console.error("Erro ao processar ficheiros selecionados:", error);
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Ocorreu um erro ao processar as imagens. Por favor, tente novamente."
            });
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    return (
        <div className="space-y-4">
            {errors.images && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro nas imagens</AlertTitle>
                    <AlertDescription>{errors.images}</AlertDescription>
                </Alert>
            )}

            {errors.main_image && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro na imagem principal</AlertTitle>
                    <AlertDescription>{errors.main_image}</AlertDescription>
                </Alert>
            )}

            <div
                className={cn(
                    "border-dashed border-2 rounded-lg p-6 text-center transition-colors",
                    isDragging ? "border-primary bg-primary/5" : "border-border"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    id="imageUpload"
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    multiple
                    onChange={handleManualFileSelection}
                    className="hidden"
                />
                <label
                    htmlFor="imageUpload"
                    className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    <span className="font-medium">
                        {isDragging ? "Largue as imagens aqui" : "Clique para carregar imagens"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        Suporta JPG, PNG e GIF até 2MB
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('imageUpload')?.click()}
                    >
                        Escolher ficheiros
                    </Button>
                </label>
            </div>

            {imageFiles.length > 0 && (
                <div>
                    <h3 className="text-lg font-medium mb-2">Imagens Carregadas</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imageFiles.map((img, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "border rounded-md overflow-hidden",
                                    img.isMain && "ring-2 ring-primary"
                                )}
                            >
                                <div className="relative aspect-square">
                                    <img
                                        src={img.preview}
                                        alt={img.name}
                                        className="object-cover w-full h-full"
                                    />
                                    {img.isMain && (
                                        <Badge
                                            variant="default"
                                            className="absolute top-2 left-2"
                                        >
                                            Principal
                                        </Badge>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="h-6 w-6 bg-white hover:bg-white text-destructive hover:text-destructive rounded-full"
                                            onClick={() => handleRemoveImage(index)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-2 bg-muted/30 flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs truncate" title={img.name}>
                                            {img.name}
                                        </span>
                                        {!img.isMain && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-6 text-xs"
                                                onClick={() => handleSetMainImage(index)}
                                            >
                                                Definir Principal
                                            </Button>
                                        )}
                                    </div>

                                    {colors.length > 0 && (
                                        <div className="mt-1">
                                            <Select
                                                value={img.colorId || ""}
                                                onValueChange={(value) => handleAssignImageColor(index, value || null)}
                                            >
                                                <SelectTrigger className="h-7 text-xs">
                                                    <SelectValue placeholder="Associar a cor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {colors.map((color) => (
                                                        <SelectItem key={color._tempId} value={color._tempId}>
                                                            {color.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
