<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('email')) {
            $this->merge(['email' => strtolower(trim($this->input('email')))]);
        }
    }

    public function rules(): array
    {
        return [
            'name'         => ['required', 'string', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'email'        => ['required', 'email', 'max:255', Rule::unique('clients', 'email')->ignore($this->route('client'))],
            'phone' => [
                'nullable',
                'string',
                'max:30',
                'phone:BO,INTERNATIONAL',
            ],
            'notes'        => ['nullable', 'string'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name'         => 'nombre',
            'company_name' => 'empresa',
            'email'        => 'correo electrónico',
            'phone'        => 'teléfono',
            'notes'        => 'notas',
        ];
    }
}
