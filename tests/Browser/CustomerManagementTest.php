<?php

use App\Models\{User, Customer, Order};
use Illuminate\Foundation\Testing\RefreshDatabase;
use function Pest\Laravel\{actingAs};

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    
    // Create test customers with various attributes
    $this->customers = collect([
        Customer::factory()->create([
            'name' => 'Alice Johnson',
            'email' => 'alice@example.com',
            'phone' => '555-0101',
            'status' => 'active',
            'created_at' => now()->subDays(30),
        ]),
        Customer::factory()->create([
            'name' => 'Bob Smith',
            'email' => 'bob@example.com',
            'phone' => '555-0102',
            'status' => 'active',
            'created_at' => now()->subDays(15),
        ]),
        Customer::factory()->create([
            'name' => 'Charlie Brown',
            'email' => 'charlie@example.com',
            'phone' => '555-0103',
            'status' => 'inactive',
            'created_at' => now()->subDays(5),
        ]),
    ]);
    
    // Create orders for customers to test relationships
    Order::factory()->count(3)->create([
        'customer_id' => $this->customers[0]->id,
        'total_amount' => 199.99,
    ]);
    
    Order::factory()->create([
        'customer_id' => $this->customers[1]->id,
        'total_amount' => 299.99,
    ]);
});

describe('Customer Index Page', function () {
    it('displays all customers with their information', function () {
        actingAs($this->user);
        
        $page = visit('/customers');
        
        $page->assertSee('Customers')
            ->assertSee('Customer Management')
            ->assertSee('Alice Johnson')
            ->assertSee('Bob Smith')
            ->assertSee('Charlie Brown')
            ->assertSee('alice@example.com')
            ->assertSee('bob@example.com')
            ->assertSee('charlie@example.com')
            ->assertSee('555-0101')
            ->assertSee('555-0102')
            ->assertSee('555-0103')
            ->assertSee('Active')
            ->assertSee('Inactive')
            ->assertNoJavascriptErrors();
    });

    it('can search customers by name, email, or phone', function () {
        actingAs($this->user);
        
        $page = visit('/customers');
        
        // Search by name
        $page->fill('[data-testid="search-input"]', 'Alice')
            ->click('[data-testid="search-button"]')
            ->waitForText('Alice Johnson')
            ->assertSee('Alice Johnson')
            ->assertDontSee('Bob Smith')
            ->assertDontSee('Charlie Brown')
            ->assertNoJavascriptErrors();
        
        // Search by email
        $page->fill('[data-testid="search-input"]', 'bob@example.com')
            ->click('[data-testid="search-button"]')
            ->waitForText('Bob Smith')
            ->assertSee('Bob Smith')
            ->assertDontSee('Alice Johnson')
            ->assertDontSee('Charlie Brown')
            ->assertNoJavascriptErrors();
        
        // Search by phone
        $page->fill('[data-testid="search-input"]', '555-0103')
            ->click('[data-testid="search-button"]')
            ->waitForText('Charlie Brown')
            ->assertSee('Charlie Brown')
            ->assertDontSee('Alice Johnson')
            ->assertDontSee('Bob Smith')
            ->assertNoJavascriptErrors();
    });

    it('can filter customers by status', function () {
        actingAs($this->user);
        
        $page = visit('/customers');
        
        // Filter by active status
        $page->selectValue('[data-testid="status-filter"]', 'active')
            ->waitForText('Alice Johnson')
            ->assertSee('Alice Johnson')
            ->assertSee('Bob Smith')
            ->assertDontSee('Charlie Brown')
            ->assertNoJavascriptErrors();
        
        // Filter by inactive status
        $page->selectValue('[data-testid="status-filter"]', 'inactive')
            ->waitForText('Charlie Brown')
            ->assertSee('Charlie Brown')
            ->assertDontSee('Alice Johnson')
            ->assertDontSee('Bob Smith')
            ->assertNoJavascriptErrors();
    });

    it('can sort customers by different fields', function () {
        actingAs($this->user);
        
        $page = visit('/customers');
        
        // Sort by name
        $page->click('[data-testid="sort-name"]')
            ->waitFor(1000) // Wait for sort to apply
            ->assertNoJavascriptErrors();
        
        // Sort by creation date
        $page->click('[data-testid="sort-created"]')
            ->waitFor(1000)
            ->assertNoJavascriptErrors();
        
        // Sort by total orders
        $page->click('[data-testid="sort-orders"]')
            ->waitFor(1000)
            ->assertNoJavascriptErrors();
    });

    it('shows customer statistics', function () {
        actingAs($this->user);
        
        $page = visit('/customers');
        
        $page->assertSee('Total Customers')
            ->assertSee('Active Customers')
            ->assertSee('New This Month')
            ->assertSee('Customer Growth')
            ->assertElementExists('[data-testid="total-customers-count"]')
            ->assertElementExists('[data-testid="active-customers-count"]')
            ->assertElementExists('[data-testid="new-customers-month"]')
            ->assertNoJavascriptErrors();
    });

    it('can export customers to CSV', function () {
        actingAs($this->user);
        
        $page = visit('/customers');
        
        $page->click('[data-testid="export-customers"]')
            ->waitForDownload()
            ->assertNoJavascriptErrors();
    });
});

describe('Customer Creation', function () {
    it('can create new customer with valid data', function () {
        actingAs($this->user);
        
        $page = visit('/customers/create');
        
        $page->assertSee('Create Customer')
            ->fill('name', 'David Wilson')
            ->fill('email', 'david@example.com')
            ->fill('phone', '555-0104')
            ->selectValue('status', 'active')
            ->fill('address', '123 Main St')
            ->fill('city', 'New York')
            ->fill('postal_code', '10001')
            ->fill('notes', 'VIP customer')
            ->click('Create Customer')
            ->waitForPath('/customers')
            ->assertSee('Customer created successfully')
            ->assertSee('David Wilson')
            ->assertNoJavascriptErrors();
        
        // Verify customer was created in database
        $customer = Customer::where('email', 'david@example.com')->first();
        expect($customer)->not->toBeNull();
        expect($customer->name)->toBe('David Wilson');
        expect($customer->phone)->toBe('555-0104');
        expect($customer->status)->toBe('active');
    });

    it('validates required fields', function () {
        actingAs($this->user);
        
        $page = visit('/customers/create');
        
        $page->click('Create Customer')
            ->waitForText('The name field is required')
            ->assertSee('The name field is required')
            ->assertSee('The email field is required')
            ->assertSee('The phone field is required')
            ->assertNoJavascriptErrors();
    });

    it('validates email format', function () {
        actingAs($this->user);
        
        $page = visit('/customers/create');
        
        $page->fill('name', 'Test User')
            ->fill('email', 'invalid-email')
            ->fill('phone', '555-0105')
            ->click('Create Customer')
            ->waitForText('The email field must be a valid email address')
            ->assertSee('The email field must be a valid email address')
            ->assertNoJavascriptErrors();
    });

    it('validates unique email', function () {
        actingAs($this->user);
        
        $page = visit('/customers/create');
        
        $page->fill('name', 'Test User')
            ->fill('email', 'alice@example.com') // Existing email
            ->fill('phone', '555-0105')
            ->click('Create Customer')
            ->waitForText('The email has already been taken')
            ->assertSee('The email has already been taken')
            ->assertNoJavascriptErrors();
    });

    it('can cancel customer creation', function () {
        actingAs($this->user);
        
        $page = visit('/customers/create');
        
        $page->fill('name', 'Test User')
            ->fill('email', 'test@example.com')
            ->click('Cancel')
            ->waitForPath('/customers')
            ->assertDontSee('Test User')
            ->assertNoJavascriptErrors();
    });
});

describe('Customer Details and Editing', function () {
    it('shows customer details with order history', function () {
        actingAs($this->user);
        
        $customer = $this->customers[0];
        
        $page = visit("/customers/{$customer->id}");
        
        $page->assertSee('Customer Details')
            ->assertSee('Alice Johnson')
            ->assertSee('alice@example.com')
            ->assertSee('555-0101')
            ->assertSee('Active')
            ->assertSee('Order History')
            ->assertSee('3 orders') // Customer has 3 orders
            ->assertSee('$199.99')
            ->assertNoJavascriptErrors();
    });

    it('can edit customer information', function () {
        actingAs($this->user);
        
        $customer = $this->customers[0];
        
        $page = visit("/customers/{$customer->id}/edit");
        
        $page->assertSee('Edit Customer')
            ->assertInputValue('name', 'Alice Johnson')
            ->assertInputValue('email', 'alice@example.com')
            ->assertInputValue('phone', '555-0101')
            ->fill('name', 'Alice Johnson Updated')
            ->fill('phone', '555-0199')
            ->selectValue('status', 'inactive')
            ->click('Update Customer')
            ->waitForPath("/customers/{$customer->id}")
            ->assertSee('Customer updated successfully')
            ->assertSee('Alice Johnson Updated')
            ->assertSee('555-0199')
            ->assertSee('Inactive')
            ->assertNoJavascriptErrors();
        
        // Verify customer was updated in database
        $customer->refresh();
        expect($customer->name)->toBe('Alice Johnson Updated');
        expect($customer->phone)->toBe('555-0199');
        expect($customer->status)->toBe('inactive');
    });

    it('can delete customer without orders', function () {
        actingAs($this->user);
        
        $customer = $this->customers[2]; // Charlie has no orders
        
        $page = visit("/customers/{$customer->id}");
        
        $page->click('[data-testid="delete-customer"]')
            ->waitForText('Delete Customer')
            ->assertSee('Are you sure you want to delete this customer?')
            ->click('Confirm Delete')
            ->waitForPath('/customers')
            ->assertSee('Customer deleted successfully')
            ->assertDontSee('Charlie Brown')
            ->assertNoJavascriptErrors();
        
        // Verify customer was deleted from database
        expect(Customer::find($customer->id))->toBeNull();
    });

    it('prevents deletion of customer with orders', function () {
        actingAs($this->user);
        
        $customer = $this->customers[0]; // Alice has orders
        
        $page = visit("/customers/{$customer->id}");
        
        $page->click('[data-testid="delete-customer"]')
            ->waitForText('Cannot Delete Customer')
            ->assertSee('This customer has existing orders and cannot be deleted')
            ->assertSee('You can deactivate the customer instead')
            ->click('Cancel')
            ->assertSee('Alice Johnson')
            ->assertNoJavascriptErrors();
        
        // Verify customer still exists in database
        expect(Customer::find($customer->id))->not->toBeNull();
    });

    it('can add notes to customer', function () {
        actingAs($this->user);
        
        $customer = $this->customers[0];
        
        $page = visit("/customers/{$customer->id}");
        
        $page->click('[data-testid="add-note"]')
            ->waitForText('Add Customer Note')
            ->fill('[data-testid="note-content"]', 'Customer prefers email communication')
            ->click('Save Note')
            ->waitForText('Note added successfully')
            ->assertSee('Note added successfully')
            ->assertSee('Customer prefers email communication')
            ->assertNoJavascriptErrors();
    });
});

describe('Customer Analytics', function () {
    it('displays customer analytics and insights', function () {
        actingAs($this->user);
        
        $page = visit('/customers?view=analytics');
        
        $page->assertSee('Customer Analytics')
            ->assertSee('Customer Acquisition')
            ->assertSee('Customer Lifetime Value')
            ->assertSee('Top Customers')
            ->assertSee('Customer Retention')
            ->assertElementExists('[data-testid="customer-growth-chart"]')
            ->assertElementExists('[data-testid="customer-value-chart"]')
            ->assertNoJavascriptErrors();
    });

    it('shows customer lifetime value calculations', function () {
        actingAs($this->user);
        
        $page = visit('/customers?view=analytics');
        
        $page->assertSee('Average Order Value')
            ->assertSee('Purchase Frequency')
            ->assertSee('Customer Lifespan')
            ->assertSee('Total CLV')
            ->assertNoJavascriptErrors();
    });

    it('can filter analytics by customer segments', function () {
        actingAs($this->user);
        
        $page = visit('/customers?view=analytics');
        
        $page->selectValue('[data-testid="segment-filter"]', 'high-value')
            ->waitForText('High-Value Customers')
            ->assertSee('High-Value Customers')
            ->assertNoJavascriptErrors();
        
        $page->selectValue('[data-testid="segment-filter"]', 'new')
            ->waitForText('New Customers')
            ->assertSee('New Customers')
            ->assertNoJavascriptErrors();
    });
});

describe('Customer Import/Export', function () {
    it('can import customers from CSV', function () {
        actingAs($this->user);
        
        $page = visit('/customers/import');
        
        $page->assertSee('Import Customers')
            ->assertSee('Upload CSV File')
            ->assertSee('Download Template')
            ->click('[data-testid="download-template"]')
            ->waitForDownload()
            ->assertNoJavascriptErrors();
    });

    it('validates CSV format during import', function () {
        actingAs($this->user);
        
        $page = visit('/customers/import');
        
        // Upload invalid CSV (this would need a test file)
        $page->attachFile('[data-testid="csv-file"]', 'tests/fixtures/invalid-customers.csv')
            ->click('Import Customers')
            ->waitForText('Invalid CSV format')
            ->assertSee('Invalid CSV format')
            ->assertNoJavascriptErrors();
    });
});

describe('Mobile Customer Management', function () {
    it('works correctly on mobile devices', function () {
        actingAs($this->user);
        
        $page = visit('/customers')
            ->resize(375, 667); // iPhone size
        
        $page->assertSee('Customers')
            ->assertElementExists('[data-testid="customers-table"]')
            ->assertNoJavascriptErrors();
        
        // Test mobile-specific interactions
        $customer = $this->customers[0];
        $page->click('[data-testid="customer-' . $customer->id . '"]')
            ->waitForPath("/customers/{$customer->id}")
            ->assertSee('Customer Details')
            ->assertNoJavascriptErrors();
    });

    it('displays mobile-optimized customer cards', function () {
        actingAs($this->user);
        
        $page = visit('/customers')
            ->resize(375, 667);
        
        $page->click('[data-testid="mobile-view-toggle"]')
            ->waitForText('Card View')
            ->assertElementExists('[data-testid="customer-card"]')
            ->assertNoJavascriptErrors();
    });
});
