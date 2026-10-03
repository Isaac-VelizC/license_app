<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('app_id')->constrained('apps')->cascadeOnDelete();
            $table->string('version', 50);
            $table->string('file_name');
            $table->string('file_path');
            $table->text('release_notes')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamp('released_at')->nullable();
            $table->timestamps();

            $table->unique(
                ['app_id', 'version'],
                'product_versions_app_version_unique'
            );
            $table->index(
                ['app_id', 'is_active'],
                'product_versions_app_active_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_versions');
    }
};
