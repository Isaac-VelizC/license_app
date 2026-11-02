<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLegalDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $document = $this->route('legalDocument');

        return [
            'app_id' => [
                'required',
                'integer',
                Rule::exists('apps', 'id')->where('is_active', true),
            ],
            'type' => [
                'required',
                'string',
                Rule::in(['terms', 'privacy', 'eula']),
            ],
            'version' => [
                'required',
                'string',
                'max:20',
                Rule::unique('legal_documents', 'version')
                    ->where('app_id', $this->input('app_id'))
                    ->where('type', $this->input('type'))
                    ->ignore($document?->id),
            ],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:500000'],
        ];
    }

    public function attributes(): array
    {
        return [
            'app_id' => 'aplicación',
            'type' => 'tipo de documento',
            'version' => 'versión',
            'title' => 'título',
            'content' => 'contenido',
        ];
    }

    public function messages(): array
    {
        return [
            'app_id.exists' => 'La aplicación seleccionada no existe o está inactiva.',
            'type.in' => 'El tipo de documento seleccionado no es válido.',
            'version.unique' => 'Ya existe esta versión para la aplicación y tipo seleccionados.',
        ];
    }
}
