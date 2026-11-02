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
        Schema::create('legal_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('app_id')->constrained('apps')->restrictOnDelete();

            $table->string('type', 30);
            $table->string('version', 20);
            $table->string('title');

            $table->longText('content');
            $table->string('content_hash', 64);

            $table->boolean('is_active')->default(false);
            $table->timestamp('published_at')->nullable();

            $table->timestamps();

            $table->unique(
                ['app_id', 'type', 'version'],
                'legal_docs_app_type_version_unique'
            );

            $table->index(
                ['app_id', 'type', 'is_active'],
                'legal_docs_app_type_active_index'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('legal_documents');
    }
};
