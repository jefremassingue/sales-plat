<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique()->comment('Código único do método');
            $table->string('name')->comment('Nome do método de pagamento');
            $table->text('description')->nullable()->comment('Descrição do método');
            $table->text('instructions')->nullable()->comment('Instruções para o cliente');
            $table->boolean('is_active')->default(true)->comment('Se o método está ativo');
            $table->boolean('is_default')->default(false)->comment('Se é o método padrão');
            $table->integer('sort_order')->default(0)->comment('Ordem de exibição');
            $table->string('icon', 50)->nullable()->comment('Ícone (nome do ícone Lucide)');
            $table->timestamps();
            $table->softDeletes();
        });

        // Inserir métodos de pagamento padrão
        DB::table('payment_methods')->insert([
            [
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

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
