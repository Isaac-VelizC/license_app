<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\LicenseLogResource;
use App\Models\LicenseLog;
use Illuminate\Http\Request;
use Inertia\{Response, Inertia};

class LicenseLogController extends Controller
{
    private const EVENTS = [
        'issued',
        'renewed',
        'plan_changed',
        'suspended',
        'revoked',
        'reactivated',
        'trial_started',
        'deactivated',
    ];

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $event = $request->string('event')->trim()->toString();

        $logs = LicenseLog::query()
            ->with(['license.client', 'license.app'])
            ->when($search, fn($q) => $q->whereHas(
                'license',
                fn($lq) => $lq
                    ->where('license_key', 'like', "%{$search}%")
                    ->orWhereHas('client', fn($cq) => $cq->where('name', 'like', "%{$search}%"))
            ))
            ->when($event, fn($q) => $q->where('event', $event))
            ->latest('created_at')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('admin/licenses/license-logs-page', [
            'logs'    => LicenseLogResource::collection($logs),
            'filters' => ['search' => $search, 'event' => $event],
            'events'  => self::EVENTS,
        ]);
    }
}
