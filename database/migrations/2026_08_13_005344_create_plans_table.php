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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('app_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('qr_image_url')->nullable();
            $table->unsignedInteger('price_cents')->default(0); // 49900 = $499.00
            $table->char('currency', 3)->default('USD');          // ← de una vez, ver nota abajo
            $table->integer('duration_days')->nullable();
            $table->integer('max_devices')->default(1);
            $table->boolean('is_trial')->default(false);
            $table->string('stripe_price_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('app_id');
            $table->index('name');
            $table->unique(['app_id', 'name'], 'plans_app_id_name_unique'); // ← nuevo
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
