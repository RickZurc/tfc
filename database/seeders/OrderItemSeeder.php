<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Seeder;

class OrderItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding order items...');

        $orders = Order::all();
        $products = Product::where('is_active', true)->get();

        if ($orders->isEmpty() || $products->isEmpty()) {
            $this->command->warn('No orders or active products found. Please run OrderSeeder and ProductSeeder first.');
            return;
        }

        $totalItems = 0;

        foreach ($orders as $order) {
            // Generate 1-5 items per order
            $itemCount = fake()->numberBetween(1, 5);
            $orderSubtotal = 0;
            $orderTaxAmount = 0;

            for ($i = 0; $i < $itemCount; $i++) {
                $product = $products->random();
                $quantity = fake()->numberBetween(1, 3);
                $unitPrice = $product->price;
                $totalPrice = $unitPrice * $quantity;
                $taxRate = $product->tax_rate ?? 10.0;
                $taxAmount = round($totalPrice * ($taxRate / 100), 2);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'unit_price' => $unitPrice,
                    'quantity' => $quantity,
                    'total_price' => $totalPrice,
                    'tax_rate' => $taxRate,
                    'tax_amount' => $taxAmount,
                ]);

                $orderSubtotal += $totalPrice;
                $orderTaxAmount += $taxAmount;
                $totalItems++;

                // Update product stock if tracking
                if ($product->track_stock) {
                    $product->decrement('stock_quantity', $quantity);
                }
            }

            // Update order totals based on actual items
            $discountAmount = $order->discount_amount ?? 0;
            $finalTotal = $orderSubtotal + $orderTaxAmount - $discountAmount;

            $order->update([
                'subtotal' => $orderSubtotal,
                'tax_amount' => $orderTaxAmount,
                'total_amount' => $finalTotal,
                'amount_paid' => $order->status === 'pending' ? 0 : $finalTotal + fake()->randomFloat(2, 0, 10),
                'change_amount' => $order->status === 'pending' ? 0 : fake()->randomFloat(2, 0, 5),
            ]);
        }

        $this->command->info("Created $totalItems order items across {$orders->count()} orders:");
        $this->command->table(
            ['Metric', 'Value'],
            [
                ['Total Items', $totalItems],
                ['Average Items per Order', round($totalItems / $orders->count(), 1)],
                ['Total Orders', $orders->count()],
                ['Products Used', $products->count()],
            ]
        );

        $this->command->info('Order items seeding completed successfully!');
    }
}
