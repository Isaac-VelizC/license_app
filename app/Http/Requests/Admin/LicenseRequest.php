<?php

namespace App\Http\Requests\Admin;

use App\Models\Plan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class LicenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id' => ['required', 'exists:clients,id'],
            'app_id'    => ['required', Rule::exists('apps', 'id')->where(fn($q) => $q->where('is_active', true))],
            'plan_id'   => [
                'required',
                Rule::exists('plans', 'id')->where(fn($q) => $q->where('app_id', $this->input('app_id'))->where('is_active', true)),
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'client_id' => 'cliente',
            'app_id' => 'aplicación',
            'plan_id' => 'plan',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $plan = Plan::find($this->input('plan_id'));

            if ($plan?->is_trial) {
                $validator->errors()->add(
                    'plan_id',
                    __('No se puede emitir manualmente una licencia con un plan de prueba; ese flujo es exclusivo de la app.')
                );
            }
        });
    }
}
