<?php

namespace App\Http\Requests\Admin;

use App\Models\Plan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class PlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'            => ['required', 'string', 'max:255'],
            // El admin escribe en unidades normales (499.00); se convierte a centavos abajo.
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

            if (! $appId) {
                return;
            }

            // Regla: solo un plan trial por app
            if ($this->boolean('is_trial')) {
                $existingTrial = Plan::where('app_id', $appId)
                    ->where('is_trial', true)
                    ->when($plan, fn ($q) => $q->whereKeyNot($plan->id))
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
            }
        });
    }

    /**
     * Convierte 'price' (decimal, lo que escribe el admin) a 'price_cents'
     * (lo que se persiste y se manda a Stripe), en un solo lugar.
     */
    public function validated($key = null, $default = null): array
    {
        $data = parent::validated($key, $default);

        $data['price_cents'] = (int) round(((float) $data['price']) * 100);
        unset($data['price']);

        // Un trial siempre es gratis, sin importar lo que haya escrito el admin
        if (! empty($data['is_trial'])) {
            $data['price_cents'] = 0;
        }

        $data['currency'] ??= 'USD';

        return $data;
    }
}
