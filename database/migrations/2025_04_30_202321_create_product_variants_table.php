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
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_color_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('product_size_id')->nullable()->constrained()->onDelete('set null');
            $table->string('sku')->nullable();
            $table->string('barcode')->nullable();
            $table->decimal('price', 10, 2)->nullable(); // Preço específico para esta variante
            $table->integer('stock')->default(0);
            $table->boolean('active')->default(true);
            $table->json('attributes')->nullable(); // Atributos adicionais específicos da variante
            $table->timestamps();

            // Garante que não existam variantes duplicadas para o mesmo produto
            $table->unique(['product_id', 'product_color_id', 'product_size_id'], 'unique_product_variant');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
