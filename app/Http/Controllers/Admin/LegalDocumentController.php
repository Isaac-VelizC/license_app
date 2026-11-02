<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\IndexLegalDocumentRequest;
use App\Http\Requests\Admin\StoreLegalDocumentRequest;
use App\Http\Requests\Admin\UpdateLegalDocumentRequest;
use App\Models\LegalDocument;
use App\Services\LegalDocumentService;
use Illuminate\Http\RedirectResponse;
use Inertia\{Inertia, Response};

class LegalDocumentController extends Controller
{
    public function __construct(
        private readonly LegalDocumentService $service
    ) {}

    public function index(IndexLegalDocumentRequest $request): Response
    {
        $filters = $request->validated();

        return Inertia::render('admin/legal-documents/index', [
            'documents' => $this->service->paginate($filters),
            'apps' => $this->service->getAvailableApps(),
            'filters' => [
                'app_id' => $filters['app_id'] ?? '',
                'type' => $filters['type'] ?? '',
                'status' => $filters['status'] ?? '',
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/legal-documents/create', [
            'apps' => $this->service->getAvailableApps(true),
        ]);
    }

    public function store(StoreLegalDocumentRequest $request): RedirectResponse
    {
        $document = $this->service->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Documento creado correctamente.')]);

        return redirect()->route('admin.legal-documents.show', $document);
    }

    public function show(LegalDocument $legalDocument): Response
    {
        return Inertia::render('admin/legal-documents/show', [
            'document' => $legalDocument->load('app:id,name,slug'),
        ]);
    }

    public function edit(LegalDocument $legalDocument): Response
    {
        abort_if(
            $legalDocument->published_at !== null,
            403,
            'No se puede editar un documento publicado.'
        );

        return Inertia::render('admin/legal-documents/edit', [
            'document' => $legalDocument,
            'apps' => $this->service->getAvailableApps(),
        ]);
    }

    public function update(
        UpdateLegalDocumentRequest $request,
        LegalDocument $legalDocument
    ): RedirectResponse {
        $document = $this->service->update(
            $legalDocument,
            $request->validated()
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Documento actualizado correctamente.')]);

        return redirect()
            ->route('admin.legal-documents.show', $document);
    }

    public function destroy(LegalDocument $legalDocument): RedirectResponse
    {
        $this->service->delete($legalDocument);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Borrador eliminado correctamente.')]);

        return redirect()->route('admin.legal-documents.index');
    }

    public function publish(
        LegalDocument $legalDocument
    ): RedirectResponse {
        $this->service->publish($legalDocument->id);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Documento publicado correctamente.')]);

        return back();
    }
}
