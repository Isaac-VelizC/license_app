<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class AppRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255',],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('apps', 'slug')->ignore($this->route('app')),],
            'description' => ['nullable', 'string', 'max:1000',]
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'slug' => 'slug',
            'description' => 'descripción'
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $app = $this->route('app');

            if (! $app) {
                return; // creación: no aplica
            }

            if ($app->slug !== $this->input('slug') && $app->licenses()->exists()) {
                $validator->errors()->add(
                    'slug',
                    __('No se puede cambiar el slug de una app con licencias activas: rompería la validación de los clientes ya instalados.')
                );
            }
        });
    }
}
