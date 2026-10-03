<?php

namespace App\Http\Controllers\Admin;

use App\Helper\CacheHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PlanRequest;
use App\Models\{App, Plan};
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function create(App $app)
    {
        $productVersions = $app->productVersions()
            ->where('is_active', true)
            ->get(['id', 'version']);

        return Inertia::render('admin/apps/plan-form-page', [
            'appId' => $app->id,
            'editingPlan' => null,
            'productVersions' => $productVersions
        ]);
    }

    public function store(PlanRequest $request, App $app): RedirectResponse
    {
        $data = $request->toPlanData();

        $app->plans()->create($data);

        CacheHelper::clearAppsCache();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Plan agregado correctamente.')]);

        return back();
    }

    public function edit(App $app, Plan $plan)
    {
        $productVersions = $app->productVersions()
            ->where('is_active', true)
            ->get(['id', 'version']);

        return Inertia::render('admin/apps/plan-form-page', [
            'appId' => $app->id,
            'editingPlan' => $plan,
            'productVersions' => $productVersions
        ]);
    }

    public function update(PlanRequest $request, Plan $plan): RedirectResponse
    {
        $data = $request->toPlanData();

        if (isset($data['qr_image_url']) && $plan->qr_image_url) {
            $oldPath = str_replace(Storage::disk('public')->url(''), '', $plan->qr_image_url);
            Storage::disk('public')->delete($oldPath);
        }

        $plan->update($data);

        CacheHelper::clearAppsCache();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Plan actualizado correctamente.')]);

        return redirect()->back();
    }

    public function destroy(Plan $plan)
    {
        if ($plan->licenses()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('No se puede eliminar el plan porque tiene licencias asociadas.')
            ]);

            return redirect()->back();
        }

        $plan->delete();

        CacheHelper::clearAppsCache();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Plan eliminado correctamente.')
        ]);

        return redirect()->back();
    }
}
