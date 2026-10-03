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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();

            $table->foreignId('client_id')->constrained();
            $table->foreignId('plan_id')->constrained();
            $table->foreignId('product_version_id')->constrained('product_versions')->restrictOnDelete();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->foreignId('license_id')->nullable()->constrained();

            $table->unsignedInteger('amount_cents');
            $table->string('currency', 3);

            $table->string('status')->default('pending'); // pending | paid | expired | refunded

            $table->string('payment_reference')->nullable();
            $table->string('payment_proof_path')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->timestamp('expires_at')->nullable();

            $table->timestamps();

            $table->index('status');
            $table->index('client_id');
            $table->index('plan_id');
            $table->index('product_version_id');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
