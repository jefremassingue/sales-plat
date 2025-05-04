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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 15, 2)->comment('Valor do pagamento');
            $table->date('payment_date')->comment('Data do pagamento');
            $table->string('payment_method')->comment('Método de pagamento');
            $table->string('reference')->nullable()->comment('Referência do pagamento');
            $table->text('notes')->nullable()->comment('Notas adicionais');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete()->comment('Utilizador que registrou o pagamento');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
