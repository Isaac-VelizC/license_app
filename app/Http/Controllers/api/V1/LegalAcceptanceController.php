<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreLegalAcceptanceRequest;
use App\Models\{App, LegalDocument};
use App\Services\LegalAcceptanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class LegalAcceptanceController extends Controller
{
    public function __construct(
        private readonly LegalAcceptanceService $legalAcceptances
    ) {}

    public function store(StoreLegalAcceptanceRequest $request): JsonResponse
    {
        $data = $request->validated();

        $app = App::query()
            ->where('slug', $data['app_slug'])
            ->where('is_active', true)
            ->firstOrFail();

        $document = LegalDocument::query()
            ->whereKey($data['legal_document_id'])
            ->where('app_id', $app->id)
            ->where('is_active', true)
            ->whereNotNull('published_at')
            ->first();

        if (! $document) {
            throw ValidationException::withMessages([
                'legal_document_id' =>
                'El documento no está vigente para esta aplicación.',
            ]);
        }

        $alreadyAccepted = $this->legalAcceptances->hasAccepted(
            $document->id,
            $data['hwid']
        );

        $acceptance = $this->legalAcceptances->accept(
            documentId: $document->id,
            hwid: $data['hwid'],
            ipAddress: $request->ip(),
            userAgent: $request->userAgent()
        );

        return response()->json([
            'success' => true,
            'already_accepted' => $alreadyAccepted,
            'data' => [
                'id' => $acceptance->id,
                'legal_document_id' => $document->id,
                'type' => $document->type,
                'version' => $document->version,
                'accepted_at' => $acceptance->accepted_at?->toIso8601String(),
            ],
            'message' => $alreadyAccepted
                ? 'Este dispositivo ya había aceptado esta versión.'
                : 'Aceptación registrada correctamente.',
        ], $alreadyAccepted ? 200 : 201);
    }
}
