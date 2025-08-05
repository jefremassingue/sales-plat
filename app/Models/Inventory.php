<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory, HasUlids;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'product_id',
        'product_variant_id',
        'warehouse_id',
        'quantity',
        'min_quantity',
        'max_quantity',
        'location',
        'batch_number',
        'expiry_date',
        'unit_cost',
        'old_cost',
        'status',
        'notes',
        'user_id',
    ];

    /**
     * Os atributos que devem ser convertidos para tipos nativos.
     *
     * @var array
     */
    protected $casts = [
        'expiry_date' => 'date',
        'unit_cost' => 'decimal:2',
    ];

    /**
     * Obtém o produto associado a este inventário.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Obtém a variante do produto associada a este inventário.
     */
    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }

    /**
     * Obtém o armazém associado a este inventário.
     */
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    /**
     * Obtém o utilizador que atualizou este registo pela última vez.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Obtém os ajustes de inventário associados a este registo.
     */
    public function adjustments()
    {
        return $this->hasMany(InventoryAdjustment::class);
    }
}
