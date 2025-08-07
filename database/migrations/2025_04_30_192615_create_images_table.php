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
        Schema::create('images', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->nullableUlidMorphs('typeable');

            $table->string('storage')->nullable();
            $table->string('path')->nullable();
            $table->string('name')->nullable();
            $table->string('original_name')->nullable();
            $table->string('size')->nullable();
            $table->string('extension')->nullable();
            $table->boolean('is_main')->default(false);

            $table->foreignUlid('parent_id')->nullable();
            $table->string('version')->default('original');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('images');
    }
};
