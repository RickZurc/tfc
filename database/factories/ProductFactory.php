<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->words(3, true);

        return [
            'category_id' => Category::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.$this->faker->unique()->numberBetween(1, 9999),
            'description' => $this->faker->paragraph(),
            'sku' => strtoupper($this->faker->unique()->bothify('???-###')),
            'barcode' => $this->faker->optional()->ean13(),
            'price' => $this->faker->randomFloat(2, 1, 1000),
            'cost_price' => $this->faker->randomFloat(2, 0.5, 500),
            'stock_quantity' => $this->faker->numberBetween(0, 500),
            'min_stock_level' => $this->faker->numberBetween(1, 50),
            'unit' => $this->faker->randomElement(['piece', 'kg', 'liter', 'box', 'pack']),
            'image_url' => $this->faker->optional()->imageUrl(),
            'is_active' => $this->faker->boolean(90), // 90% chance of being active
            'track_stock' => $this->faker->boolean(80), // 80% chance of tracking stock
            'tax_rate' => $this->faker->randomFloat(2, 0, 25),
        ];
    }

    /**
     * Indicate that the product is out of stock.
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock_quantity' => 0,
            'track_stock' => true,
        ]);
    }

    /**
     * Indicate that the product has low stock.
     */
    public function lowStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock_quantity' => $this->faker->numberBetween(1, 5),
            'min_stock_level' => $this->faker->numberBetween(5, 10),
            'track_stock' => true,
        ]);
    }

    /**
     * Indicate that the product is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the product doesn't track stock.
     */
    public function noStockTracking(): static
    {
        return $this->state(fn (array $attributes) => [
            'track_stock' => false,
            'stock_quantity' => null,
            'min_stock_level' => null,
        ]);
    }
}
