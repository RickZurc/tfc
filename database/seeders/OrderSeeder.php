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

        // Generate random number of total orders between 80 and 200
        $totalOrders = fake()->numberBetween(80, 200);
        
        // Calculate proportional counts
        $completedCount = (int) round($totalOrders * 0.70); // 70%
        $pendingCount = (int) round($totalOrders * 0.20);   // 20%
        $refundedCount = $totalOrders - $completedCount - $pendingCount; // Remaining ~10%

        // Create completed orders (70%)
        $completedOrders = Order::factory()
            ->count($completedCount)
            ->completed()
            ->create([
                'customer_id' => fn() => $customers->random()->id,
                'user_id' => fn() => $users->random()->id,
            ]);
        $orders = $orders->merge($completedOrders);

        // Create pending orders (20%)
        $pendingOrders = Order::factory()
            ->count($pendingCount)
            ->pending()
            ->create([
                'customer_id' => fn() => $customers->random()->id,
                'user_id' => fn() => $users->random()->id,
            ]);
        $orders = $orders->merge($pendingOrders);

        // Create refunded orders (~10%)
        $refundedOrders = Order::factory()
            ->count($refundedCount)
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

        $this->command->info('Created ' . $orders->count() . ' orders (Target: ' . $totalOrders . '):');
        $this->command->table(
            ['Status', 'Count', 'Percentage'],
            [
                ['Completed', $orders->where('status', 'completed')->count(), round(($orders->where('status', 'completed')->count() / $orders->count()) * 100, 1) . '%'],
                ['Pending', $orders->where('status', 'pending')->count(), round(($orders->where('status', 'pending')->count() / $orders->count()) * 100, 1) . '%'],
                ['Refunded', $orders->where('status', 'refunded')->count(), round(($orders->where('status', 'refunded')->count() / $orders->count()) * 100, 1) . '%'],
            ]
        );

        $this->command->info('Order seeding completed successfully!');
    }
}
