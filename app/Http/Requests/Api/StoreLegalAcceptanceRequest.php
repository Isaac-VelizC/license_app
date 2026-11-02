<?php

namespace App\Http\Requests\Api;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLegalAcceptanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'app_slug' => [
                'required',
                'string',
                'max:255',
                Rule::exists('apps', 'slug')->where('is_active', true),
            ],
            'legal_document_id' => ['required', 'integer', 'exists:legal_documents,id'],
            'hwid' => ['required', 'string', 'max:255'],
            'accepted' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'app_slug.required' => 'La aplicación es obligatoria.',
            'app_slug.exists' => 'La aplicación no existe o está inactiva.',
            'legal_document_id.required' => 'El documento legal es obligatorio.',
            'legal_document_id.exists' => 'El documento legal no existe.',
            'hwid.required' => 'El identificador del dispositivo es obligatorio.',
            'accepted.required' => 'Debes aceptar los términos y condiciones.',
            'accepted.accepted' => 'Debes aceptar los términos y condiciones.',
        ];
    }
}
