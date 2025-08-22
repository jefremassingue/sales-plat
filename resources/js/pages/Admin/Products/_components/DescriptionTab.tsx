import { Label } from '@/components/ui/label';
import  EditorComponent  from '@/components/editor-component';
import { Button } from '@/components/ui/button';
import { File, X } from 'lucide-react';

interface DescriptionTabProps {
    description: string;
    setDescription: (value: string) => void;
    technicalDetails: string;
    setTechnicalDetails: (value: string) => void;
    features: string;
    setFeatures: (value: string) => void;
    errors: Record<string, string>;
    // New props for description PDF upload
    descriptionPdfFile?: File | null;
    setDescriptionPdfFile?: (file: File | null) => void;
    currentDescriptionPdfUrl?: string | null;
    onRemoveCurrentPdf?: () => void;
}

export default function DescriptionTab({
    description,
    setDescription,
    technicalDetails,
    setTechnicalDetails,
    features,
    setFeatures,
    errors,
    descriptionPdfFile,
    setDescriptionPdfFile,
    currentDescriptionPdfUrl,
    onRemoveCurrentPdf
}: DescriptionTabProps) {
    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="description">Descrição</Label>
                <div className="mt-2">
                    <EditorComponent
                        value={description}
                        onChange={setDescription}
                        placeholder="Insira a descrição detalhada do produto..."
                    />
                </div>
                {errors.description && (
                    <p className="text-destructive text-sm mt-1">{errors.description}</p>
                )}
            </div>

            <div>
                <Label htmlFor="technical_details">Detalhes Técnicos</Label>
                <div className="mt-2">
                    <EditorComponent
                        value={technicalDetails}
                        onChange={setTechnicalDetails}
                        placeholder="Insira os detalhes técnicos do produto..."
                    />
                </div>
                {errors.technical_details && (
                    <p className="text-destructive text-sm mt-1">{errors.technical_details}</p>
                )}
            </div>

            <div>
                <Label htmlFor="features">Características</Label>
                <div className="mt-2">
                    <EditorComponent
                        value={features}
                        onChange={setFeatures}
                        placeholder="Insira as características principais do produto..."
                    />
                </div>
                {errors.features && (
                    <p className="text-destructive text-sm mt-1">{errors.features}</p>
                )}
            </div>

            <div>
                <Label htmlFor="description_pdf">Ficha técnica (PDF)</Label>
                <div className="mt-2 space-y-2">
                    {/* Existing PDF (edit mode) */}
                    {currentDescriptionPdfUrl && !descriptionPdfFile && (
                        <div className="flex items-center justify-between rounded-md border p-2">
                            <a href={currentDescriptionPdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                                <File className="h-4 w-4" />
                                <span>Ver PDF atual</span>
                            </a>
                            {onRemoveCurrentPdf && (
                                <Button type="button" variant="ghost" size="icon" onClick={onRemoveCurrentPdf} title="Remover PDF">
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )}

                    {/* File input */}
                    {setDescriptionPdfFile && (
                        <input
                            id="description_pdf"
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => {
                                const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                                setDescriptionPdfFile(file);
                            }}
                        />
                    )}

                    {/* Selected file preview */}
                    {descriptionPdfFile && (
                        <div className="text-sm text-muted-foreground">Selecionado: {descriptionPdfFile.name}</div>
                    )}

                    {errors.description_pdf && (
                        <p className="text-destructive text-sm mt-1">{errors.description_pdf}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
