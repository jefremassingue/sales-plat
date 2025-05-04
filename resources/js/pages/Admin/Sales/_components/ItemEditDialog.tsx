import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface ItemProps {
  id?: number;
  product_id?: string;
  product_variant_id?: string;
  warehouse_id?: string;
  name: string;
  description?: string;
  quantity: string;
  unit?: string;
  unit_price: string;
  discount_percentage?: string;
  tax_percentage?: string;
}

interface ItemEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemProps;
  onSave: (item: ItemProps) => void;
  warehouses: Array<{ id: number; name: string }>;
  taxRates: Array<{ id: number; value: number; label: string }>;
  units: Array<{ value: string; label: string }>;
}

export default function ItemEditDialog({
  open,
  onOpenChange,
  item,
  onSave,
  warehouses,
  taxRates,
  units
}: ItemEditDialogProps) {
  const [editedItem, setEditedItem] = useState<ItemProps>(item);

  const handleChange = (field: keyof ItemProps, value: string) => {
    setEditedItem(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(editedItem);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">Nome</label>
            <Input
              id="name"
              value={editedItem.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">Descrição</label>
            <Textarea
              id="description"
              value={editedItem.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <label htmlFor="quantity" className="text-sm font-medium">Quantidade</label>
              <Input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={editedItem.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="unit" className="text-sm font-medium">Unidade</label>
              <Select
                value={editedItem.unit || 'unit'}
                onValueChange={(value) => handleChange('unit', value)}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="warehouse" className="text-sm font-medium">Armazém</label>
              <Select
                value={editedItem.warehouse_id || ''}
                onValueChange={(value) => handleChange('warehouse_id', value)}
              >
                <SelectTrigger id="warehouse">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <label htmlFor="price" className="text-sm font-medium">Preço Unitário</label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={editedItem.unit_price}
                onChange={(e) => handleChange('unit_price', e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="discount" className="text-sm font-medium">Desconto (%)</label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={editedItem.discount_percentage || '0'}
                onChange={(e) => handleChange('discount_percentage', e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="tax" className="text-sm font-medium">IVA (%)</label>
              <Select
                value={editedItem.tax_percentage || '16'}
                onValueChange={(value) => handleChange('tax_percentage', value)}
              >
                <SelectTrigger id="tax">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {taxRates.map((rate) => (
                    <SelectItem key={rate.id} value={rate.value.toString()}>
                      {rate.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Guardar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
