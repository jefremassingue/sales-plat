<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BlogCategory extends Model
{
    use HasFactory, SoftDeletes, HasUlids;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'parent_id',
        'active',
        'order',
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Definir o slug automaticamente a partir do nome e garantir que seja único.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($category) {
            if (!$category->slug) {
                $category->slug = self::generateUniqueSlug($category->name);
            } else {
                $category->slug = self::generateUniqueSlug($category->slug, $category->id);
            }
        });

        static::updating(function ($category) {
            if ($category->isDirty('name') && !$category->isDirty('slug')) {
                $category->slug = self::generateUniqueSlug($category->name, $category->id);
            } elseif ($category->isDirty('slug')) {
                $category->slug = self::generateUniqueSlug($category->slug, $category->id);
            }
        });
    }

    /**
     * Gerar um slug único baseado no nome ou texto fornecido.
     *
     * @param string $text O texto para converter em slug
     * @param string|null $excludeId ID a ser excluído da verificação de unicidade (para atualizações)
     * @return string O slug único
     */
    protected static function generateUniqueSlug(string $text, ?string $excludeId = null): string
    {
        $baseSlug = Str::slug($text);
        $slug = $baseSlug;
        $counter = 1;

        // Verificar se o slug já existe (excluindo o próprio registo no caso de atualização)
        $query = self::query()->where('slug', $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        // Enquanto existir um slug igual, adicionar um número incremental no final
        while ($query->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $query = self::query()->where('slug', $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
            $counter++;
        }

        return $slug;
    }

    /**
     * Obter a categoria pai.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(BlogCategory::class, 'parent_id');
    }

    /**
     * Obter as categorias filhas.
     */
    public function children(): HasMany
    {
        return $this->hasMany(BlogCategory::class, 'parent_id');
    }
    /**
     * Obter as categorias filhas.
     */
    public function subcategories(): HasMany
    {
        return $this->hasMany(BlogCategory::class, 'parent_id');
    }

    /**
     * Obter todas as categorias filhas recursivamente.
     */
    public function childrenRecursive(): HasMany
    {
        return $this->children()->with('childrenRecursive');
    }

    /**
     * Verificar se a categoria tem filhos.
     */
    public function hasChildren(): bool
    {
        return $this->children()->exists();
    }

    /**
     * Obter todas as categorias de nível superior (sem pai).
     */
    public static function rootCategories()
    {
        return static::whereNull('parent_id')->orderBy('order')->get();
    }

    /**
     * Obter a árvore completa de categorias.
     */
    public static function getTree()
    {
        return static::with('childrenRecursive')
            ->whereNull('parent_id')
            ->orderBy('order')
            ->get();
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
