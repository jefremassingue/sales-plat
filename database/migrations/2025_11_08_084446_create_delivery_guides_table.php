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
        Schema::create('delivery_guides', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('code')->nullable();
            $table->foreignUlid('sale_id')->constrained()->cascadeOnDelete();
            $table->text('notes')->nullable()->comment('Notas adicionais');
            $table->string('verified_file')->nullable();
            $table->string('reference')->nullable()->comment('Referência do pagamento');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_guides');
    }
};
