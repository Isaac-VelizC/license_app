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
        Schema::create('license_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('license_id')->constrained()->cascadeOnDelete();
            $table->foreignId('activation_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event', 30);
            // 'trial_started' | 'activated' | 'validated' | 'revoked' | 'suspended'
            // 'reactivated' | 'deactivated' | 'activation_denied' (device limit, etc.)
            $table->string('ip_address', 45)->nullable();
            $table->json('meta')->nullable(); // hwid, motivo, admin_user_id si fue manual, error_code si falló
            $table->timestamp('created_at')->useCurrent();

            $table->index('license_id');
            $table->index('event');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('license_logs');
    }
};
