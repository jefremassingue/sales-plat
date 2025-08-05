<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'product_id',
        'product_color_id',
        'product_size_id',
        'sku',
        'barcode',
        'price',
        'stock',
        'active',
        'attributes'
    ];

    protected $casts = [
        'price' => 'float',
        'active' => 'boolean',
        'attributes' => 'json',
    ];

    /**
     * Relação com o produto principal
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relação com a cor
     */
    public function color()
    {
        return $this->belongsTo(ProductColor::class, 'product_color_id');
    }

    /**
     * Relação com o tamanho
     */
    public function size()
    {
        return $this->belongsTo(ProductSize::class, 'product_size_id');
    }

    /**
     * Verificar se a variante tem estoque
     */
    public function hasStock()
    {
        return $this->stock > 0;
    }

    /**
     * Obter o preço final da variante (ou o preço do produto se não estiver definido)
     */
    public function getFinalPrice()
    {
        return $this->price ?: $this->product->price;
    }
}
