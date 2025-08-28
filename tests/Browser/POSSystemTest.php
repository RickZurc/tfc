<?php

use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();

    // Create test categories and products
    $this->category = Category::factory()->create(['name' => 'Electronics']);

    $this->products = collect([
        Product::factory()->create([
            'name' => 'iPhone 15',
            'price' => 999.99,
            'sku' => 'IPH15-001',
            'stock_quantity' => 50,
            'category_id' => $this->category->id,
            'is_active' => true,
        ]),
        Product::factory()->create([
            'name' => 'AirPods Pro',
            'price' => 249.99,
            'sku' => 'APP-001',
            'stock_quantity' => 100,
            'category_id' => $this->category->id,
            'is_active' => true,
        ]),
        Product::factory()->create([
            'name' => 'MacBook Pro',
            'price' => 1999.99,
            'sku' => 'MBP-001',
            'stock_quantity' => 25,
            'category_id' => $this->category->id,
            'is_active' => true,
        ]),
    ]);

    $this->customers = Customer::factory()->count(3)->create();
});

describe('POS Interface', function () {
    it('loads POS interface correctly', function () {
        Auth::login($this->user);

        $page = visit('/pos');

        $page->assertSee('Point of Sale')
            ->assertSee('Products')
            ->assertSee('Cart')
            ->assertSee('Search products...')
            ->assertPresent('[data-testid="product-grid"]')
            ->assertPresent('[data-testid="cart-section"]')
            ->assertPresent('[data-testid="checkout-section"]')
            ->assertNoJavascriptErrors();
    });

    it('displays products in grid layout', function () {
        Auth::login($this->user);

        $page = visit('/pos');

        $page->assertSee('iPhone 15')
            ->assertSee('AirPods Pro')
            ->assertSee('MacBook Pro')
            ->assertSee('$999.99')
            ->assertSee('$249.99')
            ->assertSee('$1,999.99')
            ->assertNoJavascriptErrors();
    });

    it('can search for products', function () {
        Auth::login($this->user);

        $page = visit('/pos');

        $page->fill('[data-testid="product-search"]', 'iPhone')
            ->waitForText('iPhone 15')
            ->assertSee('iPhone 15')
            ->assertDontSee('AirPods Pro')
            ->assertDontSee('MacBook Pro')
            ->assertNoJavascriptErrors();

        // Clear search
        $page->fill('[data-testid="product-search"]', '')
            ->waitForText('AirPods Pro')
            ->assertSee('iPhone 15')
            ->assertSee('AirPods Pro')
            ->assertSee('MacBook Pro')
            ->assertNoJavascriptErrors();
    });

    it('can filter products by category', function () {
        // Create products in different category
        $otherCategory = Category::factory()->create(['name' => 'Accessories']);
        Product::factory()->create([
            'name' => 'Phone Case',
            'price' => 29.99,
            'category_id' => $otherCategory->id,
            'is_active' => true,
        ]);

        Auth::login($this->user);

        $page = visit('/pos');

        // Filter by Electronics category
        $page->click('[data-testid="category-filter-'.$this->category->id.'"]')
            ->waitForText('iPhone 15')
            ->assertSee('iPhone 15')
            ->assertSee('AirPods Pro')
            ->assertDontSee('Phone Case')
            ->assertNoJavascriptErrors();

        // Filter by Accessories category
        $page->click('[data-testid="category-filter-'.$otherCategory->id.'"]')
            ->waitForText('Phone Case')
            ->assertSee('Phone Case')
            ->assertDontSee('iPhone 15')
            ->assertNoJavascriptErrors();
    });
});

describe('Cart Management', function () {
    it('can add products to cart', function () {
        Auth::login($this->user);

        $page = visit('/pos');

        // Add iPhone to cart
        $page->click('[data-testid="add-to-cart-'.$this->products[0]->id.'"]')
            ->waitForText('iPhone 15')
            ->assertSeeIn('[data-testid="cart-section"]', 'iPhone 15')
            ->assertSeeIn('[data-testid="cart-section"]', '$999.99')
            ->assertSeeIn('[data-testid="cart-total"]', '$999.99')
            ->assertNoJavascriptErrors();
    });

    it('can adjust item quantities in cart', function () {
        Auth::login($this->user);

        $page = visit('/pos');

        // Add iPhone to cart
        $page->click('[data-testid="add-to-cart-'.$this->products[0]->id.'"]')
            ->waitForText('iPhone 15');

        // Increase quantity
        $page->click('[data-testid="increase-qty-'.$this->products[0]->id.'"]')
            ->waitForText('2')
            ->assertSeeIn('[data-testid="item-qty-'.$this->products[0]->id.'"]', '2')
            ->assertSeeIn('[data-testid="cart-total"]', '$1,999.98')
            ->assertNoJavascriptErrors();

        // Decrease quantity
        $page->click('[data-testid="decrease-qty-'.$this->products[0]->id.'"]')
            ->waitForText('1')
            ->assertSeeIn('[data-testid="item-qty-'.$this->products[0]->id.'"]', '1')
            ->assertSeeIn('[data-testid="cart-total"]', '$999.99')
            ->assertNoJavascriptErrors();
    });

    it('can remove items from cart', function () {
        Auth::login($this->user);

        $page = visit('/pos');

        // Add multiple items to cart
        $page->click('[data-testid="add-to-cart-'.$this->products[0]->id.'"]')
            ->click('[data-testid="add-to-cart-'.$this->products[1]->id.'"]')
            ->waitForText('AirPods Pro');

        // Remove iPhone from cart
        $page->click('[data-testid="remove-item-'.$this->products[0]->id.'"]')
            ->waitUntilMissingText('iPhone 15')
            ->assertDontSeeIn('[data-testid="cart-section"]', 'iPhone 15')
            ->assertSeeIn('[data-testid="cart-section"]', 'AirPods Pro')
            ->assertSeeIn('[data-testid="cart-total"]', '$249.99')
            ->assertNoJavascriptErrors();
    });

    it('can clear entire cart', function () {
        Auth::login($this->user);

        $page = visit('/pos');

        // Add multiple items to cart
        $page->click('[data-testid="add-to-cart-'.$this->products[0]->id.'"]')
            ->click('[data-testid="add-to-cart-'.$this->products[1]->id.'"]')
            ->waitForText('AirPods Pro');

        // Clear cart
        $page->click('[data-testid="clear-cart"]')
            ->waitForText('Are you sure?')
            ->click('Clear Cart')
            ->waitForText('Cart is empty')
            ->assertSee('Cart is empty')
            ->assertSeeIn('[data-testid="cart-total"]', '$0.00')
            ->assertNoJavascriptErrors();
    });

    it('persists cart data between page refreshes', function () {
        Auth::login($this->user);

        $page = visit('/pos');

        // Add items to cart
        $page->click('[data-testid="add-to-cart-'.$this->products[0]->id.'"]')
            ->waitForText('iPhone 15');

        // Refresh page
        $page->refresh()
            ->waitForText('iPhone 15')
            ->assertSeeIn('[data-testid="cart-section"]', 'iPhone 15')
            ->assertSeeIn('[data-testid="cart-total"]', '$999.99')
            ->assertNoJavascriptErrors();
    });
});

describe('Checkout Process', function () {
    it('can complete checkout with existing customer', function () {
        Auth::login($this->user);

        $page = visit('/pos');

        // Add items to cart
        $page->click('[data-testid="add-to-cart-'.$this->products[0]->id.'"]')
            ->click('[data-testid="add-to-cart-'.$this->products[1]->id.'"]')
            ->waitForText('AirPods Pro');

        // Start checkout
        $page->click('[data-testid="checkout-button"]')
            ->waitForText('Customer Information')
            ->assertSee('Customer Information')
            ->assertNoJavascriptErrors();

        // Select existing customer
        $page->select('[data-testid="customer-select"]', $this->customers[0]->id)
            ->select('[data-testid="payment-method"]', 'cash')
            ->click('Complete Order')
            ->waitForText('Order completed successfully')
            ->assertSee('Order completed successfully')
            ->assertSee('Order #')
            ->assertNoJavascriptErrors();

        // Verify order was created in database
        expect(Order::count())->toBe(1);
        expect(Order::first()->customer_id)->toBe($this->customers[0]->id);
        expect(Order::first()->total_amount)->toBe(1249.98); // iPhone + AirPods
    });

    it('can create new customer during checkout', function () {
        Auth::login($this->user);

        $page = visit('/pos');

        // Add item to cart
        $page->click('[data-testid="add-to-cart-'.$this->products[0]->id.'"]')
            ->waitForText('iPhone 15');

        // Start checkout
        $page->click('[data-testid="checkout-button"]')
            ->waitForText('Customer Information');

        // Choose to create new customer
        $page->click('[data-testid="new-customer-tab"]')
            ->fill('customer_name', 'John Doe')
            ->fill('customer_email', 'john@example.com')
            ->fill('customer_phone', '+1234567890')
            ->select('[data-testid="payment-method"]', 'credit_card')
            ->click('Complete Order')
            ->waitForText('Order completed successfully')
            ->assertSee('Order completed successfully')
            ->assertNoJavascriptErrors();

        // Verify customer and order were created
        expect(Customer::where('email', 'john@example.com')->exists())->toBeTrue();
        expect(Order::count())->toBe(1);
    });

    it('validates checkout form', function () {
        Auth::login($this->user);

        $page = visit('/pos');

        // Add item to cart
        $page->click('[data-testid="add-to-cart-'.$this->products[0]->id.'"]')
            ->waitForText('iPhone 15');

        // Try to checkout without selecting customer or payment method
        $page->click('[data-testid="checkout-button"]')
            ->waitForText('Customer Information')
            ->click('Complete Order')
            ->waitForText('Please select a customer')
            ->assertSee('Please select a customer')
            ->assertSee('Please select a payment method')
            ->assertNoJavascriptErrors();
    });

    it('handles insufficient stock', function () {
        // Create a product with low stock
        $lowStockProduct = Product::factory()->create([
            'name' => 'Limited Item',
            'price' => 99.99,
            'stock_quantity' => 1,
            'category_id' => $this->category->id,
            'is_active' => true,
        ]);

        Auth::login($this->user);

        $page = visit('/pos');

        // Try to add more than available stock
        $page->click('[data-testid="add-to-cart-'.$lowStockProduct->id.'"]')
            ->waitForText('Limited Item')
            ->click('[data-testid="increase-qty-'.$lowStockProduct->id.'"]')
            ->waitForText('Insufficient stock')
            ->assertSee('Insufficient stock')
            ->assertNoJavascriptErrors();
    });

    it('calculates tax and discounts correctly', function () {
        Auth::login($this->user);

        $page = visit('/pos');

        // Add items to cart
        $page->click('[data-testid="add-to-cart-'.$this->products[0]->id.'"]')
            ->waitForText('iPhone 15');

        // Check subtotal, tax, and total calculations
        $page->assertSeeIn('[data-testid="cart-subtotal"]', '$999.99')
            ->assertPresent('[data-testid="cart-tax"]')
            ->assertPresent('[data-testid="cart-total"]')
            ->assertNoJavascriptErrors();
    });
});

describe('POS Responsiveness', function () {
    it('works correctly on mobile devices', function () {
        Auth::login($this->user);

        $page = visit('/pos')
            ->resize(375, 667); // iPhone size

        $page->assertSee('Point of Sale')
            ->assertPresent('[data-testid="product-grid"]')
            ->assertPresent('[data-testid="cart-section"]')
            ->assertNoJavascriptErrors();

        // Test adding items on mobile
        $page->click('[data-testid="add-to-cart-'.$this->products[0]->id.'"]')
            ->waitForText('iPhone 15')
            ->assertSeeIn('[data-testid="cart-section"]', 'iPhone 15')
            ->assertNoJavascriptErrors();
    });

    it('works correctly on tablet devices', function () {
        Auth::login($this->user);

        $page = visit('/pos')
            ->resize(768, 1024); // iPad size

        $page->assertSee('Point of Sale')
            ->assertPresent('[data-testid="product-grid"]')
            ->assertPresent('[data-testid="cart-section"]')
            ->assertNoJavascriptErrors();
    });
});

describe('POS Performance', function () {
    it('handles large product catalogs efficiently', function () {
        // Create many products
        Product::factory()->count(100)->create([
            'category_id' => $this->category->id,
            'is_active' => true,
        ]);

        Auth::login($this->user);

        $page = visit('/pos');

        $page->assertSee('Point of Sale')
            ->assertNoJavascriptErrors();

        // Test search performance
        $page->fill('[data-testid="product-search"]', 'iPhone')
            ->waitForText('iPhone 15')
            ->assertNoJavascriptErrors();
    });
});
