<?php

namespace App\Http\Requests\Admin;

use App\Models\Plan;
use App\Models\ProductVersion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class PlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $app = $this->route('app');
        $plan = $this->route('plan');

        $appId = $app?->id ?? $plan?->app_id;

        return [
            'product_version_id' => [
                'nullable',
                'integer',
                Rule::exists('product_versions', 'id')
                    ->where(function ($query) use ($appId) {
                        $query->where('app_id', $appId)
                            ->where('is_active', true);
                    }),
            ],
            'updates_until_version' => ['nullable', 'string', 'regex:/^(lifetime|(\d+|[xX])(\.(\d+|[xX])){1,2})$/'],
            'name'            => ['required', 'string', 'max:255'],
            'qr_image'        => ['nullable', 'image', 'max:5120'],
            'price'           => ['required', 'numeric', 'min:0'],
            'currency'        => ['nullable', 'string', 'size:3'],
            'duration_days'   => ['nullable', 'integer', 'min:1'],
            'max_devices'     => ['required', 'integer', 'min:1'],
            'is_trial'        => ['boolean'],
            'stripe_price_id' => ['nullable', 'string', 'max:255'],
            'is_active'       => ['boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name'            => 'nombre',
            'product_version_id' => 'versión del producto',
            'updates_until_version' => 'actualizaciones incluidas hasta',
            'qr_image'        => 'imagen del QR',
            'price'           => 'precio',
            'currency'        => 'moneda',
            'duration_days'   => 'duración',
            'max_devices'     => 'máximo de dispositivos',
            'is_trial'        => 'es plan de prueba',
            'stripe_price_id' => 'ID de precio en Stripe',
            'is_active'       => 'activo',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $app  = $this->route('app');       // presente al crear (store)
            $plan = $this->route('plan');      // presente al editar (update)
            $appId = $app?->id ?? $plan?->app_id;

            if (! $appId) return;

            // Regla: solo un plan trial por app
            if ($this->boolean('is_trial')) {
                $existingTrial = Plan::where('app_id', $appId)
                    ->where('is_trial', true)
                    ->when($plan, fn($q) => $q->whereKeyNot($plan->id))
                    ->exists();

                if ($existingTrial) {
                    $validator->errors()->add(
                        'is_trial',
                        __('Esta app ya tiene un plan de prueba configurado. Solo puede existir uno.')
                    );
                }

                // Regla: un trial debe expirar — no puede ser "de por vida"
                if (empty($this->input('duration_days'))) {
                    $validator->errors()->add(
                        'duration_days',
                        __('Un plan de prueba necesita una duración en días.')
                    );
                }
                /*
                * Si se selecciona una ProductVersion,
                * verificamos nuevamente que pertenezca a la App.
                *
                * La regla exists() ya hace esta validación,
                * pero esta comprobación permite dar un error más
                * específico si posteriormente se agregan más reglas.
                */
                /*if ($this->filled('product_version_id')) {
                    $versionBelongsToApp = $app->productVersions()
                        ->whereKey($this->input('product_version_id'))
                        ->where('is_active', true)
                        ->exists();

                    if (! $versionBelongsToApp) {
                        $validator->errors()->add(
                            'product_version_id',
                            __('La versión seleccionada no pertenece a esta aplicación o no está activa.')
                        );
                    }
                }*/
                if ($this->boolean('is_active')) {
                    if (empty($this->input('product_version_id'))) {
                        $validator->errors()->add(
                            'product_version_id',
                            __('Es obligatorio seleccionar una versión de producto para los planes de prueba.')
                        );
                    } else {
                        $versionBelongsToApp = ProductVersion::where('id', $this->input('product_version_id'))
                            ->where('app_id', $appId)
                            ->where('is_active', true)
                            ->exists();

                        if (!$versionBelongsToApp) {
                            $validator->errors()->add(
                                'product_version_id',
                                __('La versión seleccionada no pertenece a esta aplicación o no está activa.')
                            );
                        }
                    }

                    if (! $this->boolean('is_trial')) {
                        $hasExistingQr = $plan && ! empty($plan->qr_image_url);

                        if (! $this->hasFile('qr_image') && ! $hasExistingQr) {
                            $validator->errors()->add(
                                'qr_image',
                                __('La imagen del QR es obligatoria para activar planes de pago.')
                            );
                        }
                    }
                }
            }
        });
    }

    public function toPlanData(): array
    {
        $data = $this->validated();
        unset($data['qr_image']);

        $data['price_cents'] = (int) round(((float) $data['price']) * 100);
        unset($data['price']);

        if (! empty($data['is_trial'])) {
            $data['price_cents'] = 0;
        }

        $data['currency'] ??= 'USD';

        if ($this->hasFile('qr_image')) {
            $path = $this->file('qr_image')->store('plans/qr', 'public');

            /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
            $disk = Storage::disk('public');
            $data['qr_image_url'] = $disk->url($path);
        }

        return $data;
    }
}
