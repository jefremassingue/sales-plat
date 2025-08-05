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
        Schema::create('suppliers', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->nullable()->constrained()->onDelete('set null'); // Associação com utilizador do sistema
            $table->string('name'); // Nome do fornecedor
            $table->string('company_name')->nullable(); // Nome da empresa
            $table->string('tax_id')->nullable()->comment('NUIT em Moçambique'); // Número de identificação fiscal
            $table->string('email')->nullable(); // Email de contacto
            $table->string('phone')->nullable(); // Telefone fixo
            $table->string('mobile')->nullable(); // Telemóvel
            $table->string('address')->nullable(); // Morada
            $table->string('city')->nullable(); // Cidade
            $table->string('province')->nullable(); // Província
            $table->string('postal_code')->nullable(); // Código postal
            $table->string('country')->default('Moçambique'); // País (padrão: Moçambique)
            $table->text('notes')->nullable(); // Notas adicionais sobre o fornecedor
            $table->boolean('active')->default(true); // Estado do fornecedor (activo/inactivo)
            $table->string('contact_person')->nullable(); // Pessoa de contacto primária
            $table->string('billing_address')->nullable(); // Endereço de faturação
            $table->string('payment_terms')->nullable(); // Termos de pagamento
            $table->string('website')->nullable(); // Website do fornecedor
            $table->string('bank_name')->nullable(); // Nome do banco
            $table->string('bank_account')->nullable(); // Número da conta bancária
            $table->string('bank_branch')->nullable(); // Agência bancária
            $table->enum('supplier_type', ['products', 'services', 'both'])->default('products'); // Tipo de fornecedor
            $table->decimal('credit_limit', 15, 2)->nullable(); // Limite de crédito
            $table->string('currency')->default('MZN'); // Moeda padrão
            $table->timestamps();
            $table->softDeletes(); // Soft delete para manter histórico
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
