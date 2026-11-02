<?php

namespace App\Services;

use App\Models\App;
use App\Models\LegalDocument;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LegalDocumentService
{
    public function paginate(
        array $filters = [],
        int $perPage = 15
    ): LengthAwarePaginator {
        return LegalDocument::query()
            ->with('app:id,name,slug')
            ->when(
                !empty($filters['app_id']),
                fn($query) => $query->where('app_id', $filters['app_id'])
            )
            ->when(
                !empty($filters['type']),
                fn($query) => $query->where('type', $filters['type'])
            )
            ->when(
                !empty($filters['status']),
                function ($query) use ($filters) {
                    match ($filters['status']) {
                        'active' => $query->where('is_active', true),
                        'draft' => $query->whereNull('published_at'),
                        'archived' => $query
                            ->whereNotNull('published_at')
                            ->where('is_active', false),
                        default => null,
                    };
                }
            )
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getAvailableApps(bool $onlyActive = false): Collection
    {
        return App::query()
            ->when(
                $onlyActive,
                fn($query) => $query->where('is_active', true)
            )
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);
    }

    public function create(array $data): LegalDocument
    {
        $app = App::findOrFail($data['app_id']);

        if (! $app->is_active) {
            throw ValidationException::withMessages([
                'app_id' => 'La aplicación no está activa.',
            ]);
        }

        $exists = LegalDocument::query()
            ->where('app_id', $app->id)
            ->where('type', $data['type'])
            ->where('version', $data['version'])
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'version' => 'Esta versión del documento ya existe.',
            ]);
        }

        return LegalDocument::create([
            'app_id' => $app->id,
            'type' => $data['type'],
            'version' => $data['version'],
            'title' => $data['title'],
            'content' => $data['content'],
            'content_hash' => hash('sha256', $data['content']),
            'is_active' => false,
            'published_at' => null,
        ]);
    }

    public function update(
        LegalDocument $document,
        array $data
    ): LegalDocument {
        return DB::transaction(function () use ($document, $data) {
            $document = LegalDocument::query()
                ->lockForUpdate()
                ->findOrFail($document->id);

            if ($document->published_at !== null) {
                throw ValidationException::withMessages([
                    'document' => 'No se puede modificar un documento publicado.',
                ]);
            }

            $document->update([
                'app_id' => $data['app_id'],
                'type' => $data['type'],
                'version' => $data['version'],
                'title' => $data['title'],
                'content' => $data['content'],
                'content_hash' => hash('sha256', $data['content']),
            ]);

            return $document->refresh();
        });
    }

    public function delete(LegalDocument $document): void
    {
        DB::transaction(function () use ($document) {
            $document = LegalDocument::query()
                ->lockForUpdate()
                ->findOrFail($document->id);

            if ($document->published_at !== null) {
                throw ValidationException::withMessages([
                    'document' => 'No se puede eliminar un documento publicado.',
                ]);
            }

            if ($document->acceptances()->exists()) {
                throw ValidationException::withMessages([
                    'document' => 'No se puede eliminar un documento con aceptaciones registradas.',
                ]);
            }

            $document->delete();
        });
    }

    public function publish(int $documentId): LegalDocument
    {
        return DB::transaction(function () use ($documentId) {
            $document = LegalDocument::findOrFail($documentId);

            // Bloqueamos la aplicación para serializar publicaciones
            // concurrentes de documentos de la misma aplicación.
            $app = App::query()
                ->whereKey($document->app_id)
                ->lockForUpdate()
                ->firstOrFail();

            if (! $app->is_active) {
                throw ValidationException::withMessages([
                    'app_id' => 'La aplicación no está activa.',
                ]);
            }

            $document = LegalDocument::query()
                ->whereKey($documentId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($document->published_at !== null) {
                throw ValidationException::withMessages([
                    'document' => 'Este documento ya fue publicado.',
                ]);
            }

            if (hash('sha256', $document->content) !== $document->content_hash) {
                throw ValidationException::withMessages([
                    'content' => 'El contenido del documento no coincide con su hash.',
                ]);
            }

            LegalDocument::query()
                ->where('app_id', $document->app_id)
                ->where('type', $document->type)
                ->where('is_active', true)
                ->update(['is_active' => false]);

            $document->update([
                'is_active' => true,
                'published_at' => now(),
            ]);

            return $document->refresh();
        });
    }

    public function getActive(int $appId, string $type): ?LegalDocument
    {
        return LegalDocument::query()
            ->where('app_id', $appId)
            ->where('type', $type)
            ->where('is_active', true)
            ->whereNotNull('published_at')
            ->first();
    }

    public function getActiveByApp(int $appId): Collection
    {
        return LegalDocument::query()
            ->where('app_id', $appId)
            ->where('is_active', true)
            ->whereNotNull('published_at')
            ->orderBy('type')
            ->get();
    }

    public function getVersions(int $appId, string $type): Collection
    {
        return LegalDocument::query()
            ->where('app_id', $appId)
            ->where('type', $type)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();
    }
}
