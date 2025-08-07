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
        Schema::table('quotations', function (Blueprint $table) {
            if (!Schema::hasColumn('quotations', 'converted_to_sale_id')) {
                $table->foreignId('converted_to_sale_id')->nullable()->after('converted_to_order_id')
                    ->comment('ID da venda quando a cotação for convertida');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotations', function (Blueprint $table) {
            if (Schema::hasColumn('quotations', 'converted_to_sale_id')) {
                $table->dropForeign(['converted_to_sale_id']);
                $table->dropColumn('converted_to_sale_id');
            }
        });
    }
};
