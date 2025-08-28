<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Generate sample orders using the existing customers and users
        $customers = \App\Models\Customer::all();
        $users = \App\Models\User::all();

        if ($customers->isEmpty() || $users->isEmpty()) {
            $this->command->warn('No customers or users found. Please run CustomerSeeder first.');

            return;
        }

        $orders = [
            [
                'order_number' => 'ORD-2025-001',
                'customer_id' => $customers->first()->id,
                'user_id' => $users->first()->id,
                'status' => 'completed',
                'subtotal' => 89.99,
                'tax_amount' => 9.00,
                'discount_amount' => 0.00,
                'total_amount' => 98.99,
                'payment_method' => 'cash',
                'amount_paid' => 100.00,
                'change_amount' => 1.01,
                'refund_amount' => 0.00,
                'refund_reason' => null,
                'notes' => 'First order of the day',
                'completed_at' => now()->subDays(7),
                'created_at' => now()->subDays(7),
                'updated_at' => now()->subDays(7),
            ],
            [
                'order_number' => 'ORD-2025-002',
                'customer_id' => $customers->skip(1)->first()->id,
                'user_id' => $users->first()->id,
                'status' => 'completed',
                'subtotal' => 27.98,
                'tax_amount' => 2.50,
                'discount_amount' => 2.00,
                'total_amount' => 28.48,
                'payment_method' => 'card',
                'amount_paid' => 28.48,
                'change_amount' => 0.00,
                'refund_amount' => 0.00,
                'refund_reason' => null,
                'notes' => 'Regular customer discount applied',
                'completed_at' => now()->subDays(5),
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],
            [
                'order_number' => 'ORD-2025-003',
                'customer_id' => $customers->skip(2)->first()->id,
                'user_id' => $users->last()->id,
                'status' => 'completed',
                'subtotal' => 45.96,
                'tax_amount' => 4.14,
                'discount_amount' => 0.00,
                'total_amount' => 50.10,
                'payment_method' => 'cash',
                'amount_paid' => 55.00,
                'change_amount' => 4.90,
                'refund_amount' => 0.00,
                'refund_reason' => null,
                'notes' => 'Bulk purchase',
                'completed_at' => now()->subDays(3),
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3),
            ],
            [
                'order_number' => 'ORD-2025-004',
                'customer_id' => $customers->skip(3)->first()->id,
                'user_id' => $users->first()->id,
                'status' => 'pending',
                'subtotal' => 15.98,
                'tax_amount' => 0.80,
                'discount_amount' => 0.00,
                'total_amount' => 16.78,
                'payment_method' => 'card',
                'amount_paid' => 0.00,
                'change_amount' => 0.00,
                'refund_amount' => 0.00,
                'refund_reason' => null,
                'notes' => 'Payment pending',
                'completed_at' => null,
                'created_at' => now()->subDays(1),
                'updated_at' => now()->subDays(1),
            ],
            [
                'order_number' => 'ORD-2025-005',
                'customer_id' => $customers->skip(4)->first()->id,
                'user_id' => $users->last()->id,
                'status' => 'refunded',
                'subtotal' => 24.99,
                'tax_amount' => 2.50,
                'discount_amount' => 0.00,
                'total_amount' => 27.49,
                'payment_method' => 'cash',
                'amount_paid' => 30.00,
                'change_amount' => 2.51,
                'refund_amount' => 27.49,
                'refund_reason' => 'Product defective',
                'notes' => 'Customer returned defective charger',
                'completed_at' => now()->subDays(2),
                'refunded_by' => $users->first()->id,
                'refunded_at' => now()->subHours(12),
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subHours(12),
            ],
        ];

        foreach ($orders as $order) {
            \App\Models\Order::create($order);
        }
    }
}
