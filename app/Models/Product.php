<?php

namespace App\Models;

use App\Enums\UnitEnum;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'description_pdf',
        'technical_details',
        'features',
        'price',
        'cost',
        'sku',
        'barcode',
        'weight',
        'category_id',
        'active',
        'featured',
        'certification',
        'warranty',
        'brand_id',
        'origin_country',
        'currency',
        'unit'
    ];
    /**
     * Relação com a marca
     */
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    protected $casts = [
        'price' => 'float',
        'cost' => 'float',
        'weight' => 'float',
        'active' => 'boolean',
        'featured' => 'boolean',
        'unit' => UnitEnum::class,
    ];

    protected $appends = ['total_stock', 'inventory_price', 'description_pdf_url'];

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
     * Relação com os itens de inventário
     */
    public function inventories()
    {
        return $this->hasMany(Inventory::class);
    }

    /**
     * Relação com os itens de inventário
     */
    public function ecommerce_inventory()
    {
        return $this->hasOne(Inventory::class)
            ->whereHas('warehouse', function ($query) {
                $query->where('active', true)
                    ->where('available_for_ecommerce', true);
            });;
    }

    /**
     * Obter o estoque total do produto em todos os armazéns
     */
    public function getTotalStockAttribute()
    {
        return $this->inventories()
            ->where('status', 'active')
            ->sum('quantity');
    }

    /**
     * Obter o preço médio do produto no inventário
     */
    public function getInventoryPriceAttribute()
    {
        $averageUnitCost = $this->inventories()
            ->where('status', 'active')
            ->where('unit_cost', '>', 0)
            ->avg('unit_cost');

        // Se não encontrar preço no inventário, usa o preço de referência do produto
        return $averageUnitCost ?: $this->price;
    }

    /**
     * Verificar se um produto tem estoque disponível
     */
    public function hasStock()
    {
        return $this->total_stock > 0;
    }

    /**
     * Obter o estoque do produto num armazém específico
     */
    public function stockInWarehouse($warehouseId)
    {
        return $this->inventories()
            ->where('warehouse_id', $warehouseId)
            ->where('status', 'active')
            ->sum('quantity');
    }

    /**
     * Obter o preço unitário mais recente no inventário
     */
    public function getLatestUnitCost()
    {
        $latestInventory = $this->inventories()
            ->where('status', 'active')
            ->where('unit_cost', '>', 0)
            ->orderByDesc('created_at')
            ->first();

        return $latestInventory ? $latestInventory->unit_cost : $this->price;
    }

    /**
     * Obter o nome formatado da unidade para exibição
     */
    public function getUnitLabelAttribute(): string
    {
        return $this->unit ? $this->unit->label() : UnitEnum::UNIT->label();
    }

    /**
     * Retorna a URL do PDF da descrição, se existir
     */
    public function getDescriptionPdfUrlAttribute()
    {
        if ($this->description_pdf) {
            return asset('files/' . $this->description_pdf);
        }
        return null;
    }
}
