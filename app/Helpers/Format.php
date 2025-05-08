<?php

namespace App\Helpers;

class Format
{
    /**
     * Formatar valor monetário com base na moeda
     */
    public static function currency($value, $currency = null)
    {
        if (!$currency) {
            return number_format($value, 2, ',', '.') . ' MT';
        }

        $formattedValue = number_format(
            $value,
            $currency->decimal_places ?? 2,
            $currency->decimal_separator ?? ',',
            $currency->thousand_separator ?? '.'
        );

        return ($currency->symbol ?? 'MT') . ' ' . $formattedValue;
    }

    /**
     * Obter label do método de pagamento
     */
    public static function paymentMethod($method)
    {
        return match($method) {
            'cash' => 'Dinheiro',
            'card' => 'Cartão',
            'mpesa' => 'M-Pesa',
            'emola' => 'eMola',
            'bank_transfer' => 'Transferência Bancária',
            'check' => 'Cheque',
            'credit' => 'Crédito',
            default => 'Outro'
        };
    }
}
