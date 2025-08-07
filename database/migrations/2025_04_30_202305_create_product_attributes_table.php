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
        Schema::create('product_attributes', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('product_id')->constrained()->onDelete('cascade');
            $table->string('name'); // Nome do atributo: ex: Material, Nível de Proteção, Classe, etc.
            $table->string('value'); // Valor do atributo: ex: Algodão, IP65, Class 2, etc.
            $table->text('description')->nullable();
            $table->string('type')->default('text'); // Tipo de atributo: text, number, boolean
            $table->boolean('filterable')->default(false); // Se pode ser usado como filtro
            $table->boolean('visible')->default(true); // Se é visível na página do produto
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_attributes');
    }
};
