<?php

namespace App\Http\Requests\Admin;

use App\Models\Plan;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ChangePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plan_id' => [
                'required',
                Rule::exists('plans', 'id')->where(fn ($q) => $q->where('app_id', $this->route('license')->app_id)),
            ],
        ];
    }

    public function attributes(): array
    {
        return ['plan_id' => 'plan'];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $plan = Plan::find($this->input('plan_id'));

            if ($plan?->is_trial) {
                $validator->errors()->add('plan_id', __('No se puede asignar manualmente un plan de prueba.'));
            }
        });
    }
}
