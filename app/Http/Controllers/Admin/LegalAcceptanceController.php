<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\IndexLegalAcceptanceRequest;
use App\Models\App;
use App\Services\LegalAcceptanceService;
use Inertia\{Inertia, Response};

class LegalAcceptanceController extends Controller
{
    public function __construct(
        private readonly LegalAcceptanceService $service
    ) {}

    public function index(IndexLegalAcceptanceRequest $request): Response
    {
        $filters = $request->validated();

        return Inertia::render('admin/legal-acceptances/index', [
            'acceptances' => $this->service->paginate($filters),
            'apps' => App::query()
                ->orderBy('name')
                ->get(['id', 'name', 'slug']),
            'filters' => $filters,
        ]);
    }
}
