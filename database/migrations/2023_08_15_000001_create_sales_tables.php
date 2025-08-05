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
            $table->ulid('id')->primary();
            $table->string('sale_number')->unique()->comment('Número da venda');
            $table->foreignUlid('customer_id')->nullable()->constrained()->nullOnDelete()->comment('Cliente associado à venda');
            $table->foreignUlid('user_id')->nullable()->constrained()->nullOnDelete()->comment('Utilizador que criou a venda');
            $table->date('issue_date')->comment('Data de emissão');
            $table->date('due_date')->nullable()->comment('Data de vencimento');
            $table->enum('status', ['draft', 'pending', 'paid', 'partial', 'cancelled'])->default('pending')->comment('Estado da venda');
            $table->decimal('subtotal', 15, 2)->default(0)->comment('Subtotal sem impostos');
            $table->decimal('tax_amount', 15, 2)->default(0)->comment('Valor total de impostos');
            $table->decimal('discount_amount', 15, 2)->default(0)->comment('Valor total de descontos');
            $table->decimal('shipping_amount', 15, 2)->default(0)->comment('Valor do frete');
            $table->decimal('total', 15, 2)->default(0)->comment('Valor total da venda');
            $table->decimal('amount_paid', 15, 2)->default(0)->comment('Valor pago');
            $table->decimal('amount_due', 15, 2)->default(0)->comment('Valor em dívida');
            $table->string('payment_method')->nullable()->comment('Método de pagamento principal');
            $table->string('currency_code', 3)->comment('Moeda da venda');
            $table->foreign('currency_code')->references('code')->on('currencies');
            $table->decimal('exchange_rate', 10, 4)->default(1.0000)->comment('Taxa de câmbio utilizada');
            $table->text('notes')->nullable()->comment('Notas adicionais');
            $table->text('terms')->nullable()->comment('Termos e condições');
            $table->boolean('include_tax')->default(true)->comment('Incluir impostos na venda');
            $table->string('reference')->nullable()->comment('Referência externa');
            $table->foreignUlid('quotation_id')->nullable()->comment('Cotação de origem, se aplicável');
            $table->text('shipping_address')->nullable()->comment('Endereço de entrega');
            $table->text('billing_address')->nullable()->comment('Endereço de faturação');
            $table->timestamps();
            $table->softDeletes();
        });

        // Tabela para itens da venda
        Schema::create('sale_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('sale_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('warehouse_id')->nullable()->constrained()->nullOnDelete()->comment('Armazém de onde o item foi separado');
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
            $table->timestamps();
        });

        // Tabela para pagamentos
        Schema::create('sale_payments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('sale_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 15, 2)->comment('Valor do pagamento');
            $table->string('payment_method')->comment('Método de pagamento utilizado');
            $table->datetime('payment_date')->comment('Data e hora do pagamento');
            $table->string('reference')->nullable()->comment('Referência do pagamento');
            $table->text('notes')->nullable()->comment('Notas sobre o pagamento');
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('completed');
            $table->foreignUlid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('transaction_id')->nullable()->comment('ID da transação externa');
            $table->timestamps();
            $table->softDeletes();
        });

        // Adicionar campo para vendas na tabela de cotações
        Schema::table('quotations', function (Blueprint $table) {
            if (!Schema::hasColumn('quotations', 'converted_to_sale_id')) {
                $table->foreignUlid('converted_to_sale_id')->nullable()->comment('ID da venda, se a cotação foi convertida');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remover campo de vendas nas cotações
        if (Schema::hasColumn('quotations', 'converted_to_sale_id')) {
            Schema::table('quotations', function (Blueprint $table) {
                $table->dropColumn('converted_to_sale_id');
            });
        }

        Schema::dropIfExists('sale_payments');
        Schema::dropIfExists('sale_items');
        Schema::dropIfExists('sales');
    }
};
