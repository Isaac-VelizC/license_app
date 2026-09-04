<?php

namespace App\Http\Controllers\Admin;

use App\Helper\CacheHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PlanRequest;
use App\Models\{App, Plan};
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function store(PlanRequest $request, App $app): RedirectResponse
    {
        $app->plans()->create($request->validated());

        CacheHelper::clearAppsCache();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Plan agregado correctamente.')]);

        return redirect()->back();
    }

    public function update(PlanRequest $request, Plan $plan): RedirectResponse
    {
        $plan->update($request->validated());
        
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
