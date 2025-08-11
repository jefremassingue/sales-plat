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
        // Adicionar campos na tabela sale_items
        Schema::table('sale_items', function (Blueprint $table) {
            if (!Schema::hasColumn('sale_items', 'cost')) {
                $table->decimal('cost', 15, 2)->default(0)->after('unit_price')->comment('Custo unitário do item');
            }
            if (!Schema::hasColumn('sale_items', 'commission_rate')) {
                $table->decimal('commission_rate', 5, 2)->default(1.5)->after('cost')->comment('Taxa de comissão (%)');
            }
            if (!Schema::hasColumn('sale_items', 'backup_rate')) {
                $table->decimal('backup_rate', 5, 2)->default(10)->after('commission_rate')->comment('Taxa de backup (%)');
            }
        });

        // Adicionar campos na tabela sales
        Schema::table('sales', function (Blueprint $table) {
            if (!Schema::hasColumn('sales', 'commission_rate')) {
                $table->decimal('commission_rate', 5, 2)->default(1.5)->after('total')->comment('Taxa de comissão padrão (%)');
            }
            if (!Schema::hasColumn('sales', 'backup_rate')) {
                $table->decimal('backup_rate', 5, 2)->default(10)->after('commission_rate')->comment('Taxa de backup padrão (%)');
            }
            if (!Schema::hasColumn('sales', 'total_cost')) {
                $table->decimal('total_cost', 15, 2)->default(0)->after('backup_rate')->comment('Custo total dos itens');
            }
            if (!Schema::hasColumn('sales', 'commission_amount')) {
                $table->decimal('commission_amount', 15, 2)->default(0)->after('total_cost')->comment('Valor total da comissão');
            }
            if (!Schema::hasColumn('sales', 'backup_amount')) {
                $table->decimal('backup_amount', 15, 2)->default(0)->after('commission_amount')->comment('Valor total do backup');
            }
        });

        // Criar tabela para despesas da venda
        Schema::create('sale_expenses', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('sale_id')->constrained()->cascadeOnDelete();
            $table->string('description')->comment('Descrição da despesa');
            $table->decimal('amount', 15, 2)->default(0)->comment('Valor da despesa');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_expenses');

        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn(['commission_rate', 'backup_rate', 'total_cost', 'commission_amount', 'backup_amount']);
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropColumn(['cost', 'commission_rate', 'backup_rate']);
        });
    }
};
