<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@pos.com',
            'password' => bcrypt('password'),
        ]);

        // Create cashier user
        User::factory()->create([
            'name' => 'Cashier User',
            'email' => 'cashier@pos.com',
            'password' => bcrypt('password'),
        ]);

        // Seed POS data in correct order (dependencies matter)
        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
            CustomerSeeder::class,
            OrderSeeder::class,
            OrderItemSeeder::class,
        ]);
    }
}
