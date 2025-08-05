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
        Schema::create('color_images', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('product_color_id')->constrained('product_colors')->cascadeOnDelete();
            $table->foreignUlid('image_id')->constrained('images')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('color_images');
    }
};
