<?php

namespace App\Models;

use App\Enums\UnitEnum;
use App\Helpers\SearchSynonyms;
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
                $slugBase = Str::slug($product->name);
                if (Product::where('slug', $slugBase)->exists()) {
                    $latestSlug = Product::where('slug', 'LIKE', $slugBase . '%')
                        ->orderByDesc('slug')
                        ->value('slug');

                    $number = 1;
                    if ($latestSlug && preg_match('/-(\d+)$/', $latestSlug, $matches)) {
                        $number = (int)$matches[1] + 1;
                    }
                    $product->slug = $slugBase . '-' . $number;
                } else {
                    $product->slug = $slugBase;
                }
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


    /**
     * Relação com itens de cotação
     */
    public function quotationItems()
    {
        return $this->hasMany(QuotationItem::class);
    }

    /**
     * Relação com itens de venda
     */
    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    /**
     * Busca full-text usando MySQL MATCH AGAINST com suporte a sinônimos
     * 
     * @param string $search
     * @param string $mode - IN BOOLEAN MODE, IN NATURAL LANGUAGE MODE, WITH QUERY EXPANSION
     * @param bool $useSynonyms - Se deve usar sinônimos na busca
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public static function fullTextSearch($search, $mode = 'IN BOOLEAN MODE', $useSynonyms = false)
    {
        // Limpar e preparar o termo de busca
        $search = trim($search);

        if (empty($search)) {
            return static::query();
        }

        // Expandir com sinônimos se solicitado
        if ($useSynonyms) {
            $expandedSearch = SearchSynonyms::expandPhrase($search);
        } else {
            $expandedSearch = $search;
        }

        // Escapar caracteres especiais para MySQL FULLTEXT
        $escapedSearch = str_replace(['@', '+', '-', '>', '<', '(', ')', '~', '*', '"'], '', $expandedSearch);

        // Para boolean mode, podemos adicionar wildcards
        if ($mode === 'IN BOOLEAN MODE') {
            if ($useSynonyms) {
                // Usar o método do helper para criar query boolean com sinônimos
                $booleanSearch = SearchSynonyms::createBooleanQuery($search);
            } else {
                $searchTerms = explode(' ', $escapedSearch);
                $booleanSearch = '+' . implode('* +', $searchTerms) . '*';
            }
        } else {
            $booleanSearch = $escapedSearch;
        }

        return static::where(function ($query) use ($booleanSearch, $mode, $search) {
            // Busca full-text nos campos do produto principal
            $query->whereRaw(
                "MATCH(name, description, technical_details, features, sku) AGAINST(? {$mode})",
                [$booleanSearch]
            )
                ->orWhereHas('variants', function ($variantQuery) use ($search) {
                    $searchTerms = explode(' ', $search);
                    foreach ($searchTerms as $term) {
                        $searchTerms2 = explode('-', $term);
                        $variantQuery->orWhere(function ($q) use ($searchTerms2) {
                            foreach ($searchTerms2 as $term2) {
                                $q->where('sku', 'like', "%{$term2}%")
                                    ->orWhere('barcode', 'like', "%{$term2}%");
                            }
                        });
                    }
                })
            ;
        })->orderByRaw(
            "MATCH(name, description, technical_details, features, sku) AGAINST(? {$mode}) DESC",
            [$booleanSearch]
        );
    }

    /**
     * Busca full-text com relevância para produtos ativos
     * 
     * @param string $search
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFullTextSearchActive($query, $search)
    {
        return $this->fullTextSearch($search)
            ->where('active', true);
    }

    /**
     * Busca combinada: full-text + LIKE como fallback com suporte a sinônimos
     * 
     * @param string $search
     * @param bool $ecommerceOnly - Se deve filtrar apenas produtos para e-commerce
     * @param bool $useSynonyms - Se deve usar sinônimos na busca
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public static function smartSearch($search, $ecommerceOnly = false, $useSynonyms = false)
    {
        $search = trim($search);

        if (empty($search)) {
            $query = static::query();
            if ($ecommerceOnly) {
                $query->where('active', true)->whereHas('ecommerce_inventory');
            }
            return $query;
        }

        // Expandir com sinônimos se solicitado e termo for longo o suficiente
        $expandedTerms = [];
        if ($useSynonyms && strlen($search) >= 2) {
            $words = explode(' ', $search);
            foreach ($words as $word) {
                $expandedTerms = array_merge($expandedTerms, SearchSynonyms::expandTerm($word));
            }
            $expandedTerms = array_unique($expandedTerms);
        }

        // Usar full-text search se o termo for longo o suficiente (≥3 caracteres)
        if (strlen($search) >= 3) {
            $query = static::fullTextSearch($search, 'IN BOOLEAN MODE', $useSynonyms);
        } else {
            // Para termos curtos, usar LIKE tradicional incluindo variantes e sinônimos
            $query = static::where(function ($q) use ($search, $expandedTerms, $useSynonyms) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");

                // Adicionar busca por sinônimos com LIKE
                if ($useSynonyms && !empty($expandedTerms)) {
                    foreach ($expandedTerms as $term) {
                        if ($term !== $search) { // Evitar duplicação
                            $q->orWhere('name', 'like', "%{$term}%")
                                ->orWhere('description', 'like', "%{$term}%")
                                ->orWhere('sku', 'like', "%{$term}%");
                        }
                    }
                }

                // Busca em variantes
                $q->orWhereHas('variants', function ($variantQuery) use ($search, $expandedTerms, $useSynonyms) {
                    $variantQuery->where('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");

                    // Buscar sinônimos nas variantes também
                    if ($useSynonyms && !empty($expandedTerms)) {
                        foreach ($expandedTerms as $term) {
                            if ($term !== $search) {
                                $variantQuery->orWhere('sku', 'like', "%{$term}%")
                                    ->orWhere('barcode', 'like', "%{$term}%");
                            }
                        }
                    }
                });
            });
        }

        // Aplicar filtros de e-commerce se solicitado
        if ($ecommerceOnly) {
            $query->where('active', true)->whereHas('ecommerce_inventory');
        }

        return $query;
    }
}
