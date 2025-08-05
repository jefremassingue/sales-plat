<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('payment_methods')->insert([
            [
                'id' => \Illuminate\Support\Str::ulid(),
                'code' => 'cash',
                'name' => 'Dinheiro',
                'description' => 'Pagamento em dinheiro na entrega ou no levantamento',
                'instructions' => 'Tenha o valor exato, se possível',
                'is_active' => true,
                'is_default' => true,
                'sort_order' => 1,
                'icon' => 'banknote',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => \Illuminate\Support\Str::ulid(),
                'code' => 'bank_transfer',
                'name' => 'Transferência Bancária',
                'description' => 'Transferência para a nossa conta bancária',
                'instructions' => 'Por favor inclua o número da venda na descrição da transferência',
                'is_active' => true,
                'is_default' => false,
                'sort_order' => 2,
                'icon' => 'building-bank',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => \Illuminate\Support\Str::ulid(),
                'code' => 'mpesa',
                'name' => 'M-Pesa',
                'description' => 'Pagamento através do serviço M-Pesa',
                'instructions' => 'Envie o pagamento para o número XXXXX e forneça o código de transação',
                'is_active' => true,
                'is_default' => false,
                'sort_order' => 3,
                'icon' => 'smartphone',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => \Illuminate\Support\Str::ulid(),
                'code' => 'credit_card',
                'name' => 'Cartão de Crédito/Débito',
                'description' => 'Pagamento com cartão na loja ou entrega',
                'instructions' => 'Aceitamos Visa, Mastercard e outros cartões principais',
                'is_active' => true,
                'is_default' => false,
                'sort_order' => 4,
                'icon' => 'credit-card',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
