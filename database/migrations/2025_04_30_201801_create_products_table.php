<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\UnitEnum;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('technical_details')->nullable();
            $table->text('features')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('old_price', 10, 2)->nullable();
            $table->decimal('cost', 10, 2)->nullable();
            $table->string('sku')->unique()->nullable();
            $table->string('barcode')->nullable();
            $table->decimal('weight', 8, 2)->nullable()->comment('em kilos');
            $table->foreignId('category_id')->constrained('categories')->onDelete('restrict');
            $table->boolean('active')->default(true);
            $table->boolean('featured')->default(false);
            $table->boolean('ecommerce_available')->default(false);
            $table->string('certification')->nullable()->comment('Certificações do EPI');
            $table->string('warranty')->nullable();
            $table->string('brand')->nullable();
            $table->string('origin_country')->nullable()->default('Mozambique');
            $table->string('currency')->default('MZN');
            $table->enum('unit', array_column(UnitEnum::cases(), 'value'))->default(UnitEnum::UNIT->value)->comment('Unidade de medida do produto');
            $table->timestamps();
            $table->softDeletes(); // Soft delete para manter histórico
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
