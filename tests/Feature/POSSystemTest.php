<?php

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('pos index page loads successfully', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->create(['category_id' => $category->id]);

    $response = $this->actingAs($this->user)
        ->get('/pos');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->component('POS/Index')
            ->has('categories')
            ->has('products')
    );
});

test('product search returns filtered results', function () {
    $category = Category::factory()->create();
    $product1 = Product::factory()->create([
        'name' => 'Wireless Earbuds',
        'category_id' => $category->id
    ]);
    $product2 = Product::factory()->create([
        'name' => 'Gaming Mouse',
        'category_id' => $category->id
    ]);

    $response = $this->actingAs($this->user)
        ->get('/pos/products/search?search=wireless');

    $response->assertStatus(200);
    $response->assertJsonCount(1, 'products');
    $response->assertJsonFragment(['name' => 'Wireless Earbuds']);
});

test('can create order through pos', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'price' => 99.99,
        'stock_quantity' => 10
    ]);

    $orderData = [
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 2,
                'unit_price' => 99.99
            ]
        ],
        'customer_name' => 'John Doe',
        'payment_method' => 'cash',
        'subtotal' => 199.98,
        'tax_amount' => 17.00,
        'total_amount' => 216.98
    ];

    $response = $this->actingAs($this->user)
        ->postJson('/pos/orders', $orderData);

    $response->assertStatus(201);
    
    expect('orders')->toHaveRecord([
        'customer_name' => 'John Doe',
        'payment_method' => 'cash',
        'total_amount' => 216.98,
        'status' => 'completed'
    ]);

    expect('order_items')->toHaveRecord([
        'product_id' => $product->id,
        'quantity' => 2,
        'unit_price' => 99.99
    ]);

    // Check that stock was decremented
    $product->refresh();
    expect($product->stock_quantity)->toBe(8);
});

test('cannot create order with insufficient stock', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'price' => 99.99,
        'stock_quantity' => 1
    ]);

    $orderData = [
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 5, // More than available stock
                'unit_price' => 99.99
            ]
        ],
        'customer_name' => 'John Doe',
        'payment_method' => 'cash',
        'subtotal' => 499.95,
        'tax_amount' => 42.50,
        'total_amount' => 542.45
    ];

    $response = $this->actingAs($this->user)
        ->postJson('/pos/orders', $orderData);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['items.0.quantity']);
});

test('dashboard displays sales statistics', function () {
    // Create sample orders for statistics
    $category = Category::factory()->create();
    $product = Product::factory()->create(['category_id' => $category->id]);
    
    Order::factory()->create([
        'total_amount' => 100.00,
        'status' => 'completed',
        'completed_at' => today()
    ]);

    $response = $this->actingAs($this->user)
        ->get('/dashboard');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->component('dashboard')
            ->has('statistics')
            ->has('salesByCategory')
            ->has('dailySales')
            ->has('topProducts')
            ->has('lowStockProducts')
    );
});