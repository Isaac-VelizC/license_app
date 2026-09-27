<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class MarkOrderAsPaidRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function attributes(): array
    {
        return [
            'payment_reference' => 'referencia de pago',
        ];
    }

    public function rules(): array
    {
        return [
            'payment_reference' => ['nullable', 'string', 'max:255'],
        ];
    }
}
