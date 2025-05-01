<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'technical_details',
        'features',
        'price',
        'cost',
        'sku',
        'barcode',
        'weight',
        'category_id',
        'stock',
        'active',
        'featured',
        'certification',
        'warranty',
        'brand',
        'origin_country',
        'currency'
    ];

    protected $casts = [
        'price' => 'float',
        'cost' => 'float',
        'weight' => 'float',
        'active' => 'boolean',
        'featured' => 'boolean',
    ];

    /**
     * Gera automaticamente um slug ao criar o produto
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    /**
     * Relação com a categoria
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relação com as imagens
     */
    public function images()
    {
        return $this->morphMany(Image::class, 'typeable');
    }

    /**
     * Método para obter a imagem principal
     */
    public function mainImage()
    {
        return $this->morphOne(Image::class, 'typeable')
            ->where('is_main', true);
    }

    /**
     * Relação com as cores disponíveis
     */
    public function colors()
    {
        return $this->hasMany(ProductColor::class);
    }

    /**
     * Relação com os tamanhos disponíveis
     */
    public function sizes()
    {
        return $this->hasMany(ProductSize::class);
    }

    /**
     * Relação com os atributos do produto
     */
    public function attributes()
    {
        return $this->hasMany(ProductAttribute::class);
    }

    /**
     * Relação com as variantes do produto
     */
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Verificar se um produto tem estoque disponível
     */
    public function hasStock()
    {
        return $this->stock > 0;
    }
}
