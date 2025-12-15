import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';
import { useForm, usePage } from '@inertiajs/react';

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

type FormState = {
    jobType: string;
    printType: string;
    assets: Asset[];
};

interface PageProps {
    mockup?: MockupResponse | null;
}

const createAsset = (): Asset => ({
    description: '',
    sourceType: 'library',
    file: null,
});

const MockupGeneratorAdmin: React.FC = () => {
    const { props } = usePage<PageProps>();
    const response = props.mockup ?? null;
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<FormState>({
        jobType: '',
        printType: '',
        assets: [createAsset()],
    });

    const handleAddAsset = () => {
        setData('assets', [...data.assets, createAsset()]);
    };

    const handleRemoveAsset = (index: number) => {
        if (data.assets.length <= 1) {
            setData('assets', [createAsset()]);
            clearErrors(`assets.${index}.description`, `assets.${index}.file`, `assets.${index}.sourceType`);
            return;
        }

        setData('assets', data.assets.filter((_, i) => i !== index));
        clearErrors(`assets.${index}.description`, `assets.${index}.file`, `assets.${index}.sourceType`);
    };

    const updateAsset = (index: number, partial: Partial<Asset>) => {
        setData(
            'assets',
            data.assets.map((asset, assetIndex) => (assetIndex === index ? { ...asset, ...partial } : asset))
        );
    };

    const handleAssetChange = (index: number, field: keyof Asset, value: string | File | null) => {
        if (field === 'sourceType') {
            const source = value as Asset['sourceType'];
            updateAsset(index, {
                sourceType: source,
                file: source === 'upload' ? data.assets[index].file ?? null : null,
            });
            clearErrors(`assets.${index}.sourceType`);
            return;
        }

        updateAsset(index, { [field]: value } as Partial<Asset>);
        if (field === 'description') {
            clearErrors(`assets.${index}.description`);
        }
    };

    const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        updateAsset(index, { file });
        clearErrors(`assets.${index}.file`);
    };

    const getAssetError = (index: number, field: keyof Asset) => {
        return errors[`assets.${index}.${field}` as keyof typeof errors];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.mockups.generate'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setData('assets', [createAsset()]);
            },
        });
    };

    return (
        <div className="p-4 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Gerador de Mockups AI</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="jobType">Tipo de Trabalho</Label>
                                <Input
                                    id="jobType"
                                    value={data.jobType}
                                    onChange={(e) => {
                                        setData('jobType', e.target.value);
                                        clearErrors('jobType');
                                    }}
                                    placeholder="Ex: Bordado em camisa refletora"
                                />
                                {errors.jobType && <p className="text-sm text-red-500 mt-1">{errors.jobType}</p>}
                            </div>
                            <div>
                                <Label htmlFor="printType">Tipo de Impressão</Label>
                                <Select
                                    onValueChange={(value) => {
                                        setData('printType', value);
                                        clearErrors('printType');
                                    }}
                                    value={data.printType}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo de impressão" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bordado">Bordado</SelectItem>
                                        <SelectItem value="dtf">DTF</SelectItem>
                                        <SelectItem value="vinil">Vinil</SelectItem>
                                        <SelectItem value="sublimacao">Sublimação</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.printType && <p className="text-sm text-red-500 mt-1">{errors.printType}</p>}
                            </div>
                        </div>

                        <div>
                            <Label>Assets</Label>
                            <div className="space-y-4">
                                {data.assets.map((asset, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-2 space-y-2">
                                                <Textarea
                                                    placeholder="Descrição do asset"
                                                    value={asset.description}
                                                    onChange={(e) => handleAssetChange(index, 'description', e.target.value)}
                                                />
                                                {getAssetError(index, 'description') && (
                                                    <p className="text-sm text-red-500">
                                                        {getAssetError(index, 'description')}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Select onValueChange={(value) => handleAssetChange(index, 'sourceType', value)} value={asset.sourceType}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Fonte do Asset" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="library">Biblioteca</SelectItem>
                                                        <SelectItem value="upload">Upload</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {getAssetError(index, 'sourceType') && (
                                                    <p className="text-sm text-red-500">{getAssetError(index, 'sourceType')}</p>
                                                )}
                                                {asset.sourceType === 'upload' && (
                                                    <>
                                                        <Input type="file" accept="image/*" onChange={(e) => handleFileChange(index, e)} />
                                                        {getAssetError(index, 'file') && (
                                                            <p className="text-sm text-red-500">{getAssetError(index, 'file')}</p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => handleRemoveAsset(index)}
                                            disabled={data.assets.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" onClick={handleAddAsset} className="mt-4">Adicionar Asset</Button>
                        </div>

                        <Button type="submit" disabled={processing}>
                            {processing ? 'Gerando...' : 'Gerar Mockup'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {response && response.success && (
                <Card>
                    <CardHeader>
                        <CardTitle>Resultado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <img src={response.url} alt="Mockup gerado" className="rounded-xl border" />
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default MockupGeneratorAdmin;
