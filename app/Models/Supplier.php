<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'company_name',
        'tax_id',
        'email',
        'phone',
        'mobile',
        'supplier_type',
        'address',
        'city',
        'province',
        'postal_code',
        'country',
        'billing_address',
        'bank_name',
        'bank_account',
        'bank_branch',
        'contact_person',
        'website',
        'notes',
        'payment_terms',
        'credit_limit',
        'currency',
        'active',
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'active' => 'boolean',
        'credit_limit' => 'float',
    ];

    /**
     * Os atributos que devem ter valores padrão.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'active' => true,
        'supplier_type' => 'products',
        'country' => 'Mozambique',
        'currency' => 'MZN',
    ];

    /**
     * Scope para filtrar fornecedores ativos.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope para filtrar por tipo de fornecedor.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $type
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('supplier_type', $type);
    }

    /**
     * Obtém o utilizador associado a este fornecedor, se existir.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Obtém os produtos associados a este fornecedor.
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Verificar se o fornecedor fornece produtos.
     */
    public function providesProducts(): bool
    {
        return in_array($this->supplier_type, ['products', 'both']);
    }

    /**
     * Verificar se o fornecedor fornece serviços.
     */
    public function providesServices(): bool
    {
        return in_array($this->supplier_type, ['services', 'both']);
    }

    /**
     * Obter o endereço completo formatado.
     */
    public function getFullAddressAttribute(): string
    {
        if (!$this->address) {
            return '';
        }

        $address = $this->address;
        if ($this->city) {
            $address .= ', ' . $this->city;
        }
        if ($this->province) {
            $address .= ', ' . $this->province;
        }
        if ($this->postal_code) {
            $address .= ', ' . $this->postal_code;
        }
        if ($this->country) {
            $address .= ', ' . $this->country;
        }
        return $address;
    }
}
