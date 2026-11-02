<?php

namespace App\Services;

use App\Models\LegalAcceptance;
use App\Models\LegalDocument;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LegalAcceptanceService
{
    public function paginate(
        array $filters = [],
        int $perPage = 15
    ): LengthAwarePaginator {
        return LegalAcceptance::query()
            ->with([
                'legalDocument:id,app_id,type,version,title',
                'legalDocument.app:id,name,slug',
            ])
            ->when(
                !empty($filters['app_id']),
                fn($query) => $query->whereHas(
                    'legalDocument',
                    fn($documentQuery) => $documentQuery
                        ->where('app_id', $filters['app_id'])
                )
            )
            ->when(
                !empty($filters['type']),
                fn($query) => $query->whereHas(
                    'legalDocument',
                    fn($documentQuery) => $documentQuery
                        ->where('type', $filters['type'])
                )
            )
            ->orderByDesc('accepted_at')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function accept(
        int $documentId,
        string $hwid,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): array {
        $hwid = trim($hwid);

        if ($hwid === '') {
            throw ValidationException::withMessages([
                'hwid' => 'El identificador del dispositivo es obligatorio.',
            ]);
        }

        return DB::transaction(function () use (
            $documentId,
            $hwid,
            $ipAddress,
            $userAgent
        ) {
            $document = LegalDocument::query()
                ->findOrFail($documentId);

            if (! $document->is_active || $document->published_at === null) {
                throw ValidationException::withMessages([
                    'legal_document_id' => 'El documento legal no está vigente.',
                ]);
            }

            $acceptance = LegalAcceptance::firstOrCreate(
                [
                    'legal_document_id' => $document->id,
                    'hwid' => $hwid,
                ],
                [
                    'accepted_at' => now(),
                    'ip_address' => $ipAddress,
                    'user_agent' => $userAgent,
                ]
            );

            return [
                'acceptance' => $acceptance,
                'already_accepted' => ! $acceptance->wasRecentlyCreated,
            ];
        });
    }

    public function hasAccepted(int $documentId, string $hwid): bool
    {
        return LegalAcceptance::query()
            ->where('legal_document_id', $documentId)
            ->where('hwid', $hwid)
            ->exists();
    }

    public function getHistory(
        int $appId,
        string $hwid
    ): Collection {
        return LegalAcceptance::query()
            ->with('legalDocument')
            ->where('hwid', $hwid)
            ->whereHas('legalDocument', function ($query) use ($appId) {
                $query->where('app_id', $appId);
            })
            ->orderByDesc('accepted_at')
            ->get();
    }
}
