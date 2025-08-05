import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Selecionar Produto</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Input
            placeholder="Pesquisar por nome ou SKU"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          <div className="rounded-md border max-h-[400px]  overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Nome</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow
                      key={product.id}
                      onClick={() => handleSelect(product.id.toString())}
                      className={`cursor-pointer hover:bg-muted transition-colors ${selectedProduct === product.id.toString() ? 'bg-primary/10' : ''}`}
                    >
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'MZN' }).format(product.price)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(product.id.toString());
                          }}
                          variant="secondary"
                        >
                          Selecionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
