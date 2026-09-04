<?php

namespace App\Http\Requests\Api;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ValidateLicenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'app_slug'    => ['required', 'string', 'max:191'],
            'license_key' => ['required', 'string', 'max:32', 'regex:/^LIC-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/'],
            'hwid'        => ['required', 'string', 'max:191', 'trim'],
        ];
    }
}
