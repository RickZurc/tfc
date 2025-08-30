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
     * Product templates by category for more realistic products
     */
    private static array $productTemplates = [
        'Electronics' => [
            'names' => ['Wireless Earbuds', 'Phone Charger', 'Bluetooth Speaker', 'Power Bank', 'USB Cable', 'Screen Protector', 'Phone Case', 'Tablet Stand', 'Keyboard', 'Mouse', 'Webcam', 'Headphones'],
            'units' => ['piece', 'pack'],
            'tax_rate_range' => [10.00, 15.00],
            'price_range' => [15.00, 200.00],
            'cost_multiplier' => [0.3, 0.6],
        ],
        'Beverages' => [
            'names' => ['Coffee', 'Tea', 'Bottled Water', 'Energy Drink', 'Soda', 'Orange Juice', 'Apple Juice', 'Sports Drink', 'Iced Tea', 'Smoothie', 'Lemonade', 'Coconut Water'],
            'units' => ['bottle', 'can', 'pack', 'liter'],
            'tax_rate_range' => [0.00, 5.00],
            'price_range' => [1.50, 15.00],
            'cost_multiplier' => [0.4, 0.7],
        ],
        'Snacks' => [
            'names' => ['Chocolate Bar', 'Potato Chips', 'Mixed Nuts', 'Granola Bar', 'Cookies', 'Crackers', 'Pretzels', 'Trail Mix', 'Candy', 'Dried Fruit', 'Popcorn', 'Beef Jerky'],
            'units' => ['piece', 'pack', 'bag'],
            'tax_rate_range' => [5.00, 10.00],
            'price_range' => [2.00, 12.00],
            'cost_multiplier' => [0.3, 0.5],
        ],
        'Personal Care' => [
            'names' => ['Hand Sanitizer', 'Toothbrush', 'Toothpaste', 'Shampoo', 'Soap', 'Deodorant', 'Lotion', 'Tissues', 'Lip Balm', 'Comb', 'Razor', 'Hand Cream'],
            'units' => ['bottle', 'tube', 'piece', 'pack'],
            'tax_rate_range' => [0.00, 5.00],
            'price_range' => [3.00, 25.00],
            'cost_multiplier' => [0.4, 0.6],
        ],
        'Office Supplies' => [
            'names' => ['Ballpoint Pen', 'Notebook', 'Pencil', 'Eraser', 'Ruler', 'Stapler', 'Paper Clips', 'Sticky Notes', 'Highlighter', 'Folder', 'Binder', 'Calculator'],
            'units' => ['piece', 'pack', 'box'],
            'tax_rate_range' => [0.00, 10.00],
            'price_range' => [1.00, 30.00],
            'cost_multiplier' => [0.2, 0.5],
        ],
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->words(3, true);
        $costPrice = $this->faker->randomFloat(2, 1, 100);
        $markup = $this->faker->randomFloat(2, 1.2, 3.0);
        $price = round($costPrice * $markup, 2);
        $trackStock = $this->faker->boolean(80);

        return [
            'category_id' => Category::factory(),
            'name' => $name,
            'slug' => Str::slug($name) . '-' . $this->faker->unique()->numberBetween(1, 9999),
            'description' => $this->faker->sentence($this->faker->numberBetween(6, 15)),
            'sku' => strtoupper(Str::random(3)) . '-' . $this->faker->unique()->numberBetween(1000, 9999),
            'barcode' => $this->faker->optional(0.7)->ean13(),
            'price' => $price,
            'cost_price' => $costPrice,
            'stock_quantity' => $trackStock ? $this->faker->numberBetween(0, 200) : 0,
            'min_stock_level' => $trackStock ? $this->faker->numberBetween(5, 25) : 0,
            'unit' => $this->faker->randomElement(['piece', 'pack', 'bottle', 'can', 'box', 'tube', 'bag']),
            'image_url' => null,
            'is_active' => $this->faker->boolean(90),
            'track_stock' => $trackStock,
            'tax_rate' => $this->faker->randomElement([0.00, 5.00, 10.00, 15.00]),
        ];
    }

    /**
     * Create a product for a specific category with appropriate characteristics
     */
    public function forCategory(Category $category): static
    {
        return $this->state(function (array $attributes) use ($category) {
            $categoryName = $category->name;
            $template = self::$productTemplates[$categoryName] ?? null;
            
            if (!$template) {
                // Fallback for unknown categories
                return [
                    'category_id' => $category->id,
                ];
            }

            // Get random product name and add variation
            $baseName = $this->faker->randomElement($template['names']);
            $variations = ['', ' - Premium', ' - Standard', ' - Deluxe', ' - Classic', ' Pro', ' Max', ' Plus'];
            $productName = $baseName . $this->faker->randomElement($variations);

            // Calculate realistic pricing for this category
            $priceRange = $template['price_range'];
            $price = $this->faker->randomFloat(2, $priceRange[0], $priceRange[1]);
            
            $costMultiplier = $template['cost_multiplier'];
            $costPrice = $price * $this->faker->randomFloat(2, $costMultiplier[0], $costMultiplier[1]);

            return [
                'category_id' => $category->id,
                'name' => $productName,
                'slug' => Str::slug($productName) . '-' . $this->faker->unique()->numberBetween(1, 9999),
                'price' => $price,
                'cost_price' => round($costPrice, 2),
                'unit' => $this->faker->randomElement($template['units']),
                'tax_rate' => $this->faker->randomElement($template['tax_rate_range']),
            ];
        });
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
            'stock_quantity' => 0,
            'min_stock_level' => 0,
        ]);
    }

    /**
     * Create a premium/expensive product
     */
    public function premium(): static
    {
        return $this->state(function (array $attributes) {
            $costPrice = $this->faker->randomFloat(2, 50, 200);
            $markup = $this->faker->randomFloat(2, 1.5, 2.5);
            
            return [
                'name' => $attributes['name'] . ' - Premium',
                'cost_price' => $costPrice,
                'price' => round($costPrice * $markup, 2),
                'tax_rate' => $this->faker->randomElement([10.00, 15.00]),
            ];
        });
    }

    /**
     * Create a budget/cheap product
     */
    public function budget(): static
    {
        return $this->state(function (array $attributes) {
            $costPrice = $this->faker->randomFloat(2, 1, 20);
            $markup = $this->faker->randomFloat(2, 1.2, 2.0);
            
            return [
                'name' => $attributes['name'] . ' - Budget',
                'cost_price' => $costPrice,
                'price' => round($costPrice * $markup, 2),
                'tax_rate' => $this->faker->randomElement([0.00, 5.00]),
            ];
        });
    }
}
