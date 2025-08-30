<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Predefined category templates for more realistic data
     */
    private static array $categoryTemplates = [
        [
            'name' => 'Electronics',
            'description' => 'Electronic devices, gadgets, and accessories',
            'color' => '#3B82F6', // Blue
            'icon' => 'smartphone',
        ],
        [
            'name' => 'Beverages',
            'description' => 'Drinks, juices, water, and other beverages',
            'color' => '#06B6D4', // Cyan
            'icon' => 'coffee',
        ],
        [
            'name' => 'Snacks',
            'description' => 'Snacks, chips, nuts, and quick bites',
            'color' => '#F59E0B', // Amber
            'icon' => 'cookie',
        ],
        [
            'name' => 'Personal Care',
            'description' => 'Personal hygiene and care products',
            'color' => '#EC4899', // Pink
            'icon' => 'heart',
        ],
        [
            'name' => 'Office Supplies',
            'description' => 'Stationery, office tools, and supplies',
            'color' => '#8B5CF6', // Violet
            'icon' => 'briefcase',
        ],
        [
            'name' => 'Home & Garden',
            'description' => 'Home improvement and gardening supplies',
            'color' => '#10B981', // Emerald
            'icon' => 'home',
        ],
        [
            'name' => 'Sports & Outdoors',
            'description' => 'Sports equipment and outdoor gear',
            'color' => '#F97316', // Orange
            'icon' => 'dumbbell',
        ],
        [
            'name' => 'Books & Media',
            'description' => 'Books, magazines, and media products',
            'color' => '#7C2D12', // Brown
            'icon' => 'book',
        ],
        [
            'name' => 'Health & Wellness',
            'description' => 'Health supplements and wellness products',
            'color' => '#DC2626', // Red
            'icon' => 'heart-pulse',
        ],
        [
            'name' => 'Automotive',
            'description' => 'Car accessories and automotive supplies',
            'color' => '#374151', // Gray
            'icon' => 'car',
        ],
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->words(2, true);

        return [
            'name' => $name,
            'slug' => Str::slug($name) . '-' . $this->faker->unique()->numberBetween(1, 999),
            'description' => $this->faker->optional(0.8)->sentence(),
            'color' => $this->faker->hexColor(),
            'icon' => $this->faker->optional(0.9)->randomElement([
                'package', 'shopping-cart', 'tag', 'star', 'heart', 'home', 'coffee', 
                'smartphone', 'laptop', 'book', 'car', 'dumbbell', 'briefcase'
            ]),
            'is_active' => $this->faker->boolean(95), // 95% chance of being active
        ];
    }

    /**
     * Create a category from predefined realistic templates
     */
    public function realistic(): static
    {
        return $this->state(function (array $attributes) {
            $template = $this->faker->randomElement(self::$categoryTemplates);
            
            return [
                'name' => $template['name'],
                'slug' => Str::slug($template['name']),
                'description' => $template['description'],
                'color' => $template['color'],
                'icon' => $template['icon'],
                'is_active' => true,
            ];
        });
    }

    /**
     * Create a specific category by name from templates
     */
    public function named(string $categoryName): static
    {
        return $this->state(function (array $attributes) use ($categoryName) {
            $template = collect(self::$categoryTemplates)
                ->firstWhere('name', $categoryName);
            
            if (!$template) {
                // Fallback if category name not found
                return [
                    'name' => $categoryName,
                    'slug' => Str::slug($categoryName),
                    'description' => "Products in the {$categoryName} category",
                    'color' => $this->faker->hexColor(),
                    'icon' => $this->faker->randomElement(['package', 'tag', 'star']),
                ];
            }
            
            return [
                'name' => $template['name'],
                'slug' => Str::slug($template['name']),
                'description' => $template['description'],
                'color' => $template['color'],
                'icon' => $template['icon'],
                'is_active' => true,
            ];
        });
    }

    /**
     * Create all predefined realistic categories
     */
    public function allCategories(): array
    {
        $categories = [];
        
        foreach (self::$categoryTemplates as $template) {
            // Use firstOrCreate to avoid duplicates
            $category = \App\Models\Category::firstOrCreate(
                ['slug' => Str::slug($template['name'])],
                [
                    'name' => $template['name'],
                    'slug' => Str::slug($template['name']),
                    'description' => $template['description'],
                    'color' => $template['color'],
                    'icon' => $template['icon'],
                    'is_active' => true,
                ]
            );
            
            $categories[] = $category;
        }
        
        return $categories;
    }

    /**
     * Get all available realistic category names
     */
    public static function getRealisticCategoryNames(): array
    {
        return collect(self::$categoryTemplates)->pluck('name')->toArray();
    }

    /**
     * Indicate that the category is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Create a category with a specific color theme
     */
    public function withColor(string $color): static
    {
        return $this->state(fn (array $attributes) => [
            'color' => $color,
        ]);
    }

    /**
     * Create a category with a specific icon
     */
    public function withIcon(string $icon): static
    {
        return $this->state(fn (array $attributes) => [
            'icon' => $icon,
        ]);
    }
}
