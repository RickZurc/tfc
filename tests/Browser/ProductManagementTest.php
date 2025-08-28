<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();

    // Create test categories
    $this->categories = Category::factory()->count(3)->create();

    // Create test products
    $this->products = collect([
        Product::factory()->create([
            'name' => 'iPhone 15',
            'description' => 'Latest iPhone model',
            'price' => 999.99,
            'sku' => 'IPH15-001',
            'stock_quantity' => 50,
            'category_id' => $this->categories[0]->id,
            'is_active' => true,
        ]),
        Product::factory()->create([
            'name' => 'Samsung Galaxy S24',
            'description' => 'Latest Samsung flagship',
            'price' => 899.99,
            'sku' => 'SAM24-001',
            'stock_quantity' => 30,
            'category_id' => $this->categories[0]->id,
            'is_active' => true,
        ]),
        Product::factory()->create([
            'name' => 'Inactive Product',
            'description' => 'This product is inactive',
            'price' => 49.99,
            'sku' => 'INACT-001',
            'stock_quantity' => 0,
            'category_id' => $this->categories[1]->id,
            'is_active' => false,
        ]),
    ]);
});

describe('Products Index Page', function () {
    it('displays all products with details', function () {
        Auth::login($this->user);

        $page = visit('/products');

        $page->assertSee('Products')
            ->assertSee('iPhone 15')
            ->assertSee('Samsung Galaxy S24')
            ->assertSee('Inactive Product')
            ->assertSee('$999.99')
            ->assertSee('$899.99')
            ->assertSee('IPH15-001')
            ->assertSee('SAM24-001')
            ->assertNoJavascriptErrors();
    });

    it('can filter products by status', function () {
        Auth::login($this->user);

        $page = visit('/products');

        // Filter by active only
        $page->select('[data-testid="status-filter"]', 'active')
            ->waitForText('iPhone 15')
            ->assertSee('iPhone 15')
            ->assertSee('Samsung Galaxy S24')
            ->assertDontSee('Inactive Product')
            ->assertNoJavascriptErrors();

        // Filter by inactive only
        $page->select('[data-testid="status-filter"]', 'inactive')
            ->waitForText('Inactive Product')
            ->assertSee('Inactive Product')
            ->assertDontSee('iPhone 15')
            ->assertDontSee('Samsung Galaxy S24')
            ->assertNoJavascriptErrors();
    });

    it('can filter products by category', function () {
        Auth::login($this->user);

        $page = visit('/products');

        $page->select('[data-testid="category-filter"]', $this->categories[0]->id)
            ->waitForText('iPhone 15')
            ->assertSee('iPhone 15')
            ->assertSee('Samsung Galaxy S24')
            ->assertDontSee('Inactive Product')
            ->assertNoJavascriptErrors();
    });

    it('can search products by name or SKU', function () {
        Auth::login($this->user);

        $page = visit('/products');

        // Search by name
        $page->fill('[data-testid="search-input"]', 'iPhone')
            ->click('[data-testid="search-button"]')
            ->waitForText('iPhone 15')
            ->assertSee('iPhone 15')
            ->assertDontSee('Samsung Galaxy S24')
            ->assertNoJavascriptErrors();

        // Search by SKU
        $page->fill('[data-testid="search-input"]', 'SAM24')
            ->click('[data-testid="search-button"]')
            ->waitForText('Samsung Galaxy S24')
            ->assertSee('Samsung Galaxy S24')
            ->assertDontSee('iPhone 15')
            ->assertNoJavascriptErrors();
    });

    it('shows low stock warnings', function () {
        // Create a low stock product
        $lowStockProduct = Product::factory()->create([
            'name' => 'Low Stock Item',
            'stock_quantity' => 2,
            'is_active' => true,
        ]);

        Auth::login($this->user);

        $page = visit('/products');

        $page->assertSee('Low Stock Item')
            ->assertSee('Low Stock') // Should show warning indicator
            ->assertNoJavascriptErrors();
    });

    it('can toggle product status', function () {
        Auth::login($this->user);

        $page = visit('/products');

        // Toggle the first active product to inactive
        $page->click('[data-testid="toggle-status-'.$this->products[0]->id.'"]')
            ->waitForText('Product status updated')
            ->assertSee('Product status updated')
            ->assertNoJavascriptErrors();

        // Verify the product is now inactive in database
        expect($this->products[0]->fresh()->is_active)->toBeFalse();
    });

    it('can bulk select and perform actions', function () {
        Auth::login($this->user);

        $page = visit('/products');

        // Select multiple products
        $page->check('[data-testid="select-'.$this->products[0]->id.'"]')
            ->check('[data-testid="select-'.$this->products[1]->id.'"]')
            ->select('[data-testid="bulk-action"]', 'deactivate')
            ->click('[data-testid="apply-bulk-action"]')
            ->waitForText('Bulk action completed')
            ->assertSee('Bulk action completed')
            ->assertNoJavascriptErrors();
    });
});

describe('Product Creation', function () {
    it('can create a new product', function () {
        Auth::login($this->user);

        $page = visit('/products/create');

        $page->assertSee('Create Product')
            ->fill('name', 'New Test Product')
            ->fill('description', 'This is a test product')
            ->fill('price', '199.99')
            ->fill('sku', 'TEST-001')
            ->fill('stock_quantity', '100')
            ->select('[data-testid="category-select"]', $this->categories[0]->id)
            ->check('[data-testid="is-active"]')
            ->click('Create Product')
            ->assertPathIs('/products')
            ->assertSee('Product created successfully')
            ->assertSee('New Test Product')
            ->assertNoJavascriptErrors();

        // Verify in database
        expect(Product::where('name', 'New Test Product')->exists())->toBeTrue();
        expect(Product::where('sku', 'TEST-001')->first()->price)->toBe(199.99);
    });

    it('validates required fields', function () {
        Auth::login($this->user);

        $page = visit('/products/create');

        $page->click('Create Product')
            ->waitForText('The name field is required')
            ->assertSee('The name field is required')
            ->assertSee('The price field is required')
            ->assertSee('The sku field is required')
            ->assertSee('The category field is required')
            ->assertNoJavascriptErrors();
    });

    it('validates unique SKU', function () {
        Auth::login($this->user);

        $page = visit('/products/create');

        $page->fill('name', 'Test Product')
            ->fill('description', 'Test description')
            ->fill('price', '99.99')
            ->fill('sku', 'IPH15-001') // Use existing SKU
            ->fill('stock_quantity', '10')
            ->select('[data-testid="category-select"]', $this->categories[0]->id)
            ->click('Create Product')
            ->waitForText('The sku has already been taken')
            ->assertSee('The sku has already been taken')
            ->assertNoJavascriptErrors();
    });

    it('validates price format', function () {
        Auth::login($this->user);

        $page = visit('/products/create');

        $page->fill('name', 'Test Product')
            ->fill('price', 'invalid-price')
            ->fill('sku', 'TEST-002')
            ->select('[data-testid="category-select"]', $this->categories[0]->id)
            ->click('Create Product')
            ->waitForText('The price must be a number')
            ->assertSee('The price must be a number')
            ->assertNoJavascriptErrors();
    });
});

describe('Product Editing', function () {
    it('can edit existing product', function () {
        Auth::login($this->user);

        $product = $this->products[0];

        $page = visit("/products/{$product->id}/edit");

        $page->assertSee('Edit Product')
            ->assertInputValue('name', 'iPhone 15')
            ->assertInputValue('price', '999.99')
            ->assertInputValue('sku', 'IPH15-001')
            ->assertNoJavascriptErrors();

        // Update the product
        $page->fill('name', 'iPhone 15 Pro')
            ->fill('price', '1099.99')
            ->fill('stock_quantity', '75')
            ->click('Update Product')
            ->assertPathIs('/products')
            ->assertSee('Product updated successfully')
            ->assertSee('iPhone 15 Pro')
            ->assertSee('$1,099.99')
            ->assertNoJavascriptErrors();

        // Verify in database
        expect($product->fresh()->name)->toBe('iPhone 15 Pro');
        expect($product->fresh()->price)->toBe(1099.99);
        expect($product->fresh()->stock_quantity)->toBe(75);
    });

    it('can change product category', function () {
        Auth::login($this->user);

        $product = $this->products[0];

        $page = visit("/products/{$product->id}/edit");

        $page->select('[data-testid="category-select"]', $this->categories[1]->id)
            ->click('Update Product')
            ->assertPathIs('/products')
            ->assertSee('Product updated successfully')
            ->assertNoJavascriptErrors();

        // Verify category changed in database
        expect($product->fresh()->category_id)->toBe($this->categories[1]->id);
    });
});

describe('Product Details', function () {
    it('shows product details page', function () {
        Auth::login($this->user);

        $product = $this->products[0];

        $page = visit("/products/{$product->id}");

        $page->assertSee('Product Details')
            ->assertSee('iPhone 15')
            ->assertSee('Latest iPhone model')
            ->assertSee('$999.99')
            ->assertSee('IPH15-001')
            ->assertSee('Stock: 50')
            ->assertSee($product->category->name)
            ->assertNoJavascriptErrors();
    });

    it('has working action buttons', function () {
        Auth::login($this->user);

        $product = $this->products[0];

        $page = visit("/products/{$product->id}");

        // Test edit button
        $page->click('Edit Product')
            ->assertPath("/products/{$product->id}/edit")
            ->assertSee('Edit Product')
            ->assertNoJavascriptErrors();
    });
});

describe('Product Deletion', function () {
    it('can delete product with confirmation', function () {
        Auth::login($this->user);

        $product = $this->products[2]; // Use inactive product

        $page = visit('/products');

        $page->click('[data-testid="delete-'.$product->id.'"]')
            ->waitForText('Delete Product')
            ->assertSee('Are you sure you want to delete this product?')
            ->click('Delete')
            ->waitForText('Product deleted successfully')
            ->assertSee('Product deleted successfully')
            ->assertDontSee($product->name)
            ->assertNoJavascriptErrors();

        // Verify soft deletion in database
        expect(Product::withTrashed()->find($product->id)->trashed())->toBeTrue();
    });

    it('prevents deletion of products with orders', function () {
        // This would need order items to be created
        // Test would verify that products with existing orders cannot be deleted
        $this->markTestIncomplete('Requires order items relationship');
    });
});
