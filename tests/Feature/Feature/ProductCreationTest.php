<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create a user and authenticate for each test
    $user = User::factory()->create();
    $this->actingAs($user);
});

test('product creation generates slug automatically', function () {
    // Create a category
    $category = Category::factory()->create();

    // Product data without slug
    $productData = [
        'name' => 'Test Product Name',
        'description' => 'A test product description',
        'category_id' => $category->id,
        'price' => 29.99,
        'cost_price' => 15.00,
        'sku' => 'TEST-SKU-001',
        'track_stock' => true,
        'stock_quantity' => 100,
        'min_stock_level' => 10,
        'unit' => 'piece',
        'tax_rate' => 0.00,
        'is_active' => true,
    ];

    // Send POST request to create product
    $response = $this->post(route('products.store'), $productData);

    // Assert redirection to products index (successful creation)
    $response->assertRedirect(route('products.index'));
    $response->assertSessionHas('success', 'Product created successfully.');

    // Assert product was created in database
    expect('products')->toHaveRecord([
        'name' => 'Test Product Name',
        'slug' => 'test-product-name',
        'sku' => 'TEST-SKU-001',
        'price' => 29.99,
    ]);

    // Verify the product exists
    $product = Product::where('name', 'Test Product Name')->first();
    expect($product)->not->toBeNull();
    expect($product->slug)->toBe('test-product-name');
});

test('duplicate product names get unique slugs', function () {
    $category = Category::factory()->create();

    // Create first product
    $firstProduct = Product::factory()->create([
        'name' => 'Duplicate Name',
        'slug' => 'duplicate-name',
        'category_id' => $category->id,
    ]);

    // Create second product with same name
    $productData = [
        'name' => 'Duplicate Name',
        'description' => 'Another product with same name',
        'category_id' => $category->id,
        'price' => 19.99,
        'cost_price' => 10.00,
        'sku' => 'DUPLICATE-002',
        'track_stock' => true,
        'stock_quantity' => 50,
        'min_stock_level' => 5,
        'unit' => 'piece',
        'tax_rate' => 0.00,
        'is_active' => true,
    ];

    $response = $this->post(route('products.store'), $productData);

    $response->assertRedirect(route('products.index'));

    // Verify both products exist with unique slugs
    expect('products')->toHaveRecord([
        'name' => 'Duplicate Name',
        'slug' => 'duplicate-name',
        'sku' => $firstProduct->sku,
    ]);

    expect('products')->toHaveRecord([
        'name' => 'Duplicate Name',
        'slug' => 'duplicate-name-1',
        'sku' => 'DUPLICATE-002',
    ]);
});

test('updating product name generates new slug', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'name' => 'Original Name',
        'slug' => 'original-name',
        'category_id' => $category->id,
    ]);

    $updateData = [
        'name' => 'Updated Product Name',
        'description' => $product->description,
        'category_id' => $category->id,
        'price' => $product->price,
        'cost_price' => $product->cost_price,
        'sku' => $product->sku,
        'track_stock' => $product->track_stock,
        'stock_quantity' => $product->stock_quantity,
        'min_stock_level' => $product->min_stock_level,
        'unit' => $product->unit,
        'tax_rate' => $product->tax_rate,
        'is_active' => $product->is_active,
    ];

    $response = $this->put(route('products.update', $product), $updateData);

    $response->assertRedirect(route('products.index'));

    // Verify the product was updated with new slug
    $product->refresh();
    expect($product->name)->toBe('Updated Product Name');
    expect($product->slug)->toBe('updated-product-name');
});
