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
        Schema::create('employees', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('email')->unique()->nullable();
            $table->string('phone')->nullable();
            $table->string('position')->nullable();
            $table->decimal('base_salary', 10, 2)->default(0);
            $table->decimal('commission_rate', 5, 2)->default(0);
            $table->date('admission_date')->nullable();
            $table->string('photo_path', 2048)->nullable();
            $table->string('academic_level')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('gender')->nullable();
            $table->string('nuit')->nullable();
            $table->string('bi_number')->nullable();
            $table->string('department')->nullable();
            $table->string('status')->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
