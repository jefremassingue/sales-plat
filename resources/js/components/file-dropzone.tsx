// components/ui/file-dropzone.tsx

import { UploadCloud, X, File as FileIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
    file: File | null;
    onFileChange: (file: File | null) => void;
    disabled?: boolean;
}

export function FileDropzone({ file, onFileChange, disabled }: FileDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    // As funções de manipulação de eventos (drag & drop) permanecem as mesmas
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled) return;
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            onFileChange(droppedFiles[0]);
        }
    };
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            onFileChange(selectedFiles[0]);
        }
    };

    // Card que exibe o arquivo selecionado
    if (file) {
        return (
            <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                <div className="flex items-center gap-2">
                    <FileIcon className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                        {file.name}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => onFileChange(null)}
                    disabled={disabled}
                    className="text-muted-foreground ring-offset-background transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        );
    }

    // Área principal de "arrastar e soltar"
    return (
        <div
            className={cn(
                // Estilos base usando variáveis do Shadcn
                "relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-background p-8 text-center transition-colors duration-200",
                // Estilos de hover
                "hover:border-primary hover:bg-accent",
                // Estilos quando um arquivo está sendo arrastado sobre a área (simula um focus ring)
                { "bg-accent ring-2 ring-primary ring-offset-2": isDragging },
                // Estilo para o estado desabilitado
                { "cursor-not-allowed opacity-50": disabled }
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !disabled && document.getElementById('hidden-file-input')?.click()}
        >
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
                <span className="font-semibold text-primary">
                    Arraste e solte o arquivo
                </span> ou clique para selecionar.
            </p>
            <input
                id="hidden-file-input"
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled}
            />
        </div>
    );
}