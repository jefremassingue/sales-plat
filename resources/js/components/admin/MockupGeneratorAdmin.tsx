import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';

interface Asset {
    description: string;
    sourceType: 'library' | 'upload';
    file?: File | null;
}

interface MockupResponse {
    success: boolean;
    path: string;
    url: string;
}

const MockupGeneratorAdmin: React.FC = () => {
    const [jobType, setJobType] = useState('');
    const [printType, setPrintType] = useState('bordado');
    const [assets, setAssets] = useState<Asset[]>([
        { description: '', sourceType: 'library', file: null },
    ]);
    const [response, setResponse] = useState<MockupResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAddAsset = () => {
        setAssets([...assets, { description: '', sourceType: 'library', file: null }]);
    };

    const handleRemoveAsset = (index: number) => {
        const newAssets = assets.filter((_, i) => i !== index);
        setAssets(newAssets);
    };

    const handleAssetChange = (index: number, field: keyof Asset, value: any) => {
        const newAssets = [...assets];
        if (field === 'file') {
            newAssets[index][field] = value.target.files[0];
        } else {
            newAssets[index][field] = value;
        }
        setAssets(newAssets);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResponse(null);

        const formData = new FormData();
        formData.append('jobType', jobType);
        formData.append('printType', printType);

        assets.forEach((asset, index) => {
            formData.append(`assets[${index}][description]`, asset.description);
            formData.append(`assets[${index}][sourceType]`, asset.sourceType);
            if (asset.sourceType === 'upload' && asset.file) {
                formData.append(`assets[${index}][file]`, asset.file);
            }
        });

        try {
            const { data } = await axios.post<MockupResponse>('/admin/mockups/generate', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResponse(data);
        } catch (error) {
            console.error('Error generating mockup:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Gerador de Mockups AI</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="jobType">Tipo de Trabalho</Label>
                            <Input
                                id="jobType"
                                value={jobType}
                                onChange={(e) => setJobType(e.target.value)}
                                placeholder="Ex: bordado em camisa refletora"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="printType">Tipo de Impressão</Label>
                            <Select value={printType} onValueChange={(value) => setPrintType(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bordado">Bordado</SelectItem>
                                    <SelectItem value="dtf">DTF</SelectItem>
                                    <SelectItem value="vinil">Vinil</SelectItem>
                                    <SelectItem value="sublimacao">Sublimação</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4">
                            <Label>Assets</Label>
                            {assets.map((asset, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                                    <Textarea
                                        value={asset.description}
                                        onChange={(e) => handleAssetChange(index, 'description', e.target.value)}
                                        placeholder="Descrição do asset"
                                        required
                                        className="flex-grow"
                                    />
                                    <div className="flex flex-col gap-2">
                                        <Select
                                            value={asset.sourceType}
                                            onValueChange={(value) => handleAssetChange(index, 'sourceType', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="library">Biblioteca</SelectItem>
                                                <SelectItem value="upload">Upload</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {asset.sourceType === 'upload' && (
                                            <Input
                                                type="file"
                                                onChange={(e) => handleAssetChange(index, 'file', e)}
                                            />
                                        )}
                                    </div>
                                    <Button type="button" variant="destructive" onClick={() => handleRemoveAsset(index)}>
                                        Remover
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" onClick={handleAddAsset}>
                                Adicionar Asset
                            </Button>
                        </div>

                        <Button type="submit" disabled={loading}>
                            {loading ? 'Gerando...' : 'Gerar Mockup'}
                        </Button>
                    </form>

                    {response && response.success && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Resultado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <img src={response.url} alt="Mockup gerado" className="rounded-xl border" />
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MockupGeneratorAdmin;
