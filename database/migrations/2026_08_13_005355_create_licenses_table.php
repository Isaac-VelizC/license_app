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
        Schema::create('licenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('app_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('product_version_id')->constrained('product_versions')->restrictOnDelete();

            $table->string('license_key', 20)->unique();
            $table->string('status', 20)->default('active'); // active, expired, suspended, revoked

            $table->timestamp('starts_at')->useCurrent();
            $table->timestamp('expires_at')->nullable();
            $table->integer('max_devices')->default(1);
            
            $table->string('updates_until_version', 50)->nullable();

            $table->timestamp('revoked_at')->nullable();
            $table->string('revoked_reason')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index('client_id');
            $table->index('app_id');
            $table->index('status');
            $table->index('expires_at');
            $table->index(['client_id', 'app_id'], 'licenses_client_app_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('licenses');
    }
};
