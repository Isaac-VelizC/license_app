<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('license_id')->constrained()->cascadeOnDelete();
            $table->string('hwid');
            $table->string('device_id')->nullable();
            $table->string('device_name')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('app_version')->nullable();
            $table->timestamp('activated_at')->useCurrent();
            $table->timestamp('last_seen_at')->useCurrent();
            $table->timestamp('deactivated_at')->nullable();
            $table->boolean('is_active')->default(true);

            $table->unique(['license_id', 'hwid']);
            $table->index('license_id');
            $table->index('hwid');
            $table->index(['license_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activations');
    }
};
