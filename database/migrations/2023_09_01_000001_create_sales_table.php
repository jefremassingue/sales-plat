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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('sale_number')->unique()->comment('Número da venda');
            $table->foreignId('quotation_id')->nullable()->constrained()->nullOnDelete()->comment('Cotação associada');
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete()->comment('Cliente associado à venda');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete()->comment('Utilizador que criou a venda');
            $table->date('issue_date')->comment('Data de emissão');
            $table->date('due_date')->nullable()->comment('Data de vencimento para pagamento');
            $table->enum('status', ['draft', 'pending', 'paid', 'partial', 'canceled', 'overdue'])->default('draft')->comment('Estado da venda');
            $table->decimal('subtotal', 15, 2)->default(0)->comment('Subtotal sem impostos');
            $table->decimal('tax_amount', 15, 2)->default(0)->comment('Valor total de impostos');
            $table->decimal('discount_amount', 15, 2)->default(0)->comment('Valor total de descontos');
            $table->decimal('shipping_amount', 15, 2)->default(0)->comment('Valor de transporte');
            $table->decimal('total', 15, 2)->default(0)->comment('Valor total da venda');
            $table->decimal('amount_paid', 15, 2)->default(0)->comment('Valor já pago');
            $table->decimal('amount_due', 15, 2)->default(0)->comment('Valor a pagar');
            $table->string('currency_code', 3)->comment('Moeda da venda');
            $table->foreign('currency_code')->references('code')->on('currencies');
            $table->decimal('exchange_rate', 10, 4)->default(1.0000)->comment('Taxa de câmbio utilizada');
            $table->text('notes')->nullable()->comment('Notas adicionais');
            $table->text('terms')->nullable()->comment('Termos e condições');
            $table->boolean('include_tax')->default(true)->comment('Incluir impostos na venda');
            $table->text('shipping_address')->nullable()->comment('Endereço de entrega');
            $table->text('billing_address')->nullable()->comment('Endereço de faturação');
            $table->string('payment_method')->nullable()->comment('Método de pagamento');
            $table->string('reference')->nullable()->comment('Referência de pagamento ou nota');
            $table->timestamps();
            $table->softDeletes();
        });

        // Tabela para itens da venda
        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
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

        // Adicionar campo na tabela quotations para indicar venda associada
        Schema::table('quotations', function (Blueprint $table) {
            if (!Schema::hasColumn('quotations', 'converted_to_sale_id')) {
                $table->foreignId('converted_to_sale_id')->nullable()->after('converted_to_order_id')->comment('ID da venda quando a cotação for convertida');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remover a coluna adicionada à tabela quotations
        Schema::table('quotations', function (Blueprint $table) {
            if (Schema::hasColumn('quotations', 'converted_to_sale_id')) {
                $table->dropColumn('converted_to_sale_id');
            }
        });

        Schema::dropIfExists('sale_items');
        Schema::dropIfExists('sales');
    }
};
