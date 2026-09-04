<?php

namespace App\Http\Controllers\Admin;

use App\Helper\CacheHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ChangePlanRequest;
use App\Http\Requests\Admin\LicenseRequest;
use App\Http\Resources\{LicenseResource, PlanResource};
use App\Models\{License, App, Client, Plan};
use App\services\LicenseService;
use Illuminate\Http\{RedirectResponse, Request};
use Inertia\{Inertia, Response};

class LicenseController extends Controller
{
    public function __construct(private readonly LicenseService $licenses) {}

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim();
        $appId = $request->integer('app_id');
        $clientId = $request->integer('client_id');
        $status = $request->string('status')->trim();

        $licenses = License::query()
            ->with(['client', 'app', 'plan'])
            ->when($search->isNotEmpty(), fn($q) => $q->search($search->toString()))
            ->when($appId > 0, fn($q) => $q->forApp($appId))
            ->when($clientId > 0, fn($q) => $q->forClient($clientId))
            ->when($status->isNotEmpty(), fn($q) => $q->forStatus($status->toString()))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/licenses/licenses-page', [
            'licenses' => LicenseResource::collection($licenses),
            'filters' => [
                'search' => $search->toString(),
                'app_id' => $appId,
                'client_id' => $clientId,
                'status' => $status->toString(),
            ],
            'apps' => fn() => CacheHelper::apps(),
            'clients' => fn() => CacheHelper::clients(),
        ]);
    }

    public function store(LicenseRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $client = Client::findOrFail($validated['client_id']);
        $app = App::findOrFail($validated['app_id']);
        $plan = Plan::findOrFail($validated['plan_id']);

        try {
            $license = $this->licenses->issue($client, $app, $plan);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['plan_id' => $e->getMessage()]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Licencia emitida correctamente.')]);

        return redirect()->route('admin.licenses.show', $license);
    }

    public function show(License $license): Response
    {
        $license->load(['client', 'app', 'plan', 'activations']);

        $plans = Plan::where('app_id', $license->app_id)
            ->where('is_trial', false)
            ->where('is_active', true)
            ->get();

        return Inertia::render('admin/licenses/licenses-detail', [
            'license' => LicenseResource::make($license),
            'plans'   => PlanResource::collection($plans),
        ]);
    }

    public function renew(License $license): RedirectResponse
    {
        try {
            $this->licenses->renew($license);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['license' => $e->getMessage()]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Licencia renovada correctamente.')]);

        return back();
    }

    public function changePlan(ChangePlanRequest $request, License $license): RedirectResponse
    {
        $plan = Plan::findOrFail($request->validated('plan_id'));

        try {
            $this->licenses->changePlan($license, $plan);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['plan_id' => $e->getMessage()]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Plan de licencia actualizado correctamente.')]);

        return back();
    }

    public function suspend(Request $request, License $license): RedirectResponse
    {
        try {
            $this->licenses->suspend(
                $license,
                $request->string('reason')->toString() ?: __('Suspendida manualmente desde el panel admin.')
            );
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['license' => $e->getMessage()]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Licencia suspendida temporalmente.')]);

        return back();
    }

    public function revoke(Request $request, License $license): RedirectResponse
    {
        try {
            $this->licenses->revoke(
                $license,
                $request->string('reason')->toString() ?: __('Revocada manualmente desde el panel admin.')
            );
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['license' => $e->getMessage()]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Licencia revocada permanentemente.')]);

        return back();
    }

    public function reactivate(License $license): RedirectResponse
    {
        try {
            $this->licenses->reactivate($license);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['license' => $e->getMessage()]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Licencia reactivada correctamente.')]);

        return back();
    }
}
