<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        if (!Schema::hasColumn('products', 'description_pdf')) {
            Schema::table('products', function (Blueprint $table) {
                $table->string('description_pdf')->nullable();
            });
        }

        if (!Schema::hasColumn('products', 'brand_id')) {
            Schema::table('products', function (Blueprint $table) {
                $table->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();
            });
        }
    }

    public function down()
    {
        if (Schema::hasColumn('products', 'description_pdf')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('description_pdf');
            });
        }

        if (Schema::hasColumn('products', 'brand_id')) {
            Schema::table('products', function (Blueprint $table) {
                // Drop foreign key if it exists (uses conventional name)
                try { $table->dropForeign(['brand_id']); } catch (\Throwable $e) { /* ignore */ }
                $table->dropColumn('brand_id');
            });
        }
    }
};
