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
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('product_variant_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('warehouse_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('quantity')->default(0);
            $table->integer('min_quantity')->default(0);
            $table->integer('max_quantity')->nullable();
            $table->string('location')->nullable()->comment('Localização específica dentro do armazém');
            $table->string('batch_number')->nullable();
            $table->date('expiry_date')->nullable();
            $table->decimal('unit_cost', 12, 2)->nullable();
            $table->decimal('old_cost', 10, 2)->nullable();
            $table->string('status')->default('active')->comment('active, reserved, damaged, expired');
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null')->comment('Utilizador que atualizou o registo pela última vez');
            $table->timestamps();

            // Índices para otimização de pesquisa
            $table->index(['product_id', 'warehouse_id']);
            $table->index(['product_variant_id', 'warehouse_id']);
            $table->index(['status', 'expiry_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};
