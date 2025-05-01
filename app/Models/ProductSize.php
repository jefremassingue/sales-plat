<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductSize extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'name',
        'code',
        'description',
        'available',
        'order'
    ];

    protected $casts = [
        'available' => 'boolean',
    ];

    /**
     * Relação com o produto
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relação com as variantes que usam este tamanho
     */
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }
}
