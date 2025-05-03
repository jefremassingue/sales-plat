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
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->string('quotation_number')->unique()->comment('Número da cotação');
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete()->comment('Cliente associado à cotação');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete()->comment('Utilizador que criou a cotação');
            $table->date('issue_date')->comment('Data de emissão');
            $table->date('expiry_date')->nullable()->comment('Data de validade da cotação');
            $table->enum('status', ['draft', 'sent', 'approved', 'rejected', 'expired', 'converted'])->default('draft')->comment('Estado da cotação');
            $table->decimal('subtotal', 15, 2)->default(0)->comment('Subtotal sem impostos');
            $table->decimal('tax_amount', 15, 2)->default(0)->comment('Valor total de impostos');
            $table->decimal('discount_amount', 15, 2)->default(0)->comment('Valor total de descontos');
            $table->decimal('total', 15, 2)->default(0)->comment('Valor total da cotação');
            $table->string('currency_code', 3)->comment('Moeda da cotação');
            $table->foreign('currency_code')->references('code')->on('currencies');
            $table->decimal('exchange_rate', 10, 4)->default(1.0000)->comment('Taxa de câmbio utilizada');
            $table->text('notes')->nullable()->comment('Notas adicionais');
            $table->text('terms')->nullable()->comment('Termos e condições');
            $table->boolean('include_tax')->default(true)->comment('Incluir impostos na cotação');
            $table->foreignId('converted_to_order_id')->nullable()->comment('ID da encomenda caso convertida');
            $table->timestamps();
            $table->softDeletes();
        });

        // Tabela para itens da cotação
        Schema::create('quotation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('warehouse_id')->nullable()->constrained()->nullOnDelete()->comment('Armazém de onde o item será separado');
            $table->string('name')->comment('Nome do produto ou serviço');
            $table->text('description')->nullable()->comment('Descrição detalhada');
            $table->decimal('quantity', 10, 2)->comment('Quantidade');
            $table->string('unit', 20)->nullable()->default('unit')->comment('Unidade de medida');
            $table->decimal('unit_price', 15, 2)->comment('Preço unitário');
            $table->decimal('discount_percentage', 5, 2)->default(0)->comment('Percentagem de desconto');
            $table->decimal('discount_amount', 15, 2)->default(0)->comment('Valor de desconto');
            $table->decimal('tax_percentage', 5, 2)->default(0)->comment('Percentagem de imposto');
            $table->decimal('tax_amount', 15, 2)->default(0)->comment('Valor de imposto');
            $table->decimal('subtotal', 15, 2)->default(0)->comment('Subtotal sem impostos e descontos');
            $table->decimal('total', 15, 2)->default(0)->comment('Total do item com impostos e descontos');
            $table->integer('sort_order')->default(0)->comment('Ordem de exibição do item');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotation_items');
        Schema::dropIfExists('quotations');
    }
};
