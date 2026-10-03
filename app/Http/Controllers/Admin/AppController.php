<?php

namespace App\Http\Controllers\Admin;

use App\Helper\CacheHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AppRequest;
use App\Http\Resources\AppResource;
use App\Models\App;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;
use Inertia\{Inertia, Response};

class AppController extends Controller
{
    public function index(): Response
    {
        $apps = App::query()->withCount(['plans', 'licenses'])->latest()->paginate(30);

        return Inertia::render('admin/apps/apps-page', [
            'apps' => AppResource::collection($apps)
        ]);
    }

    public function store(AppRequest $request): RedirectResponse
    {
        App::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Aplicación registrada correctamente.')]);
        CacheHelper::clearAppsCache();
        return redirect()->back();
    }

    public function show(App $app): Response
    {
        $app->load([
            'plans' => fn($query) => $query
                ->with('productVersion')
                ->latest(),

            'productVersions',
        ])->loadCount('licenses');

        return Inertia::render('admin/apps/app-details', [
            'app' => AppResource::make($app)
        ]);
    }

    public function update(AppRequest $request, App $app): RedirectResponse
    {
        $previousSlug = $app->slug;

        $app->update($request->validated());
        $this->forgetSlugCache($previousSlug, $app->slug);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Aplicación actualizada correctamente.')]);

        CacheHelper::clearAppsCache();
        return redirect()->route('admin.apps.show', $app);
    }

    public function toggleStatus(App $app): RedirectResponse
    {
        $app->update(['is_active' => ! $app->is_active,]);
        $this->forgetSlugCache($app->slug, $app->slug);

        $message = $app->is_active ? 'Aplicación activada correctamente.' : 'Aplicación desactivada correctamente.';

        Inertia::flash('toast', ['type' => 'success', 'message' => __($message)]);

        CacheHelper::clearAppsCache();
        return redirect()->back();
    }

    public function destroy(App $app): RedirectResponse
    {
        if ($app->licenses()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('No se puede eliminar la aplicación porque tiene licencias asociadas.')
            ]);

            return redirect()->back();
        }

        $slug = $app->slug;
        $app->delete();
        Cache::forget("app:by-slug:{$slug}");

        Inertia::flash('toast', ['type' => 'success', 'message' => __('La aplicación se elimino correctamente.')]);

        CacheHelper::clearAppsCache();
        return redirect()->back();
    }

    private function forgetSlugCache(string $oldSlug, string $newSlug): void
    {
        Cache::forget("app:by-slug:{$oldSlug}");
        if ($oldSlug !== $newSlug) {
            Cache::forget("app:by-slug:{$newSlug}");
        }
    }
}
