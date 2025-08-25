<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add to quotation_items
        Schema::table('quotation_items', function (Blueprint $table) {
            if (!Schema::hasColumn('quotation_items', 'product_color_id')) {
                $table->foreignUlid('product_color_id')->nullable()->after('product_id')->constrained('product_colors')->nullOnDelete();
            }
            if (!Schema::hasColumn('quotation_items', 'product_size_id')) {
                $table->foreignUlid('product_size_id')->nullable()->after('product_color_id')->constrained('product_sizes')->nullOnDelete();
            }
        });

        // Add to sale_items
        Schema::table('sale_items', function (Blueprint $table) {
            if (!Schema::hasColumn('sale_items', 'product_color_id')) {
                $table->foreignUlid('product_color_id')->nullable()->after('product_id')->constrained('product_colors')->nullOnDelete();
            }
            if (!Schema::hasColumn('sale_items', 'product_size_id')) {
                $table->foreignUlid('product_size_id')->nullable()->after('product_color_id')->constrained('product_sizes')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('quotation_items', function (Blueprint $table) {
            if (Schema::hasColumn('quotation_items', 'product_size_id')) {
                $table->dropConstrainedForeignId('product_size_id');
            }
            if (Schema::hasColumn('quotation_items', 'product_color_id')) {
                $table->dropConstrainedForeignId('product_color_id');
            }
        });

        Schema::table('sale_items', function (Blueprint $table) {
            if (Schema::hasColumn('sale_items', 'product_size_id')) {
                $table->dropConstrainedForeignId('product_size_id');
            }
            if (Schema::hasColumn('sale_items', 'product_color_id')) {
                $table->dropConstrainedForeignId('product_color_id');
            }
        });
    }
};
