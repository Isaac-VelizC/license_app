<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
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
