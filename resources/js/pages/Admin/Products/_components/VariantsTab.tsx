import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert,  AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Trash, Plus, Palette, AlertCircle } from 'lucide-react';
import { HexColorPicker } from "react-colorful";

export interface ProductColor {
    id?: number;
    name: string;
    hex_code: string;
    active: boolean;
    order: number;
    _tempId: string;
}

export interface ProductSize {
    id?: number;
    name: string;
    code: string;
    description: string;
    available: boolean;
    order: number;
    _tempId: string;
}

export interface ProductVariant {
    id?: number;
    product_color_id: number | null;
    product_size_id: number | null;
    sku: string;
    price: number | null;
    stock: number;
    active: boolean;
    _tempId: string;
    _colorName?: string;
    _sizeName?: string;
}

interface VariantsTabProps {
    colors: ProductColor[];
    setColors: (colors: ProductColor[]) => void;
    sizes: ProductSize[];
    setSizes: (sizes: ProductSize[]) => void;
    variants: ProductVariant[];
    setVariants: (variants: ProductVariant[]) => void;

    // For color management
    colorName: string;
    setColorName: (value: string) => void;
    colorHex: string;
    setColorHex: (value: string) => void;
    handleAddColor: () => void;
    handleRemoveColor: (tempId: string) => void;

    // For size management
    sizeName: string;
    setSizeName: (value: string) => void;
    sizeCode: string;
    setSizeCode: (value: string) => void;
    sizeDescription: string;
    setSizeDescription: (value: string) => void;
    handleAddSize: () => void;
    handleRemoveSize: (tempId: string) => void;

    // For variant management
    newVariantColorId: string | null;
    setNewVariantColorId: (value: string | null) => void;
    newVariantSizeId: string | null;
    setNewVariantSizeId: (value: string | null) => void;
    newVariantSku: string;
    setNewVariantSku: (value: string) => void;
    newVariantPrice: string;
    setNewVariantPrice: (value: string) => void;
    newVariantStock: string;
    setNewVariantStock: (value: string) => void;
    handleAddVariant: () => void;
    handleRemoveVariant: (tempId: string) => void;

    errors: Record<string, string>;
}

export default function VariantsTab({
    colors, setColors,
    sizes, setSizes,
    variants, setVariants,
    colorName, setColorName,
    colorHex, setColorHex,
    handleAddColor, handleRemoveColor,
    sizeName, setSizeName,
    sizeCode, setSizeCode,
    sizeDescription, setSizeDescription,
    handleAddSize, handleRemoveSize,
    newVariantColorId, setNewVariantColorId,
    newVariantSizeId, setNewVariantSizeId,
    newVariantSku, setNewVariantSku,
    newVariantPrice, setNewVariantPrice,
    newVariantStock, setNewVariantStock,
    handleAddVariant, handleRemoveVariant,
    errors
}: VariantsTabProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium mb-2">Cores</h3>

                {errors.colors && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erro nas cores</AlertTitle>
                        <AlertDescription>{errors.colors}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="colorName">Nome da Cor</Label>
                        <Input
                            id="colorName"
                            value={colorName}
                            onChange={(e) => setColorName(e.target.value)}
                            placeholder="Ex: Vermelho, Azul, Preto"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="colorHex">Código da Cor</Label>
                        <div className="flex gap-2">
                            <div
                                className="h-10 w-10 rounded-md border"
                                style={{ backgroundColor: colorHex }}
                            />
                            <Input
                                id="colorHex"
                                value={colorHex}
                                onChange={(e) => setColorHex(e.target.value)}
                                placeholder="#FFFFFF"
                            />
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Palette className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-3">
                                    <HexColorPicker
                                        color={colorHex}
                                        onChange={setColorHex}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-2">
                    <Button
                        type="button"
                        onClick={handleAddColor}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Cor
                    </Button>
                </div>

                {colors.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                        {colors.map((color) => (
                            <div key={color._tempId} className="border rounded-md p-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {color.hex_code && (
                                        <div
                                            className="h-5 w-5 rounded-full border"
                                            style={{ backgroundColor: color.hex_code }}
                                        />
                                    )}
                                    <span>{color.name}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveColor(color._tempId)}
                                >
                                    <Trash className="w-3 h-3 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Separator />

            <div>
                <h3 className="text-lg font-medium mb-2">Tamanhos</h3>

                {errors.sizes && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erro nos tamanhos</AlertTitle>
                        <AlertDescription>{errors.sizes}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="sizeName">Nome do Tamanho</Label>
                        <Input
                            id="sizeName"
                            value={sizeName}
                            onChange={(e) => setSizeName(e.target.value)}
                            placeholder="Ex: XL, M, L, 42"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sizeCode">Código (opcional)</Label>
                        <Input
                            id="sizeCode"
                            value={sizeCode}
                            onChange={(e) => setSizeCode(e.target.value)}
                            placeholder="Ex: XL, 42"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sizeDescription">Descrição (opcional)</Label>
                        <Input
                            id="sizeDescription"
                            value={sizeDescription}
                            onChange={(e) => setSizeDescription(e.target.value)}
                            placeholder="Ex: Extra Grande, 42-44cm"
                        />
                    </div>
                </div>

                <div className="flex justify-end mt-2">
                    <Button
                        type="button"
                        onClick={handleAddSize}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Tamanho
                    </Button>
                </div>

                {sizes.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                        {sizes.map((size) => (
                            <div key={size._tempId} className="border rounded-md p-2 flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{size.name}</div>
                                    {(size.code || size.description) && (
                                        <div className="text-xs text-muted-foreground">
                                            {size.code && `Código: ${size.code}`}
                                            {size.code && size.description && ' - '}
                                            {size.description}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveSize(size._tempId)}
                                >
                                    <Trash className="w-3 h-3 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Separator />

            <div>
                <h3 className="text-lg font-medium mb-2">Variantes do Produto</h3>

                {errors.variants && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erro nas variantes</AlertTitle>
                        <AlertDescription>{errors.variants}</AlertDescription>
                    </Alert>
                )}

                <p className="text-sm text-muted-foreground mb-4">
                    As variantes permitem definir configurações específicas como preço e stock para cada combinação de cor e tamanho.
                </p>

                {(colors.length > 0 || sizes.length > 0) ? (
                    <div className="grid gap-4 md:grid-cols-5">
                        {colors.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="variantColor">Cor</Label>
                                <Select
                                    value={newVariantColorId || ""}
                                    onValueChange={(value) => setNewVariantColorId(value || null)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma cor" />
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

                        {sizes.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="variantSize">Tamanho</Label>
                                <Select
                                    value={newVariantSizeId || ""}
                                    onValueChange={(value) => setNewVariantSizeId(value || null)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um tamanho" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sizes.map((size) => (
                                            <SelectItem key={size._tempId} value={size._tempId}>
                                                {size.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="variantSku">SKU (opcional)</Label>
                            <Input
                                id="variantSku"
                                value={newVariantSku}
                                onChange={(e) => setNewVariantSku(e.target.value)}
                                placeholder="Ex: RED-XL-001"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="variantPrice">Preço (opcional)</Label>
                            <Input
                                id="variantPrice"
                                type="number"
                                step="0.01"
                                min="0"
                                value={newVariantPrice}
                                onChange={(e) => setNewVariantPrice(e.target.value)}
                                placeholder="Ex: 1299.99"
                            />
                            <p className="text-xs text-muted-foreground">
                                Deixe em branco para usar o preço do produto
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="variantStock">Stock</Label>
                            <Input
                                id="variantStock"
                                type="number"
                                min="0"
                                value={newVariantStock}
                                onChange={(e) => setNewVariantStock(e.target.value)}
                                placeholder="Ex: 10"
                            />
                        </div>
                    </div>
                ) : (
                    <Alert variant="warning" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Atenção</AlertTitle>
                        <AlertDescription>
                            Adicione pelo menos uma cor ou tamanho antes de criar variantes.
                        </AlertDescription>
                    </Alert>
                )}

                {(colors.length > 0 || sizes.length > 0) && (
                    <div className="flex justify-end mt-2">
                        <Button
                            type="button"
                            onClick={handleAddVariant}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Variante
                        </Button>
                    </div>
                )}

                {variants.length > 0 && (
                    <div className="border rounded-md mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cor</TableHead>
                                    <TableHead>Tamanho</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Preço</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead className="w-[80px]">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {variants.map((variant) => (
                                    <TableRow key={variant._tempId}>
                                        <TableCell>
                                            {variant._colorName || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {variant._sizeName || '-'}
                                        </TableCell>
                                        <TableCell>{variant.sku || '-'}</TableCell>
                                        <TableCell>
                                            {variant.price !== null
                                                ? new Intl.NumberFormat('pt-MZ', {
                                                    style: 'currency',
                                                    currency: 'MZN'
                                                }).format(variant.price)
                                                : 'Preço padrão'
                                            }
                                        </TableCell>
                                        <TableCell>{variant.stock}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveVariant(variant._tempId)}
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

                {variants.length === 0 && (colors.length > 0 || sizes.length > 0) && (
                    <div className="text-center p-4 border rounded-md bg-muted/50 mt-4">
                        <p className="text-muted-foreground">Nenhuma variante adicionada</p>
                    </div>
                )}
            </div>
        </div>
    );
}
