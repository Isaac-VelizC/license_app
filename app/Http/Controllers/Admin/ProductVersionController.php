<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductVersionRequest;
use App\Http\Resources\ProductVersionResource;
use App\Models\ProductVersion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\{Inertia, Response};

class ProductVersionController extends Controller
{
    public function index(): Response
    {
        $versions = ProductVersion::query()
            ->with('app:id,name')
            ->latest('released_at')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('', [
            'versions' => ProductVersionResource::collection($versions),
        ]);
    }

    public function store(ProductVersionRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $file = $request->file('file');

        $path = $file->store("releases/{$data['app_id']}/{$data['version']}", 'local');

        DB::transaction(function () use ($data, $path, $file) {
            return ProductVersion::create([
                'app_id' => $data['app_id'],
                'version' => $data['version'],
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'release_notes' => $data['release_notes'] ?? null,
                'is_active' => $data['is_active'] ?? false,
                'released_at' => $data['released_at'] ?? null,
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Versión registrada correctamente.')]);

        return back();
    }

    public function update(ProductVersionRequest $request, ProductVersion $product)
    {

        $data = $request->validated();

        DB::transaction(function () use (
            $request,
            $data,
            $product
        ) {

            $updateData = [
                'version' => $data['version'],
                'release_notes' => $data['release_notes'] ?? null,
                'is_active' => $data['is_active'] ?? false,
                'released_at' => $data['released_at'] ?? null,
            ];

            if ($request->hasFile('file')) {
                $file = $request->file('file');

                $newPath = $file->store(
                    "releases/{$product->app_id}/{$data['version']}",
                    'local'
                );

                if ($product->file_path) {
                    Storage::disk('local')->delete(
                        $product->file_path
                    );
                }

                $updateData['file_name'] =
                    $file->getClientOriginalName();

                $updateData['file_path'] = $newPath;
            }

            $product->update($updateData);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Versión actualizada correctamente.')]);

        return back();
    }

    public function destroy(ProductVersion $product)
    {
        if ($product->licenses()->exists()) {
            return back()->with(
                'error',
                'No se puede eliminar una versión que tiene licencias asociadas.'
            );
        }

        if ($product->file_path) {
            Storage::disk('local')->delete(
                $product->file_path
            );
        }

        $product->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Versión eliminada correctamente.')]);

        return back();
    }
}
