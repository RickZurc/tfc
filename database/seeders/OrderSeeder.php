<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding orders...');

        // Get existing customers and users
        $customers = Customer::all();
        $users = User::all();

        if ($customers->isEmpty() || $users->isEmpty()) {
            $this->command->warn('No customers or users found. Please run CustomerSeeder first.');
            return;
        }

        // Create a variety of orders with different statuses
        $orders = collect();

        // Create completed orders (70%)
        $completedOrders = Order::factory()
            ->count(14)
            ->completed()
            ->create([
                'customer_id' => fn() => $customers->random()->id,
                'user_id' => fn() => $users->random()->id,
            ]);
        $orders = $orders->merge($completedOrders);

        // Create pending orders (20%)
        $pendingOrders = Order::factory()
            ->count(4)
            ->pending()
            ->create([
                'customer_id' => fn() => $customers->random()->id,
                'user_id' => fn() => $users->random()->id,
            ]);
        $orders = $orders->merge($pendingOrders);

        // Create refunded orders (10%)
        $refundedOrders = Order::factory()
            ->count(2)
            ->create([
                'customer_id' => fn() => $customers->random()->id,
                'user_id' => fn() => $users->random()->id,
                'status' => 'refunded',
                'refund_amount' => fn(array $attributes) => $attributes['total_amount'],
                'refund_reason' => fn() => fake()->randomElement([
                    'Product defective',
                    'Customer not satisfied',
                    'Wrong item delivered',
                    'Damaged during shipping'
                ]),
                'refunded_by' => fn() => $users->random()->id,
                'refunded_at' => fn() => fake()->dateTimeThisMonth(),
                'completed_at' => fn() => fake()->dateTimeThisMonth(),
            ]);
        $orders = $orders->merge($refundedOrders);

        $this->command->info('Created ' . $orders->count() . ' orders:');
        $this->command->table(
            ['Status', 'Count'],
            [
                ['Completed', $orders->where('status', 'completed')->count()],
                ['Pending', $orders->where('status', 'pending')->count()],
                ['Refunded', $orders->where('status', 'refunded')->count()],
            ]
        );

        $this->command->info('Order seeding completed successfully!');
    }
}
