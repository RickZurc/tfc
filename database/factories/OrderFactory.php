<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 10, 1000);
        $taxAmount = $subtotal * 0.1; // 10% tax
        $discountAmount = $this->faker->randomFloat(2, 0, $subtotal * 0.2); // Up to 20% discount
        $totalAmount = $subtotal + $taxAmount - $discountAmount;
        $amountPaid = $totalAmount + $this->faker->randomFloat(2, 0, 50); // Sometimes overpay

        return [
            'order_number' => $this->generateOrderNumber(),
            'customer_id' => $this->faker->optional(0.7)->randomElement([null, Customer::factory()]),
            'user_id' => User::factory(),
            'status' => $this->faker->randomElement(['pending', 'completed', 'cancelled']),
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'discount_amount' => $discountAmount,
            'total_amount' => $totalAmount,
            'payment_method' => $this->faker->randomElement(['cash', 'card', 'digital']),
            'amount_paid' => $amountPaid,
            'change_amount' => max(0, $amountPaid - $totalAmount),
            'notes' => $this->faker->optional()->sentence(),
            'completed_at' => $this->faker->optional(0.8)->dateTimeThisMonth(),
        ];
    }

    /**
     * Generate a unique order number.
     */
    private function generateOrderNumber(): string
    {
        return 'ORD-' . date('Ymd') . '-' . $this->faker->unique()->numberBetween(1000, 9999);
    }

    /**
     * Indicate that the order is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'completed_at' => $this->faker->dateTimeThisMonth(),
        ]);
    }

    /**
     * Indicate that the order is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'completed_at' => null,
        ]);
    }

    /**
     * Indicate that the order is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'completed_at' => null,
        ]);
    }
}
