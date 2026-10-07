<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductVersionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productVersion = $this->route('product');

        return [
            'app_id' => ['required', 'integer', 'exists:apps,id'],
            'version' => [
                'required',
                'string',
                'max:50',
                Rule::unique('product_versions', 'version')
                    ->where(
                        fn($query) =>
                        $query->where('app_id', $this->input('app_id'))
                    )
                    ->ignore($productVersion?->id),
            ],
            'file' => [
                $productVersion ? 'nullable' : 'required',
                'file',
                'mimes:exe',
                'max:512000',
            ],
            'release_notes' => ['nullable', 'string', 'max:10000'],
            'is_active' => ['boolean'],
            'released_at' => ['nullable', 'date'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $productVersion = $this->route('product');

            // Solo aplica al actualizar (si existe el registro)
            if (! $productVersion) return;

            // Comprobamos si se está intentando DESACTIVAR la versión
            $isTryingToDeactivate = $this->has('is_active') && ! $this->boolean('is_active');

            if ($isTryingToDeactivate) {
                // Verificamos si existen planes ACTIVOS vinculados a esta versión
                $hasActivePlans = $productVersion->plans()
                    ->where('is_active', true)
                    ->exists();

                if ($hasActivePlans) {
                    $validator->errors()->add(
                        'is_active',
                        __('No se puede desactivar esta versión porque tiene planes comerciales activos asociados. Primero debes desactivar esos planes.')
                    );
                }
            }
        });
    }

    public function attributes(): array
    {
        return [
            'app_id' => 'aplicación',
            'version' => 'versión',
            'file' => 'instalador',
            'release_notes' => 'notas de versión',
            'is_active' => 'estado',
            'released_at' => 'fecha de publicación',
        ];
    }
}
