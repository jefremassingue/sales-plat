<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuotationItem extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'quotation_id',
        'product_id',
    'product_color_id',
    'product_size_id',
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
        'sort_order',
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
     * Relação com a cotação
     */
    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
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
     * Obter a disponibilidade de stock para este item
     */
    public function getInventoryAvailability()
    {
        if (!$this->warehouse_id || !$this->product_id) {
            return null; // Sem informações de inventário
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
            return 0;
        }

        return $inventory->quantity;
    }
}
