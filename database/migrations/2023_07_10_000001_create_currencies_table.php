<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('currencies', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('code', 3)->unique()->comment('Código ISO da moeda (ex: MZN, USD)');
            $table->string('name')->comment('Nome da moeda (ex: Metical Moçambicano)');
            $table->string('symbol', 10)->comment('Símbolo da moeda (ex: MT, $)');
            $table->decimal('exchange_rate', 10, 4)->default(1.0000)->comment('Taxa de câmbio em relação à moeda base');
            $table->boolean('is_default')->default(false)->comment('Indica se é a moeda padrão do sistema');
            $table->boolean('is_active')->default(true)->comment('Indica se a moeda está ativa');
            $table->string('decimal_separator', 1)->default(',')->comment('Separador decimal (ex: , ou .)');
            $table->string('thousand_separator', 1)->default('.')->comment('Separador de milhares (ex: . ou ,)');
            $table->integer('decimal_places')->default(2)->comment('Número de casas decimais');
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
