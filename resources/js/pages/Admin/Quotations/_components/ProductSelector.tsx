import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PackageSearch } from 'lucide-react';
import { useState } from 'react';
import { Product } from './types';

interface ProductSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products: Product[];
    onSelect: (productId: string) => void;
    onAddItemManual: () => void;
    setOnSearch: (search: string) => void;
}

export default function ProductSelector({ open, onOpenChange, products, onSelect, onAddItemManual, setOnSearch }: ProductSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

    // Filtrar produtos com base na pesquisa
    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())),
    );

    const handleSelect = (productId: string) => {
        setSelectedProduct(productId);
        onSelect(productId);

        handleConfirm();
    };

    const handleConfirm = () => {
        if (selectedProduct) {
            console.log(selectedProduct);

            onSelect(selectedProduct);
            setSelectedProduct(null);
            setSearchQuery('');
        }
    };

    // Limpar seleção quando o diálogo é fechado
    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setSelectedProduct(null);
            setSearchQuery('');
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="flex h-[80vh] w-full max-w-full flex-col sm:max-w-lg md:max-w-xl lg:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Selecionar Produto</DialogTitle>
                </DialogHeader>

                <div className="flex flex-1 flex-col py-4">
                    <Input
                        placeholder="Pesquisar por nome ou SKU"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setOnSearch(e.target.value);
                        }}
                        className="mb-4"
                    />

                    <div className="max-h-[60vh] flex-1 overflow-y-auto">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <Card
                                        key={product.id}
                                        onClick={() => handleSelect(product.id)}
                                        className={`hover:bg-muted cursor-pointer transition-colors ${selectedProduct === product.id.toString() ? 'bg-primary/10' : ''}`}
                                    >
                                        <CardHeader>
                                            <div className="flex gap-2">
                                                {product.main_image ? (
                                                    <img
                                                        src={
                                                            product.main_image.versions?.find((image) => image.version == 'md')?.url ||
                                                            product.main_image.versions?.find((image) => image.version == 'lg')?.url ||
                                                            product.main_image.url
                                                        }
                                                        alt={product.name}
                                                        className="h-24 min-h-24 w-24 min-w-24 object-contain transition-all hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-24 min-h-24 w-24 min-w-24 items-center justify-center bg-gray-100 dark:bg-gray-800">
                                                        <PackageSearch className="h-10 w-10 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="">
                                                    <CardDescription>SKU: {product.sku || 'N/A'}</CardDescription>
                                                    <p className="text-lg font-semibold">
                                                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN' }).format(product.price)}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <CardTitle>{product.name}</CardTitle>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-muted-foreground col-span-full py-8 text-center">
                                    <p>Nenhum produto encontrado.</p>
                                    <Button
                                        onClick={() => {
                                            onAddItemManual();
                                            setSearchQuery('');
                                        }}
                                    >
                                        Adicionar item manual
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirm} disabled={!selectedProduct}>
                            Confirmar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
