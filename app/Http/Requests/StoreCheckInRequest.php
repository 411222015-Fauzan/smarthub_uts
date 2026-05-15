<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCheckInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'borrowing_schedule_id' => ['required', 'exists:borrowing_schedules,id'],
            'condition_before' => ['required', 'string'],
            'status' => ['nullable', 'in:checked_in,checked_out,problem'],
        ];
    }
}
