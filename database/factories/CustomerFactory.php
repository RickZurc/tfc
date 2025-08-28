<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->optional(0.8)->passthrough($this->faker->unique()->safeEmail()),
            'phone' => $this->faker->optional(0.7)->passthrough($this->faker->phoneNumber()),
            'address' => $this->faker->optional(0.6)->passthrough($this->faker->address()),
            'tax_number' => $this->faker->optional(0.3)->passthrough($this->faker->numerify('###-##-####')),
            'type' => $this->faker->randomElement(['individual', 'business']),
            'total_spent' => $this->faker->randomFloat(2, 0, 10000),
            'total_orders' => $this->faker->numberBetween(0, 50),
            'last_purchase_date' => $this->faker->optional(0.7)->passthrough($this->faker->dateTimeBetween('-1 year', 'now')?->format('Y-m-d')),
            'is_active' => $this->faker->boolean(90),
        ];
    }
}
