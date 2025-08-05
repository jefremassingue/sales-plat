<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'code',
        'name',
        'description',
        'instructions',
        'is_active',
        'is_default',
        'sort_order',
        'icon',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Método para obter todos os métodos de pagamento ativos
     */
    public static function getActivePaymentMethods()
    {
        return self::where('is_active', true)
                   ->orderBy('sort_order')
                   ->orderBy('name')
                   ->get();
    }

    /**
     * Método para obter o método de pagamento padrão
     */
    public static function getDefaultPaymentMethod()
    {
        return self::where('is_default', true)
                   ->where('is_active', true)
                   ->first();
    }

    /**
     * Relação com os pagamentos
     */
    public function payments()
    {
        return $this->hasMany(Payment::class, 'payment_method', 'code');
    }

    /**
     * Obter array formatado para uso em seletores
     */
    public static function getSelectOptions()
    {
        $methods = self::where('is_active', true)
                       ->orderBy('sort_order')
                       ->orderBy('name')
                       ->get(['code', 'name', 'icon']);

        return $methods->map(function($method) {
            return [
                'value' => $method->code,
                'label' => $method->name,
                'icon' => $method->icon
            ];
        });
    }
}
