<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding categories...');

        // Create all predefined categories using the factory templates
        $categories = Category::factory()->allCategories();

        $this->command->info('Created ' . count($categories) . ' categories:');
        foreach ($categories as $category) {
            $this->command->line("  • {$category->name} ({$category->slug}) - {$category->icon}");
        }

        $this->command->info('Category seeding completed successfully!');
    }
}
