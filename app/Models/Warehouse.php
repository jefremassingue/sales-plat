<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    use HasFactory;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'code',
        'address',
        'city',
        'province',
        'postal_code',
        'country',
        'phone',
        'email',
        'description',
        'is_main',
        'active',
        'manager_id',
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_main' => 'boolean',
        'active' => 'boolean',
    ];

    /**
     * Obter o gestor do armazém.
     */
    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Obter os produtos do armazém.
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_warehouse')
            ->withPivot('stock', 'min_stock', 'location')
            ->withTimestamps();
    }
}
