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
            $table->ulid('id')->primary();
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

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
