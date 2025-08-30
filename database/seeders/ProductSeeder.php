<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get available categories
        $categories = Category::all();
        
        if ($categories->isEmpty()) {
            $this->command->warn('No categories found. Please run CategorySeeder first.');
            return;
        }

        $this->command->info('Creating products for each category...');

        foreach ($categories as $category) {
            $this->command->info("Creating products for category: {$category->name}");
            
            // Create 4-6 regular products per category
            $regularCount = fake()->numberBetween(4, 6);
            Product::factory()
                ->count($regularCount)
                ->forCategory($category)
                ->create();

            // Create 1-2 special state products for variety (10% of total)
            $specialCount = fake()->numberBetween(0, 2);
            
            if ($specialCount > 0) {
                // Mix of different states for more realistic data
                $states = ['outOfStock', 'lowStock', 'inactive', 'noStockTracking'];
                
                for ($i = 0; $i < $specialCount; $i++) {
                    $state = fake()->randomElement($states);
                    
                    Product::factory()
                        ->forCategory($category)
                        ->{$state}()
                        ->create();
                }
            }

            // Create 1 premium product for some categories (30% chance)
            if (fake()->boolean(30)) {
                Product::factory()
                    ->forCategory($category)
                    ->premium()
                    ->create();
            }

            // Create 1 budget product for some categories (40% chance)
            if (fake()->boolean(40)) {
                Product::factory()
                    ->forCategory($category)
                    ->budget()
                    ->create();
            }
        }

        $totalProducts = Product::count();
        $this->command->info("Successfully created {$totalProducts} products across {$categories->count()} categories!");
        
        // Show some statistics
        $activeProducts = Product::where('is_active', true)->count();
        $trackingStock = Product::where('track_stock', true)->count();
        $outOfStock = Product::where('track_stock', true)->where('stock_quantity', 0)->count();
        $lowStock = Product::whereRaw('track_stock = true AND stock_quantity <= min_stock_level')->count();
        
        $this->command->table(
            ['Metric', 'Count'],
            [
                ['Total Products', $totalProducts],
                ['Active Products', $activeProducts],
                ['Tracking Stock', $trackingStock],
                ['Out of Stock', $outOfStock],
                ['Low Stock', $lowStock],
            ]
        );
    }
}
