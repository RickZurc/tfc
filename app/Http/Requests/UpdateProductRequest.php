<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
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
        $productId = $this->route('product');

        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'category_id' => ['required', 'exists:categories,id'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'cost_price' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'sku' => ['required', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($productId)],
            'barcode' => ['nullable', 'string', 'max:100', Rule::unique('products', 'barcode')->ignore($productId)],
            'track_stock' => ['boolean'],
            'stock_quantity' => ['required_if:track_stock,true', 'nullable', 'integer', 'min:0'],
            'min_stock_level' => ['required_if:track_stock,true', 'nullable', 'integer', 'min:0'],
            'max_stock_level' => ['nullable', 'integer', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'dimensions' => ['nullable', 'string', 'max:100'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['boolean'],
            
            // Discount fields handled conditionally below
            'discount_active' => ['sometimes', 'boolean'],
        ];
        
        // Normalize incoming discount_active to boolean-ish value
        $discountActiveRaw = $this->input('discount_active');
        $discountActive = filter_var($discountActiveRaw, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

        // If discount is active (true-ish), apply stricter rules. We allow different representations
        // of boolean values from the request ("true", "1", 1, "on", etc.).
        if ($discountActive === true) {
            $rules['discount_type'] = ['required', 'in:percentage,fixed'];

            // If discount type is percentage, require percentage field
            $discountType = $this->input('discount_type');
            if ($discountType === 'percentage') {
                $rules['discount_percentage'] = ['required', 'numeric', 'min:0', 'max:100'];
                // discount_amount is not required in this case, allow nullable
                $rules['discount_amount'] = ['nullable', 'numeric', 'min:0'];
            } elseif ($discountType === 'fixed') {
                $rules['discount_amount'] = ['required', 'numeric', 'min:0'];
                $rules['discount_percentage'] = ['nullable', 'numeric', 'min:0', 'max:100'];
            } else {
                // If discount_type is not provided yet, validate both as nullable and let discount_type rule catch missing type
                $rules['discount_percentage'] = ['nullable', 'numeric', 'min:0', 'max:100'];
                $rules['discount_amount'] = ['nullable', 'numeric', 'min:0'];
            }

            $rules['discount_starts_at'] = ['required', 'date'];
            $rules['discount_ends_at'] = ['required', 'date', 'after:discount_starts_at'];
        } else {
            // Discount not active: make discount fields nullable
            $rules['discount_type'] = ['nullable', 'in:percentage,fixed'];
            $rules['discount_percentage'] = ['nullable', 'numeric', 'min:0', 'max:100'];
            $rules['discount_amount'] = ['nullable', 'numeric', 'min:0'];
            $rules['discount_starts_at'] = ['nullable', 'date'];
            $rules['discount_ends_at'] = ['nullable', 'date'];
        }

        return $rules;
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
            'sku.required' => 'SKU is required.',
            'sku.unique' => 'This SKU is already in use.',
            'barcode.unique' => 'This barcode is already in use.',
            'stock_quantity.required_if' => 'Stock quantity is required when stock tracking is enabled.',
            'min_stock_level.required_if' => 'Minimum stock level is required when stock tracking is enabled.',
            
            // Discount messages
            'discount_type.required_if' => 'Discount type is required when discount is active.',
            'discount_type.in' => 'Discount type must be either percentage or fixed amount.',
            'discount_percentage.required_if' => 'Discount percentage is required for percentage discounts.',
            'discount_percentage.max' => 'Discount percentage cannot exceed 100%.',
            'discount_amount.required_if' => 'Discount amount is required for fixed amount discounts.',
            'discount_starts_at.required_if' => 'Discount start date is required when discount is active.',
            'discount_ends_at.required_if' => 'Discount end date is required when discount is active.',
            'discount_ends_at.after' => 'Discount end date must be after the start date.',
        ];
    }
}
