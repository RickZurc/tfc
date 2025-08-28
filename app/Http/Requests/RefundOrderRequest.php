<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RefundOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Add proper authorization logic if needed
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $order = $this->route('order');

        return [
            'refund_amount' => [
                'required',
                'numeric',
                'min:0.01',
                $order ? "max:{$order->total_amount}" : 'max:999999.99',
            ],
            'refund_reason' => 'required|string|max:500',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'refund_amount.required' => 'Refund amount is required.',
            'refund_amount.numeric' => 'Refund amount must be a valid number.',
            'refund_amount.min' => 'Refund amount must be greater than 0.',
            'refund_amount.max' => 'Refund amount cannot exceed the order total.',
            'refund_reason.required' => 'Refund reason is required.',
            'refund_reason.max' => 'Refund reason cannot exceed 500 characters.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $order = $this->route('order');

            if ($order && ! $order->canBeRefunded()) {
                $validator->errors()->add('order', 'This order cannot be refunded.');
            }
        });
    }
}
