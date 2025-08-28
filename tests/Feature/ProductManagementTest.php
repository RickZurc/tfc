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
    })->with(['name', 'category_id', 'price', 'sku']);

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
});
