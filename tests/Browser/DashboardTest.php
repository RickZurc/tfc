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

    // Create test data
    $this->categories = Category::factory()->count(3)->create();
    $this->products = Product::factory()->count(5)->create();
    $this->customers = Customer::factory()->count(3)->create();
    $this->orders = Order::factory()->count(2)->create();
});

describe('Dashboard Page', function () {
    it('shows dashboard with statistics cards', function () {
        Auth::login($this->user);

        $page = visit('/dashboard');

        $page->assertSee('Dashboard')
            ->assertSee('Today\'s Sales')
            ->assertSee('Total Products')
            ->assertSee('Total Categories')
            ->assertSee('Active Orders')
            ->assertNoJavascriptErrors();
    });

    it('displays correct statistics', function () {
        Auth::login($this->user);

        $page = visit('/dashboard');

        // Check that stats are displayed (numbers should be present)
        $page->assertSeeIn('[data-testid="products-count"]', '5')
            ->assertSeeIn('[data-testid="categories-count"]', '3')
            ->assertNoJavascriptErrors();
    });

    it('has working navigation links', function () {
        Auth::login($this->user);

        $page = visit('/dashboard');

        // Test navigation to different sections
        $page->click('Categories')
            ->assertPath('/categories')
            ->assertSee('Categories')
            ->assertNoJavascriptErrors();

        $page->click('Products')
            ->assertPath('/products')
            ->assertSee('Products')
            ->assertNoJavascriptErrors();

        $page->click('Orders')
            ->assertPath('/orders')
            ->assertSee('Orders')
            ->assertNoJavascriptErrors();

        $page->click('POS')
            ->assertPath('/pos')
            ->assertSee('Point of Sale')
            ->assertNoJavascriptErrors();
    });

    it('shows recent orders table when orders exist', function () {
        Auth::login($this->user);

        $page = visit('/dashboard');

        $page->assertSee('Recent Orders')
            ->assertSee('Order ID')
            ->assertSee('Customer')
            ->assertSee('Total')
            ->assertSee('Status')
            ->assertNoJavascriptErrors();
    });

    it('handles responsive layout correctly', function () {
        Auth::login($this->user);

        $page = visit('/dashboard')
            ->resize(375, 667); // Mobile size

        $page->assertSee('Dashboard')
            ->assertNoJavascriptErrors();

        $page->resize(1024, 768); // Desktop size

        $page->assertSee('Dashboard')
            ->assertNoJavascriptErrors();
    });
});
