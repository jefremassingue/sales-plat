import { Label } from '@/components/ui/label';
import  EditorComponent  from '@/components/editor-component';

interface DescriptionTabProps {
    description: string;
    setDescription: (value: string) => void;
    technicalDetails: string;
    setTechnicalDetails: (value: string) => void;
    features: string;
    setFeatures: (value: string) => void;
    errors: Record<string, string>;
}

export default function DescriptionTab({
    description,
    setDescription,
    technicalDetails,
    setTechnicalDetails,
    features,
    setFeatures,
    errors
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
        </div>
    );
}
