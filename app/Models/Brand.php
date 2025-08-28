<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'logo',
    ];

    protected $appends = [
        'logo_url',
    ];

    /**
     * Acessa a URL da imagem do logo
     */
    public function getLogoUrlAttribute()
    {
        return $this->logo ? asset("files/{$this->logo}") : null;
    }

    /**
     * Gera automaticamente um slug ao criar a marca
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($brand) {
            if (empty($brand->slug)) {
                $slug = Str::slug($brand->name);
                if (Brand::where('slug', $slug)->exists()) {
                    $slug .= '-' . uniqid();
                }
                $brand->slug = $slug;
            }
        });
    }

    /**
     * Relação com produtos
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
