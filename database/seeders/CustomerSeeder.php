<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = [
            [
                'name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'phone' => '+1234567890',
                'address' => '123 Main Street, New York, NY 10001',
                'tax_number' => 'TAX123456789',
                'type' => 'individual',
                'total_spent' => 0.00,
                'total_orders' => 0,
                'last_purchase_date' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane.smith@example.com',
                'phone' => '+1234567891',
                'address' => '456 Oak Avenue, Los Angeles, CA 90210',
                'tax_number' => 'TAX123456790',
                'type' => 'individual',
                'total_spent' => 0.00,
                'total_orders' => 0,
                'last_purchase_date' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Tech Solutions Inc.',
                'email' => 'contact@techsolutions.com',
                'phone' => '+1234567892',
                'address' => '789 Business Boulevard, Chicago, IL 60601',
                'tax_number' => 'CORP123456789',
                'type' => 'business',
                'total_spent' => 0.00,
                'total_orders' => 0,
                'last_purchase_date' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah.johnson@example.com',
                'phone' => '+1234567893',
                'address' => '321 Pine Street, Miami, FL 33101',
                'tax_number' => 'TAX123456791',
                'type' => 'individual',
                'total_spent' => 0.00,
                'total_orders' => 0,
                'last_purchase_date' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Green Valley Corp',
                'email' => 'info@greenvalley.com',
                'phone' => '+1234567894',
                'address' => '654 Corporate Center, Seattle, WA 98101',
                'tax_number' => 'CORP123456790',
                'type' => 'business',
                'total_spent' => 0.00,
                'total_orders' => 0,
                'last_purchase_date' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Michael Brown',
                'email' => 'michael.brown@example.com',
                'phone' => '+1234567895',
                'address' => '987 Residential Road, Austin, TX 73301',
                'tax_number' => 'TAX123456792',
                'type' => 'individual',
                'total_spent' => 0.00,
                'total_orders' => 0,
                'last_purchase_date' => null,
                'is_active' => true,
            ],
        ];

        foreach ($customers as $customer) {
            \App\Models\Customer::create($customer);
        }
    }
}
