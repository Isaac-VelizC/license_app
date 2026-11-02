<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\App;
use App\Services\LegalDocumentService;
use Illuminate\Http\JsonResponse;

class LegalDocumentApiController extends Controller
{
    public function __construct(
        private readonly LegalDocumentService $documents
    ) {}

    public function index(string $appSlug): JsonResponse
    {
        $app = App::query()
            ->where('slug', $appSlug)
            ->where('is_active', true)
            ->firstOrFail();

        $documents = $this->documents
            ->getActiveByApp($app->id);

        return response()->json([
            'success' => true,
            'data' => $documents->map(fn($document) => [
                'id' => $document->id,
                'type' => $document->type,
                'version' => $document->version,
                'title' => $document->title,
                'content' => $document->content,
                'content_hash' => $document->content_hash,
                'published_at' => $document->published_at?->toIso8601String(),
            ]),
        ]);
    }
}
