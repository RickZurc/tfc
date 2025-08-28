<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class OrderItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $orders = \App\Models\Order::all();
        $products = \App\Models\Product::all();

        if ($orders->isEmpty() || $products->isEmpty()) {
            $this->command->warn('No orders or products found. Please run OrderSeeder and ProductSeeder first.');

            return;
        }

        // Order items for different orders
        $orderItems = [
            // Order 1 (ORD-2025-001) - Wireless Earbuds
            [
                'order_id' => $orders->where('order_number', 'ORD-2025-001')->first()->id,
                'product_id' => $products->where('sku', 'ELEC-001')->first()->id,
                'product_name' => 'Wireless Earbuds',
                'product_sku' => 'ELEC-001',
                'unit_price' => 89.99,
                'quantity' => 1,
                'total_price' => 89.99,
                'tax_rate' => 10.00,
                'tax_amount' => 9.00,
            ],

            // Order 2 (ORD-2025-002) - Phone Charger + Bottled Water
            [
                'order_id' => $orders->where('order_number', 'ORD-2025-002')->first()->id,
                'product_id' => $products->where('sku', 'ELEC-002')->first()->id,
                'product_name' => 'Phone Charger',
                'product_sku' => 'ELEC-002',
                'unit_price' => 24.99,
                'quantity' => 1,
                'total_price' => 24.99,
                'tax_rate' => 10.00,
                'tax_amount' => 2.50,
            ],
            [
                'order_id' => $orders->where('order_number', 'ORD-2025-002')->first()->id,
                'product_id' => $products->where('sku', 'BEV-002')->first()->id,
                'product_name' => 'Bottled Water',
                'product_sku' => 'BEV-002',
                'unit_price' => 1.99,
                'quantity' => 1,
                'total_price' => 1.99,
                'tax_rate' => 0.00,
                'tax_amount' => 0.00,
            ],

            // Order 3 (ORD-2025-003) - Multiple snacks
            [
                'order_id' => $orders->where('order_number', 'ORD-2025-003')->first()->id,
                'product_id' => $products->where('sku', 'SNK-001')->first()->id,
                'product_name' => 'Chocolate Bar',
                'product_sku' => 'SNK-001',
                'unit_price' => 3.99,
                'quantity' => 5,
                'total_price' => 19.95,
                'tax_rate' => 5.00,
                'tax_amount' => 1.00,
            ],
            [
                'order_id' => $orders->where('order_number', 'ORD-2025-003')->first()->id,
                'product_id' => $products->where('sku', 'SNK-002')->first()->id,
                'product_name' => 'Potato Chips',
                'product_sku' => 'SNK-002',
                'unit_price' => 2.99,
                'quantity' => 4,
                'total_price' => 11.96,
                'tax_rate' => 5.00,
                'tax_amount' => 0.60,
            ],
            [
                'order_id' => $orders->where('order_number', 'ORD-2025-003')->first()->id,
                'product_id' => $products->where('sku', 'BEV-001')->first()->id,
                'product_name' => 'Coffee - Premium Blend',
                'product_sku' => 'BEV-001',
                'unit_price' => 12.99,
                'quantity' => 1,
                'total_price' => 12.99,
                'tax_rate' => 5.00,
                'tax_amount' => 0.65,
            ],
            [
                'order_id' => $orders->where('order_number', 'ORD-2025-003')->first()->id,
                'product_id' => $products->where('sku', 'BEV-002')->first()->id,
                'product_name' => 'Bottled Water',
                'product_sku' => 'BEV-002',
                'unit_price' => 1.99,
                'quantity' => 1,
                'total_price' => 1.99,
                'tax_rate' => 0.00,
                'tax_amount' => 0.00,
            ],

            // Order 4 (ORD-2025-004) - Pending order
            [
                'order_id' => $orders->where('order_number', 'ORD-2025-004')->first()->id,
                'product_id' => $products->where('sku', 'BEV-001')->first()->id,
                'product_name' => 'Coffee - Premium Blend',
                'product_sku' => 'BEV-001',
                'unit_price' => 12.99,
                'quantity' => 1,
                'total_price' => 12.99,
                'tax_rate' => 5.00,
                'tax_amount' => 0.65,
            ],
            [
                'order_id' => $orders->where('order_number', 'ORD-2025-004')->first()->id,
                'product_id' => $products->where('sku', 'SNK-001')->first()->id,
                'product_name' => 'Chocolate Bar',
                'product_sku' => 'SNK-001',
                'unit_price' => 3.99,
                'quantity' => 1,
                'total_price' => 3.99,
                'tax_rate' => 5.00,
                'tax_amount' => 0.20,
            ],

            // Order 5 (ORD-2025-005) - Refunded order
            [
                'order_id' => $orders->where('order_number', 'ORD-2025-005')->first()->id,
                'product_id' => $products->where('sku', 'ELEC-002')->first()->id,
                'product_name' => 'Phone Charger',
                'product_sku' => 'ELEC-002',
                'unit_price' => 24.99,
                'quantity' => 1,
                'total_price' => 24.99,
                'tax_rate' => 10.00,
                'tax_amount' => 2.50,
            ],
        ];

        foreach ($orderItems as $item) {
            \App\Models\OrderItem::create($item);
        }
    }
}
