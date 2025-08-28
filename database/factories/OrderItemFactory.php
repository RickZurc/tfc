<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => \App\Models\Order::factory(),
            'product_id' => \App\Models\Product::factory(),
            'product_name' => $this->faker->words(2, true),
            'product_sku' => $this->faker->unique()->bothify('SKU-###-??'),
            'unit_price' => $this->faker->randomFloat(2, 10, 1000),
            'quantity' => $this->faker->numberBetween(1, 5),
            'total_price' => 0, // Will be calculated
            'tax_rate' => $this->faker->randomFloat(2, 0, 15),
            'tax_amount' => 0, // Will be calculated
        ];
    }

    /**
     * Create item with product data.
     */
    public function withProduct(\App\Models\Product $product): static
    {
        return $this->state(fn (array $attributes) => [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_sku' => $product->sku,
            'unit_price' => $product->price,
        ]);
    }
}
