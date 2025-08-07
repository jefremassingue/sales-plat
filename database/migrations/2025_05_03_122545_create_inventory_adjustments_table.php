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
        Schema::create('inventory_adjustments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('inventory_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity', 10, 2); // Quantidade (positiva para adição, negativa para subtração)
            $table->string('type')->default('manual'); // manual, transfer, loss, correction, etc.
            $table->string('reference_number')->nullable(); // Número de referência do documento
            $table->foreignUlid('supplier_id')->nullable()->constrained()->onDelete('set null'); // Fornecedor relacionado ao ajuste
            $table->text('reason')->nullable(); // Motivo do ajuste
            $table->text('notes')->nullable(); // Notas adicionais
            $table->foreignUlid('user_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();

            // Índices para otimização de pesquisa
            $table->index(['inventory_id', 'type']);
            $table->index('created_at');
            $table->index('supplier_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_adjustments');
    }
};
