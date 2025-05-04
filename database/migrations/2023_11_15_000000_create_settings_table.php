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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('group')->index(); // Para agrupar configurações relacionadas (ex: 'company', 'email', etc)
            $table->string('key')->index(); // Chave única dentro do grupo
            $table->text('value')->nullable(); // Valor da configuração
            $table->text('description')->nullable(); // Descrição opcional para UI
            $table->string('type')->default('text'); // Tipo de dado (text, boolean, number, etc)
            $table->boolean('is_public')->default(false); // Se a configuração pode ser exposta publicamente
            $table->timestamps();

            // Garantir que a combinação de grupo e chave seja única
            $table->unique(['group', 'key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
