<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Product Management', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    });

    it('can create a product with valid data', function () {
        $category = Category::factory()->create();

        $productData = [
            'name' => 'Test Product',
            'description' => 'A great test product',
            'category_id' => $category->id,
            'price' => 99.99,
            'cost_price' => 50.00,
            'sku' => 'TEST001',
            'track_stock' => true,
            'stock_quantity' => 100,
            'min_stock_level' => 10,
            'unit' => 'piece',
            'tax_rate' => 0.00,
            'is_active' => true,
        ];

        $response = $this->post(route('products.store'), $productData);

        $response->assertRedirect(route('products.index'));

        expect('products')->toHaveRecord([
            'name' => 'Test Product',
            'slug' => 'test-product',
            'sku' => 'TEST001',
        ]);

        expect(Product::latest()->first())
            ->name->toBe('Test Product')
            ->slug->toBe('test-product')
            ->category_id->toBe($category->id);
    });

    it('validates required fields', function (string $field) {
        $category = Category::factory()->create();

        $productData = [
            'name' => 'Test Product',
            'category_id' => $category->id,
            'price' => 99.99,
            'sku' => 'TEST001',
        ];

        unset($productData[$field]);

        $response = $this->post(route('products.store'), $productData);

        $response->assertSessionHasErrors($field);
    })->with(['name', 'category_id', 'price']); // Removed 'sku' since it's now optional

    it('can update a product', function () {
        $category = Category::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->id]);

        $updateData = [
            'name' => 'Updated Product Name',
            'description' => $product->description,
            'category_id' => $category->id,
            'price' => 149.99,
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

        expect($product->fresh())
            ->name->toBe('Updated Product Name')
            ->slug->toBe('updated-product-name')
            ->price->toBe('149.99');
    });

    it('auto-generates SKU when not provided', function () {
        $category = Category::factory()->create();

        $productData = [
            'name' => 'Test Product',
            'description' => 'A great test product',
            'category_id' => $category->id,
            'price' => 99.99,
            'cost_price' => 50.00,
            'unit' => 'piece',
            // No SKU provided - should be auto-generated
            'track_stock' => false,
            'tax_rate' => 0.00,
            'is_active' => true,
        ];

        $response = $this->post(route('products.store'), $productData);

        $response->assertRedirect(route('products.index'));

        $product = Product::latest()->first();
        expect($product)
            ->name->toBe('Test Product')
            ->slug->toBe('test-product')
            ->sku->not->toBeEmpty()
            ->sku->toMatch('/^[A-Z0-9]+$/'); // Should be alphanumeric uppercase
    });

    it('auto-generates SKU with fallback for special characters', function () {
        $category = Category::factory()->create();

        $productData = [
            'name' => '!@#$%^&*()', // Special characters only
            'category_id' => $category->id,
            'price' => 99.99,
            'unit' => 'piece',
            'track_stock' => false,
            'is_active' => true,
        ];

        $response = $this->post(route('products.store'), $productData);

        $response->assertRedirect(route('products.index'));

        $product = Product::latest()->first();
        expect($product->sku)
            ->toStartWith('PROD')
            ->toMatch('/^PROD\d{3}$/'); // Should be PROD + 3 digits
    });

    it('can delete a product without orders', function () {
        $product = Product::factory()->create();

        $response = $this->delete(route('products.destroy', $product));

        $response->assertRedirect(route('products.index'));

        expect(Product::find($product->id))
            ->toBeNull();
    });

    it('calculates profit margin correctly', function (float $price, float $costPrice, float $expected) {
        $product = Product::factory()->create([
            'price' => $price,
            'cost_price' => $costPrice,
        ]);

        expect($product->calculateProfitMargin())->toBe($expected);
    })->with([
        [100.00, 50.00, 100.0],   // 100% margin
        [150.00, 100.00, 50.0],  // 50% margin
        [120.00, 100.00, 20.0],  // 20% margin
        [100.00, 0.00, 0.0],     // No cost price
    ]);

    it('identifies low stock products correctly', function () {
        $lowStockProduct = Product::factory()->create([
            'track_stock' => true,
            'stock_quantity' => 5,
            'min_stock_level' => 10,
        ]);

        $normalStockProduct = Product::factory()->create([
            'track_stock' => true,
            'stock_quantity' => 20,
            'min_stock_level' => 10,
        ]);

        expect($lowStockProduct->isLowStock())->toBeTrue()
            ->and($normalStockProduct->isLowStock())->toBeFalse();
    });

    it('identifies out of stock products correctly', function () {
        $outOfStockProduct = Product::factory()->create([
            'track_stock' => true,
            'stock_quantity' => 0,
        ]);

        $inStockProduct = Product::factory()->create([
            'track_stock' => true,
            'stock_quantity' => 5,
        ]);

        expect($outOfStockProduct->isOutOfStock())->toBeTrue()
            ->and($inStockProduct->isOutOfStock())->toBeFalse();
    });

    it('can create a product with percentage discount', function () {
        $category = Category::factory()->create();

        $productData = [
            'name' => 'Discounted Product',
            'category_id' => $category->id,
            'price' => 100.00,
            'sku' => 'DISC001',
            'unit' => 'piece',
            'track_stock' => false,
            'is_active' => true,
            'discount_active' => true,
            'discount_type' => 'percentage',
            'discount_percentage' => 20.00,
            'discount_starts_at' => now()->format('Y-m-d H:i:s'),
            'discount_ends_at' => now()->addDays(7)->format('Y-m-d H:i:s'),
        ];

        $response = $this->post(route('products.store'), $productData);

        $response->assertRedirect(route('products.index'));

        $product = Product::latest()->first();
        expect($product)
            ->discount_active->toBeTrue()
            ->discount_type->toBe('percentage')
            ->discount_percentage->toBe(20.0);
    });

    it('can create a product with fixed amount discount', function () {
        $category = Category::factory()->create();

        $productData = [
            'name' => 'Fixed Discount Product',
            'category_id' => $category->id,
            'price' => 100.00,
            'sku' => 'DISC002',
            'unit' => 'piece',
            'track_stock' => false,
            'is_active' => true,
            'discount_active' => true,
            'discount_type' => 'fixed',
            'discount_amount' => 15.00,
            'discount_starts_at' => now()->format('Y-m-d H:i:s'),
            'discount_ends_at' => now()->addDays(7)->format('Y-m-d H:i:s'),
        ];

        $response = $this->post(route('products.store'), $productData);

        $response->assertRedirect(route('products.index'));

        $product = Product::latest()->first();
        expect($product)
            ->discount_active->toBeTrue()
            ->discount_type->toBe('fixed')
            ->discount_amount->toBe(15.0);
    });

    it('can update product discount settings', function () {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'discount_active' => false,
        ]);

        $updateData = [
            'name' => $product->name,
            'category_id' => $category->id,
            'price' => $product->price,
            'sku' => $product->sku,
            'unit' => $product->unit,
            'track_stock' => $product->track_stock,
            'stock_quantity' => $product->stock_quantity,
            'min_stock_level' => $product->min_stock_level,
            'is_active' => $product->is_active,
            'discount_active' => true,
            'discount_type' => 'percentage',
            'discount_percentage' => 25.00,
            'discount_starts_at' => now()->format('Y-m-d H:i:s'),
            'discount_ends_at' => now()->addDays(14)->format('Y-m-d H:i:s'),
        ];

        $response = $this->put(route('products.update', $product), $updateData);

        $response->assertRedirect(route('products.index'));

        expect($product->fresh())
            ->discount_active->toBeTrue()
            ->discount_type->toBe('percentage')
            ->discount_percentage->toBe(25.0);
    });

    it('validates discount percentage is required when discount is active with percentage type', function () {
        $category = Category::factory()->create();

        $productData = [
            'name' => 'Test Product',
            'category_id' => $category->id,
            'price' => 100.00,
            'sku' => 'TEST001',
            'unit' => 'piece',
            'track_stock' => false,
            'is_active' => true,
            'discount_active' => true,
            'discount_type' => 'percentage',
            // Missing discount_percentage
            'discount_starts_at' => now()->format('Y-m-d H:i:s'),
            'discount_ends_at' => now()->addDays(7)->format('Y-m-d H:i:s'),
        ];

        $response = $this->post(route('products.store'), $productData);

        $response->assertSessionHasErrors('discount_percentage');
    });

    it('validates discount amount is required when discount is active with fixed type', function () {
        $category = Category::factory()->create();

        $productData = [
            'name' => 'Test Product',
            'category_id' => $category->id,
            'price' => 100.00,
            'sku' => 'TEST002',
            'unit' => 'piece',
            'track_stock' => false,
            'is_active' => true,
            'discount_active' => true,
            'discount_type' => 'fixed',
            // Missing discount_amount
            'discount_starts_at' => now()->format('Y-m-d H:i:s'),
            'discount_ends_at' => now()->addDays(7)->format('Y-m-d H:i:s'),
        ];

        $response = $this->post(route('products.store'), $productData);

        $response->assertSessionHasErrors('discount_amount');
    });

    it('includes discount information in product serialization', function () {
        $category = Category::factory()->create();

        $product = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 100.00,
            'discount_active' => true,
            'discount_type' => 'percentage',
            'discount_percentage' => 20.00,
            'discount_starts_at' => now()->subDay(),
            'discount_ends_at' => now()->addDays(7),
        ]);

        $productArray = $product->toArray();

        expect($productArray)
            ->toHaveKey('has_active_discount')
            ->toHaveKey('current_price');

        expect($productArray['has_active_discount'])->toBeTrue();
        expect($productArray['current_price'])->toBe(80.0); // 100 - 20% = 80
    });

    it('calculates current price correctly for percentage discount', function () {
        $product = Product::factory()->create([
            'price' => 100.00,
            'discount_active' => true,
            'discount_type' => 'percentage',
            'discount_percentage' => 25.00,
            'discount_starts_at' => now()->subDay(),
            'discount_ends_at' => now()->addWeek(),
        ]);

        expect($product->hasActiveDiscount())->toBeTrue();
        expect($product->getCurrentPrice())->toBe(75.0);
    });

    it('calculates current price correctly for fixed amount discount', function () {
        $product = Product::factory()->create([
            'price' => 100.00,
            'discount_active' => true,
            'discount_type' => 'fixed',
            'discount_amount' => 15.00,
            'discount_starts_at' => now()->subDay(),
            'discount_ends_at' => now()->addWeek(),
        ]);

        expect($product->hasActiveDiscount())->toBeTrue();
        expect($product->getCurrentPrice())->toBe(85.0);
    });

    it('returns regular price when discount is not active', function () {
        $product = Product::factory()->create([
            'price' => 100.00,
            'discount_active' => false,
        ]);

        expect($product->hasActiveDiscount())->toBeFalse();
        expect($product->getCurrentPrice())->toBe(100.0);
    });

    it('returns regular price when discount has not started yet', function () {
        $product = Product::factory()->create([
            'price' => 100.00,
            'discount_active' => true,
            'discount_type' => 'percentage',
            'discount_percentage' => 20.00,
            'discount_starts_at' => now()->addDay(),
            'discount_ends_at' => now()->addWeek(),
        ]);

        expect($product->hasActiveDiscount())->toBeFalse();
        expect($product->getCurrentPrice())->toBe(100.0);
    });

    it('returns regular price when discount has ended', function () {
        $product = Product::factory()->create([
            'price' => 100.00,
            'discount_active' => true,
            'discount_type' => 'percentage',
            'discount_percentage' => 20.00,
            'discount_starts_at' => now()->subWeek(),
            'discount_ends_at' => now()->subDay(),
        ]);

        expect($product->hasActiveDiscount())->toBeFalse();
        expect($product->getCurrentPrice())->toBe(100.0);
    });

    it('displays product view page with discount information', function () {
        $product = Product::factory()->create([
            'price' => 100.00,
            'discount_active' => true,
            'discount_type' => 'percentage',
            'discount_percentage' => 20.00,
            'discount_starts_at' => now()->subDay(),
            'discount_ends_at' => now()->addWeek(),
        ]);

        $response = $this->get(route('products.show', $product));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Products/Show')
            ->has('product', fn ($product) => $product
                ->where('discount_active', true)
                ->where('discount_type', 'percentage')
                ->where('discount_percentage', 20)
                ->where('has_active_discount', true)
                ->where('current_price', 80)
                ->etc()
            )
        );
    });

    it('displays product view page without discount when not active', function () {
        $product = Product::factory()->create([
            'price' => 100.00,
            'discount_active' => false,
        ]);

        $response = $this->get(route('products.show', $product));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Products/Show')
            ->has('product', fn ($product) => $product
                ->where('discount_active', false)
                ->where('has_active_discount', false)
                ->where('current_price', 100)
                ->etc()
            )
        );
    });

    it('displays product view page with fixed amount discount', function () {
        $product = Product::factory()->create([
            'price' => 100.00,
            'discount_active' => true,
            'discount_type' => 'fixed',
            'discount_amount' => 15.00,
            'discount_starts_at' => now()->subDay(),
            'discount_ends_at' => now()->addWeek(),
        ]);

        $response = $this->get(route('products.show', $product));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('Products/Show')
            ->has('product', fn ($product) => $product
                ->where('discount_active', true)
                ->where('discount_type', 'fixed')
                ->where('discount_amount', 15)
                ->where('has_active_discount', true)
                ->where('current_price', 85)
                ->etc()
            )
        );
    });
});
