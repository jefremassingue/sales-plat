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
        Schema::create('delivery_guide_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('delivery_guide_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('sale_item_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity', 10, 2)->comment('Quantidade');
            $table->text('notes')->nullable()->comment('Notas adicionais');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_guide_items');
    }
};
