import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { Product } from './types';

interface ProductSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onSelect: (productId: string) => void;
}

export default function ProductSelector({
  open,
  onOpenChange,
  products,
  onSelect,
}: ProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Filtrar produtos com base na pesquisa
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelect = (productId: string) => {
    setSelectedProduct(productId);
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
      <DialogContent className="w-full max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecionar Produto</DialogTitle>
        </DialogHeader>

        <div className="py-4 flex flex-col flex-1">
          <Input
            placeholder="Pesquisar por nome ou SKU"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          <div className="flex-1 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2  gap-4 ">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    onClick={() => handleSelect(product.id)}
                    className={`cursor-pointer hover:bg-muted transition-colors ${selectedProduct === product.id.toString() ? 'bg-primary/10' : ''}`}
                  >
                    <CardHeader>

                      <CardTitle>{product.name}</CardTitle>
                      <CardDescription>SKU: {product.sku || 'N/A'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">
                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN' }).format(product.price)}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Nenhum produto encontrado.
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
