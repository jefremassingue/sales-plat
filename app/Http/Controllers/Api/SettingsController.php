<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Obter a moeda padrão do sistema
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDefaultCurrency()
    {
        try {
            $currency = Currency::where('is_default', true)->first();

            if (!$currency) {
                // Se não houver moeda padrão, usar a primeira moeda ativa
                $currency = Currency::where('is_active', true)->first();

                if (!$currency) {
                    // Criar uma moeda padrão para Metical Moçambicano
                    $currency = Currency::create([
                        'code' => 'MZN',
                        'name' => 'Metical Moçambicano',
                        'symbol' => 'MT',
                        'exchange_rate' => 1.0000,
                        'is_default' => true,
                        'is_active' => true,
                        'decimal_separator' => ',',
                        'thousand_separator' => '.',
                        'decimal_places' => 2,
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'currency' => $currency,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao obter moeda padrão: ' . $e->getMessage(),
            ], 500);
        }
    }
}
