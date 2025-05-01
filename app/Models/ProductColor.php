<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductColor extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'name',
        'hex_code',
        'active',
        'order'
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Relação com o produto
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relação com as imagens associadas a esta cor
     */
    public function images()
    {
        return $this->morphMany(Image::class, 'typeable');
    }

    /**
     * Relação com as variantes que usam esta cor
     */
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }
}
