<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexLegalDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'app_id' => [
                'nullable',
                'integer',
                Rule::exists('apps', 'id'),
            ],
            'type' => [
                'nullable',
                Rule::in(['terms', 'privacy', 'eula']),
            ],
            'status' => [
                'nullable',
                Rule::in(['active', 'draft', 'archived']),
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'app_id' => 'aplicación',
            'type' => 'tipo de documento',
            'status' => 'estado',
        ];
    }
}
