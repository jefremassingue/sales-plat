<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'sale_id',
        'product_id',
        'product_variant_id',
        'warehouse_id',
        'name',
        'description',
        'quantity',
        'unit',
        'unit_price',
        'discount_percentage',
        'discount_amount',
        'tax_percentage',
        'tax_amount',
        'subtotal',
        'total',
    ];

    protected $casts = [
        'quantity' => 'float',
        'unit_price' => 'float',
        'discount_percentage' => 'float',
        'discount_amount' => 'float',
        'tax_percentage' => 'float',
        'tax_amount' => 'float',
        'subtotal' => 'float',
        'total' => 'float',
    ];

    /**
     * Relação com a venda
     */
    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    /**
     * Relação com o produto
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relação com a variante do produto
     */
    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }

    /**
     * Relação com o armazém
     */
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    /**
     * Calcular os valores do item
     */
    public function calculateValues()
    {
        // Calcular subtotal (quantidade * preço unitário)
        $this->subtotal = $this->quantity * $this->unit_price;

        // Calcular valor do desconto
        if ($this->discount_percentage > 0) {
            $this->discount_amount = $this->subtotal * ($this->discount_percentage / 100);
        } else {
            $this->discount_amount = 0;
        }

        // Calcular valor do imposto (após descontos)
        $this->tax_amount = ($this->subtotal - $this->discount_amount) * ($this->tax_percentage / 100);

        // Calcular total
        $this->total = $this->subtotal - $this->discount_amount + $this->tax_amount;

        return $this;
    }

    /**
     * Verificar disponibilidade no inventário
     */
    public function checkInventoryAvailability()
    {
        if (!$this->warehouse_id || !$this->product_id) {
            return true; // Não há verificação de inventário para este item
        }

        $inventoryQuery = Inventory::where('warehouse_id', $this->warehouse_id)
            ->where('product_id', $this->product_id)
            ->where('status', 'active');

        if ($this->product_variant_id) {
            $inventoryQuery->where('product_variant_id', $this->product_variant_id);
        } else {
            $inventoryQuery->whereNull('product_variant_id');
        }

        $inventory = $inventoryQuery->first();

        if (!$inventory) {
            return false;
        }

        return $inventory->quantity >= $this->quantity;
    }

    /**
     * Atualizar o inventário quando o item é vendido
     */
    public function updateInventory($quantity = null)
    {
        if (!$this->warehouse_id || !$this->product_id) {
            return false; // Não há inventário para atualizar
        }

        $quantityToDeduct = $quantity ?? $this->quantity;

        $inventoryQuery = Inventory::where('warehouse_id', $this->warehouse_id)
            ->where('product_id', $this->product_id);

        if ($this->product_variant_id) {
            $inventoryQuery->where('product_variant_id', $this->product_variant_id);
        } else {
            $inventoryQuery->whereNull('product_variant_id');
        }

        $inventory = $inventoryQuery->first();

        if (!$inventory) {
            return false;
        }

        $inventory->quantity -= $quantityToDeduct;
        $inventory->save();

        return true;
    }
}
