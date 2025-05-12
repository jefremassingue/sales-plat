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
        Schema::create('blog_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nome da categoria
            $table->string('slug')->unique(); // Slug para URLs amigáveis
            $table->text('description')->nullable(); // Descrição opcional
            $table->unsignedBigInteger('parent_id')->nullable(); // ID da categoria pai (para relação recursiva)
            $table->boolean('active')->default(true); // Estado ativo/inativo
            $table->integer('order')->default(0); // Ordem de exibição
            $table->timestamps();
            $table->softDeletes(); // Adiciona soft deletes para preservar relações

            // Chave estrangeira para auto-relacionamento
            $table->foreign('parent_id')
                ->references('id')
                ->on('categories')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
