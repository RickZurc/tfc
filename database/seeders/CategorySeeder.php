<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Electronics',
                'slug' => 'electronics',
                'description' => 'Electronic devices and accessories',
                'color' => '#3B82F6',
                'icon' => 'smartphone',
                'is_active' => true,
            ],
            [
                'name' => 'Beverages',
                'slug' => 'beverages',
                'description' => 'Drinks and beverages',
                'color' => '#10B981',
                'icon' => 'coffee',
                'is_active' => true,
            ],
            [
                'name' => 'Snacks',
                'slug' => 'snacks',
                'description' => 'Snacks and quick bites',
                'color' => '#F59E0B',
                'icon' => 'cookie',
                'is_active' => true,
            ],
            [
                'name' => 'Personal Care',
                'slug' => 'personal-care',
                'description' => 'Personal care and hygiene products',
                'color' => '#EF4444',
                'icon' => 'heart',
                'is_active' => true,
            ],
            [
                'name' => 'Office Supplies',
                'slug' => 'office-supplies',
                'description' => 'Office and stationery items',
                'color' => '#8B5CF6',
                'icon' => 'briefcase',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::create($category);
        }
    }
}
