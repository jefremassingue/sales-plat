<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductAttribute extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'product_id',
        'name',
        'value',
        'description',
        'type',
        'filterable',
        'visible',
        'order'
    ];

    protected $casts = [
        'filterable' => 'boolean',
        'visible' => 'boolean',
    ];

    /**
     * Relação com o produto
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
