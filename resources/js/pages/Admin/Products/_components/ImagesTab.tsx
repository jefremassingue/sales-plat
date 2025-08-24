import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductColor } from './VariantsTab';
import { useEffect, useState } from 'react';
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
    colors,
    handleImageChange,
    handleRemoveImage,
    handleSetMainImage,
    handleAssignImageColor,
    errors,
}: ImagesTabProps) {
    const [isDragging, setIsDragging] = useState(false);
    const { toast } = useToast();
    const [clipboardSupported, setClipboardSupported] = useState(false);

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
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
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

    // Allow pasting images from clipboard (Cmd/Ctrl + V)
    useEffect(() => {
        // Feature detection for the clipboard.read API
        try {
            const supported = typeof window !== 'undefined' && window.isSecureContext && 'clipboard' in navigator && 'read' in navigator.clipboard;
            setClipboardSupported(!!supported);
        } catch {
            setClipboardSupported(false);
        }

        const onPaste = (e: ClipboardEvent) => {
            try {
                // Don't hijack paste while typing into inputs/textareas/contentEditable
                const target = e.target as HTMLElement | null;
                const tag = (target?.tagName || '').toLowerCase();
                const isEditable =
                    !!target && (target.isContentEditable || tag === 'input' || tag === 'textarea');
                if (isEditable) return;

                const items = Array.from(e.clipboardData?.items || []);
                const imageItems = items.filter((item) => item.type.startsWith('image/'));
                if (imageItems.length === 0) return;

                const files: File[] = [];
                for (const item of imageItems) {
                    const file = item.getAsFile();
                    if (file) {
                        // Ensure a sensible filename
                        const ext = (file.type.split('/')[1] || 'png').replace('+xml', '');
                        const name = file.name && file.name.trim().length > 0
                            ? file.name
                            : `pasted-${Date.now()}.${ext}`;
                        const normalized = new File([file], name, { type: file.type, lastModified: Date.now() });
                        files.push(normalized);
                    }
                }

                if (files.length > 0) {
                    const validFiles = validateFiles(files);
                    if (validFiles.length > 0) {
                        const event = { target: { files: validFiles } } as unknown as React.ChangeEvent<HTMLInputElement>;
                        handleImageChange(event);
                        toast({
                            title: 'Imagem colada',
                            description: `${validFiles.length} imagem(ns) adicionada(s) do clipboard.`
                        });
                    }
                }
            } catch (error) {
                console.error('Erro ao processar imagens coladas:', error);
                toast({
                    variant: 'destructive',
                    title: 'Erro',
                    description: 'Ocorreu um erro ao colar a imagem. Por favor, tente novamente.'
                });
            }
        };

        window.addEventListener('paste', onPaste as unknown as EventListener);
        return () => window.removeEventListener('paste', onPaste as unknown as EventListener);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleImageChange, toast]);

    // Button handler to read images directly from clipboard
    const handleClipboardRead = async () => {
        try {
            if (!(typeof window !== 'undefined' && window.isSecureContext && 'clipboard' in navigator && 'read' in navigator.clipboard)) {
                toast({
                    variant: 'destructive',
                    title: 'Não suportado',
                    description: 'A leitura direta da área de transferência não é suportada neste navegador. Use Ctrl+V / ⌘V.'
                });
                return;
            }

            // Some browsers require permission; errors should be caught below
            const items = await (navigator.clipboard as typeof navigator.clipboard).read();
            const files: File[] = [];
            for (const item of items) {
                // item.types is string[] per spec; getType returns Promise<Blob>
                for (const type of item.types) {
                    if (typeof type === 'string' && type.startsWith('image/')) {
                        const blob = await item.getType(type);
                        const ext = (type.split('/')[1] || 'png').replace('+xml', '');
                        const name = `clipboard-${Date.now()}.${ext}`;
                        const file = new File([blob], name, { type, lastModified: Date.now() });
                        files.push(file);
                    }
                }
            }

            if (files.length === 0) {
                toast({
                    title: 'Sem imagem no clipboard',
                    description: 'Copie uma imagem e tente novamente.'
                });
                return;
            }

            const validFiles = validateFiles(files);
            if (validFiles.length > 0) {
                const event = { target: { files: validFiles } } as unknown as React.ChangeEvent<HTMLInputElement>;
                handleImageChange(event);
                toast({ title: 'Imagem adicionada', description: `${validFiles.length} imagem(ns) adicionada(s).` });
            }
        } catch (err: unknown) {
            const hasMessage = (e: unknown): e is { message: string } =>
                typeof e === 'object' && e !== null && 'message' in e && typeof (e as Record<string, unknown>).message === 'string';
            const msg = hasMessage(err) ? err.message : 'Ocorreu um erro ao acessar a área de transferência.';
            toast({
                variant: 'destructive',
                title: 'Erro ao ler clipboard',
                description: `${msg} Dica: você pode usar Ctrl+V / ⌘V dentro desta página.`
            });
        }
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
                // Allow pasting when this area is focused
                onPaste={(e) => {
                    // If the paste happens here, let the global handler handle it; prevent default text paste artifacts
                    if (Array.from(e.clipboardData?.items || []).some(i => i.type.startsWith('image/'))) {
                        e.preventDefault();
                    }
                }}
                tabIndex={0}
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
                        Suporta JPG, PNG e GIF até 2MB — ou cole uma imagem (Ctrl+V / ⌘V)
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('imageUpload')?.click()}
                    >
                        Escolher ficheiros
                    </Button>
                </label>
                <div className="mt-3 flex justify-center">
                    <Button type="button" variant="secondary" onClick={handleClipboardRead} disabled={!clipboardSupported}>
                        Colar da área de transferência
                    </Button>
                </div>
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
