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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // Associação com utilizador do sistema
            $table->string('name'); // Nome do cliente
            $table->string('company_name')->nullable(); // Nome da empresa (para clientes empresariais)
            $table->string('tax_id')->nullable()->comment('NUIT em Moçambique'); // Número de identificação fiscal
            $table->string('email')->nullable(); // Email de contacto (pode ser diferente do utilizador)
            $table->string('phone')->nullable(); // Telefone fixo
            $table->string('mobile')->nullable(); // Telemóvel
            $table->string('address')->nullable(); // Morada
            $table->string('city')->nullable(); // Cidade
            $table->string('province')->nullable(); // Província
            $table->string('postal_code')->nullable(); // Código postal
            $table->string('country')->default('Moçambique'); // País (padrão: Moçambique)
            $table->text('notes')->nullable(); // Notas adicionais sobre o cliente
            $table->boolean('active')->default(true); // Estado do cliente (activo/inactivo)
            $table->date('birth_date')->nullable(); // Data de nascimento (para pessoas singulares)
            $table->string('contact_person')->nullable(); // Pessoa de contacto (para empresas)
            $table->string('billing_address')->nullable(); // Endereço de faturação
            $table->string('shipping_address')->nullable(); // Endereço de entrega
            $table->string('website')->nullable(); // Website do cliente
            $table->enum('client_type', ['individual', 'company'])->default('individual'); // Tipo de cliente
            $table->timestamps();
            $table->softDeletes(); // Soft delete para manter histórico
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
