<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'symbol',
        'exchange_rate',
        'is_default',
        'is_active',
        'decimal_separator',
        'thousand_separator',
        'decimal_places',
    ];

    protected $casts = [
        'exchange_rate' => 'float',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'decimal_places' => 'integer',
    ];

    /**
     * Obter a moeda padrão do sistema
     *
     * @return \App\Models\Currency|null
     */
    public static function getDefaultCurrency()
    {
        return self::where('is_default', true)->first();
    }

    /**
     * Converter um valor para esta moeda a partir da moeda padrão.
     *
     * @param float $amount Valor na moeda padrão
     * @return float Valor convertido para esta moeda
     */
    public function convertFromDefault($amount)
    {
        return $amount * $this->exchange_rate;
    }

    /**
     * Converter um valor desta moeda para a moeda padrão.
     *
     * @param float $amount Valor nesta moeda
     * @return float Valor convertido para a moeda padrão
     */
    public function convertToDefault($amount)
    {
        if ($this->exchange_rate == 0) {
            return 0;
        }

        return $amount / $this->exchange_rate;
    }

    /**
     * Formatar um valor numérico de acordo com as configurações desta moeda.
     *
     * @param float $amount Valor a ser formatado
     * @param bool $includeSymbol Se deve incluir o símbolo da moeda
     * @return string Valor formatado
     */
    public function format($amount, $includeSymbol = true)
    {
        $value = number_format(
            $amount,
            $this->decimal_places,
            $this->decimal_separator,
            $this->thousand_separator
        );

        if ($includeSymbol) {
            return $this->symbol . ' ' . $value;
        }

        return $value;
    }

    /**
     * Verifica se a moeda está ativa
     *
     * @return bool
     */
    public function isActive()
    {
        return $this->is_active;
    }

    /**
     * Verifica se a moeda é a padrão
     *
     * @return bool
     */
    public function isDefault()
    {
        return $this->is_default;
    }

    /**
     * Scope para obter apenas moedas ativas
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
