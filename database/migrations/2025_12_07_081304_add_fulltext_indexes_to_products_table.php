<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Usar SQL bruto para criar índices FULLTEXT no MySQL
        DB::statement('ALTER TABLE products ADD FULLTEXT products_name_fulltext (name)');
        DB::statement('ALTER TABLE products ADD FULLTEXT products_description_fulltext (description)');
        DB::statement('ALTER TABLE products ADD FULLTEXT products_technical_details_fulltext (technical_details)');
        DB::statement('ALTER TABLE products ADD FULLTEXT products_features_fulltext (features)');
        DB::statement('ALTER TABLE products ADD FULLTEXT products_sku_fulltext (sku)');
        
        // Criar índice FULLTEXT combinado para busca geral
        DB::statement('ALTER TABLE products ADD FULLTEXT products_search_fulltext (name, description, technical_details, features, sku)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remover os índices FULLTEXT usando SQL bruto
        DB::statement('ALTER TABLE products DROP INDEX products_name_fulltext');
        DB::statement('ALTER TABLE products DROP INDEX products_description_fulltext');
        DB::statement('ALTER TABLE products DROP INDEX products_technical_details_fulltext');
        DB::statement('ALTER TABLE products DROP INDEX products_features_fulltext');
        DB::statement('ALTER TABLE products DROP INDEX products_sku_fulltext');
        DB::statement('ALTER TABLE products DROP INDEX products_search_fulltext');
    }
};
