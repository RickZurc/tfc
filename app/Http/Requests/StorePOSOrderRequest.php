<?php

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePOSOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'customer_id' => 'nullable|exists:customers,id',
            'payment_method' => 'required|in:cash,card,digital,mixed',
            'amount_paid' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|in:percentage,numerical',
            'discount_input' => 'nullable|numeric|min:0',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $this->validatePaymentAmount($validator);
        });
    }

    /**
     * Validate that the payment amount is sufficient for the total order.
     */
    protected function validatePaymentAmount(Validator $validator): void
    {
        if ($validator->errors()->any()) {
            return; // Don't validate payment if other validation failed
        }

        $subtotal = 0;
        foreach ($this->items as $item) {
            $product = Product::find($item['product_id']);
            if ($product) {
                $subtotal += $product->price * $item['quantity'];
            }
        }

        $discountAmount = $this->discount_amount ?? 0;
        $total = max(0, $subtotal - $discountAmount);

        if ($this->amount_paid < $total) {
            $validator->errors()->add(
                'amount_paid',
                sprintf(
                    'The amount paid must be at least $%s. Current total: $%s, Amount paid: $%s, Shortfall: $%s',
                    number_format($total, 2),
                    number_format($total, 2),
                    number_format($this->amount_paid, 2),
                    number_format($total - $this->amount_paid, 2)
                )
            );
        }
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'items.required' => 'At least one item is required to create an order.',
            'items.array' => 'Items must be provided as an array.',
            'items.min' => 'At least one item is required to create an order.',
            'items.*.product_id.required' => 'Product ID is required for each item.',
            'items.*.product_id.exists' => 'One or more selected products do not exist.',
            'items.*.quantity.required' => 'Quantity is required for each item.',
            'items.*.quantity.integer' => 'Quantity must be a whole number.',
            'items.*.quantity.min' => 'Quantity must be at least 1.',
            'customer_id.exists' => 'Selected customer does not exist.',
            'payment_method.required' => 'Payment method is required.',
            'payment_method.in' => 'Payment method must be cash, card, digital, or mixed.',
            'amount_paid.required' => 'Amount paid is required.',
            'amount_paid.numeric' => 'Amount paid must be a valid number.',
            'amount_paid.min' => 'Amount paid cannot be negative.',
            'discount_amount.numeric' => 'Discount amount must be a valid number.',
            'discount_amount.min' => 'Discount amount cannot be negative.',
            'discount_type.in' => 'Discount type must be either percentage or numerical.',
            'discount_input.numeric' => 'Discount input must be a valid number.',
            'discount_input.min' => 'Discount input cannot be negative.',
        ];
    }

    /**
     * Get the calculated total for this order.
     */
    public function getCalculatedTotal(): float
    {
        $subtotal = 0;
        foreach ($this->items as $item) {
            $product = Product::find($item['product_id']);
            if ($product) {
                $subtotal += $product->price * $item['quantity'];
            }
        }

        $discountAmount = $this->discount_amount ?? 0;

        return max(0, $subtotal - $discountAmount);
    }

    /**
     * Get the change amount for this order.
     */
    public function getChangeAmount(): float
    {
        return max(0, $this->amount_paid - $this->getCalculatedTotal());
    }
}
