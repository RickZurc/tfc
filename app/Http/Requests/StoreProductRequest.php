<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'category_id' => ['required', 'exists:categories,id'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'cost_price' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'sku' => ['nullable', 'string', 'max:100', 'unique:products,sku'],
            'barcode' => ['nullable', 'string', 'max:100', 'unique:products,barcode'],
            'track_stock' => ['boolean'],
            'stock_quantity' => ['required_if:track_stock,true', 'nullable', 'integer', 'min:0'],
            'min_stock_level' => ['required_if:track_stock,true', 'nullable', 'integer', 'min:0'],
            'max_stock_level' => ['nullable', 'integer', 'min:0'],
            'unit' => ['required', 'string', 'max:50'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'dimensions' => ['nullable', 'string', 'max:100'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['boolean'],
            
            // Discount fields
            'discount_active' => ['boolean'],
            'discount_type' => ['nullable', 'required_if:discount_active,true', 'in:percentage,fixed'],
            'discount_percentage' => ['nullable', 'required_if:discount_type,percentage', 'numeric', 'min:0', 'max:100'],
            'discount_amount' => ['nullable', 'required_if:discount_type,fixed', 'numeric', 'min:0'],
            'discount_starts_at' => ['nullable', 'required_if:discount_active,true', 'date', 'after_or_equal:today'],
            'discount_ends_at' => ['nullable', 'required_if:discount_active,true', 'date', 'after:discount_starts_at'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Product name is required.',
            'category_id.required' => 'Please select a category.',
            'category_id.exists' => 'Selected category does not exist.',
            'price.required' => 'Product price is required.',
            'price.numeric' => 'Price must be a valid number.',
            'price.min' => 'Price cannot be negative.',
            'sku.unique' => 'This SKU is already in use.',
            'barcode.unique' => 'This barcode is already in use.',
            'stock_quantity.required_if' => 'Stock quantity is required when stock tracking is enabled.',
            'min_stock_level.required_if' => 'Minimum stock level is required when stock tracking is enabled.',
            'unit.required' => 'Product unit is required.',
            'unit.max' => 'Unit cannot exceed 50 characters.',
            'unit.string' => 'Unit must be a valid string.',
            
            // Discount messages
            'discount_type.required_if' => 'Discount type is required when discount is active.',
            'discount_type.in' => 'Discount type must be either percentage or fixed amount.',
            'discount_percentage.required_if' => 'Discount percentage is required for percentage discounts.',
            'discount_percentage.max' => 'Discount percentage cannot exceed 100%.',
            'discount_amount.required_if' => 'Discount amount is required for fixed amount discounts.',
            'discount_starts_at.required_if' => 'Discount start date is required when discount is active.',
            'discount_starts_at.after_or_equal' => 'Discount start date cannot be in the past.',
            'discount_ends_at.required_if' => 'Discount end date is required when discount is active.',
            'discount_ends_at.after' => 'Discount end date must be after the start date.',
        ];
    }
}
