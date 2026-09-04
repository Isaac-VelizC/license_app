<?php

namespace App\Http\Controllers\Admin;

use App\Helper\CacheHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ClientRequest;
use App\Http\Resources\ClientResource;
use App\Models\Client;
use Illuminate\Http\{RedirectResponse, Request};
use Inertia\{Inertia, Response};

class ClientController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();

        $clients = Client::query()
            ->withCount('licenses')
            ->when($search, fn ($query) => $query->search($search))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/clients/clients-page', [
            'clients' => ClientResource::collection($clients),
            'filters' => ['search' => $search],
        ]);
    }

    public function store(ClientRequest $request): RedirectResponse
    {
        $client = Client::create($request->validated());

        CacheHelper::clearClientsCache();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Cliente registrado correctamente.')]);

        return redirect()->route('admin.clients.show', $client);
    }

    public function show(Client $client): Response
    {
        $client->load(['licenses.app', 'licenses.plan']);

        return Inertia::render('admin/clients/client-detail', [
            'client' => ClientResource::make($client)
        ]);
    }

    public function update(ClientRequest $request, Client $client): RedirectResponse
    {
        $client->update($request->validated());

        CacheHelper::clearClientsCache();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Cliente actualizado correctamente.')]);

        return redirect()->route('admin.clients.show', $client);
    }

    public function destroy(Client $client)
    {
        if ($client->licenses()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('No se puede eliminar a ' . $client->name . ' porque tiene licencias asociadas.')
            ]);

            return redirect()->back();
        }

        $client->delete();

        CacheHelper::clearClientsCache();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('El cliente se elimino correctamente.')]);

        return redirect()->back();
    }
}
