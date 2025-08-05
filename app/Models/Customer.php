<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes, HasUlids;

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
        'address',
        'city',
        'province',
        'postal_code',
        'country',
        'notes',
        'active',
        'birth_date',
        'contact_person',
        'billing_address',
        'shipping_address',
        'website',
        'client_type',
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'active' => 'boolean',
        'birth_date' => 'date',
    ];

    /**
     * Scope para filtrar apenas clientes activos.
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope para filtrar por tipo de cliente (individual ou empresa).
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('client_type', $type);
    }

    /**
     * Obter o utilizador associado ao cliente.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Verificar se o cliente é uma empresa.
     */
    public function isCompany(): bool
    {
        return $this->client_type === 'company';
    }

    /**
     * Verificar se o cliente é um indivíduo.
     */
    public function isIndividual(): bool
    {
        return $this->client_type === 'individual';
    }

    /**
     * Obter o endereço completo formatado.
     */
    public function getFullAddressAttribute(): string
    {
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
