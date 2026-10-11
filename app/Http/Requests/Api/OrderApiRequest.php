<?php

namespace App\Http\Requests\Api;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Override;

class OrderApiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    #[Override]
    public function attributes(): array
    {
        return [
            'plan_id'       => 'plan',
            'name'          => 'nombre completo',
            'email'         => 'correo electrónico',
            'phone'         => 'teléfono',
            'business_name' => 'nombre del negocio',
        ];
    }

    public function rules(): array
    {
        return [
            'plan_id' => [
                'required',
                'integer',
                Rule::exists('plans', 'id')->where('is_active', 1)->where('is_trial', 0),
            ],
            'name'          => ['required', 'string', 'max:255'],
            'email'         => ['required', 'email', 'max:255'],
            'phone'         => ['required', 'string', 'max:30'],
            'business_name' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'plan_id.exists' => 'El plan seleccionado no está disponible.',
        ];
    }
}
