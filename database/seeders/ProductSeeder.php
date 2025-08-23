<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            // Electronics
            [
                'category_id' => 1,
                'name' => 'Wireless Earbuds',
                'slug' => 'wireless-earbuds',
                'description' => 'High-quality wireless earbuds with noise cancellation',
                'sku' => 'ELEC-001',
                'barcode' => '1234567890123',
                'price' => 89.99,
                'cost_price' => 45.00,
                'stock_quantity' => 50,
                'min_stock_level' => 10,
                'unit' => 'piece',
                'tax_rate' => 10.00,
            ],
            [
                'category_id' => 1,
                'name' => 'Phone Charger',
                'slug' => 'phone-charger',
                'description' => 'Universal USB-C phone charger',
                'sku' => 'ELEC-002',
                'barcode' => '1234567890124',
                'price' => 24.99,
                'cost_price' => 12.00,
                'stock_quantity' => 75,
                'min_stock_level' => 15,
                'unit' => 'piece',
                'tax_rate' => 10.00,
            ],
            // Beverages
            [
                'category_id' => 2,
                'name' => 'Coffee - Premium Blend',
                'slug' => 'coffee-premium-blend',
                'description' => 'Premium coffee blend 250g',
                'sku' => 'BEV-001',
                'barcode' => '1234567890125',
                'price' => 12.99,
                'cost_price' => 6.50,
                'stock_quantity' => 30,
                'min_stock_level' => 5,
                'unit' => 'pack',
                'tax_rate' => 5.00,
            ],
            [
                'category_id' => 2,
                'name' => 'Bottled Water',
                'slug' => 'bottled-water',
                'description' => 'Pure spring water 500ml',
                'sku' => 'BEV-002',
                'barcode' => '1234567890126',
                'price' => 1.99,
                'cost_price' => 0.80,
                'stock_quantity' => 100,
                'min_stock_level' => 20,
                'unit' => 'bottle',
                'tax_rate' => 0.00,
            ],
            // Snacks
            [
                'category_id' => 3,
                'name' => 'Chocolate Bar',
                'slug' => 'chocolate-bar',
                'description' => 'Dark chocolate bar 100g',
                'sku' => 'SNK-001',
                'barcode' => '1234567890127',
                'price' => 3.99,
                'cost_price' => 1.80,
                'stock_quantity' => 60,
                'min_stock_level' => 10,
                'unit' => 'piece',
                'tax_rate' => 5.00,
            ],
            [
                'category_id' => 3,
                'name' => 'Potato Chips',
                'slug' => 'potato-chips',
                'description' => 'Classic salted potato chips 150g',
                'sku' => 'SNK-002',
                'barcode' => '1234567890128',
                'price' => 2.99,
                'cost_price' => 1.20,
                'stock_quantity' => 80,
                'min_stock_level' => 15,
                'unit' => 'pack',
                'tax_rate' => 5.00,
            ],
        ];

        foreach ($products as $product) {
            \App\Models\Product::create($product);
        }
    }
}
