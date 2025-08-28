<?php

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();

    // Create test categories with icons
    $this->categories = collect([
        Category::factory()->create([
            'name' => 'Electronics',
            'description' => 'Electronic devices and gadgets',
            'color' => '#3B82F6',
            'icon' => 'Smartphone',
            'is_active' => true,
        ]),
        Category::factory()->create([
            'name' => 'Food & Beverages',
            'description' => 'Food and drink items',
            'color' => '#EF4444',
            'icon' => 'Coffee',
            'is_active' => true,
        ]),
        Category::factory()->create([
            'name' => 'Inactive Category',
            'description' => 'This category is inactive',
            'color' => '#6B7280',
            'icon' => 'Archive',
            'is_active' => false,
        ]),
    ]);
});

describe('Categories Index Page', function () {
    it('displays all categories with icons and details', function () {
        Auth::login($this->user);

        $page = visit('/categories');

        $page->assertSee('Categories')
            ->assertSee('Electronics')
            ->assertSee('Food & Beverages')
            ->assertSee('Inactive Category')
            ->assertSee('Electronic devices and gadgets')
            ->assertNoJavascriptErrors();
    });

    it('shows category icons dynamically', function () {
        Auth::login($this->user);

        $page = visit('/categories');

        // Check that dynamic icons are rendered (should see icon containers)
        $page->assertPresent('[data-icon="Smartphone"]')
            ->assertPresent('[data-icon="Coffee"]')
            ->assertPresent('[data-icon="Archive"]')
            ->assertNoJavascriptErrors();
    });

    it('can filter categories by status', function () {
        Auth::login($this->user);

        $page = visit('/categories');

        // Filter by active only
        $page->select('[data-testid="status-filter"]', 'active')
            ->waitForText('Electronics')
            ->assertSee('Electronics')
            ->assertSee('Food & Beverages')
            ->assertDontSee('Inactive Category')
            ->assertNoJavascriptErrors();

        // Filter by inactive only
        $page->select('[data-testid="status-filter"]', 'inactive')
            ->waitForText('Inactive Category')
            ->assertSee('Inactive Category')
            ->assertDontSee('Electronics')
            ->assertDontSee('Food & Beverages')
            ->assertNoJavascriptErrors();
    });

    it('can search categories by name', function () {
        Auth::login($this->user);

        $page = visit('/categories');

        $page->fill('[data-testid="search-input"]', 'Electronics')
            ->click('[data-testid="search-button"]')
            ->waitForText('Electronics')
            ->assertSee('Electronics')
            ->assertDontSee('Food & Beverages')
            ->assertNoJavascriptErrors();
    });

    it('can toggle category status', function () {
        Auth::login($this->user);

        $page = visit('/categories');

        // Toggle the first active category to inactive
        $page->click('[data-testid="toggle-status-'.$this->categories[0]->id.'"]')
            ->waitForText('Status updated successfully')
            ->assertNoJavascriptErrors();

        // Verify the category is now inactive in database
        expect($this->categories[0]->fresh()->is_active)->toBeFalse();
    });

    it('has working action buttons', function () {
        Auth::login($this->user);

        $page = visit('/categories');

        // Test view action
        $page->click('[data-testid="view-'.$this->categories[0]->id.'"]')
            ->assertPath('/categories/'.$this->categories[0]->id)
            ->assertSee('Electronics')
            ->assertNoJavascriptErrors();

        $page->visit('/categories');

        // Test edit action
        $page->click('[data-testid="edit-'.$this->categories[0]->id.'"]')
            ->assertPath('/categories/'.$this->categories[0]->id.'/edit')
            ->assertSee('Edit Category')
            ->assertNoJavascriptErrors();
    });
});

describe('Category Creation', function () {
    it('can create a new category with icon selector', function () {
        Auth::login($this->user);

        $page = visit('/categories/create');

        $page->assertSee('Create Category')
            ->fill('name', 'Test Category')
            ->fill('description', 'This is a test category')
            ->click('[data-testid="color-#22C55E"]') // Select green color
            ->assertNoJavascriptErrors();

        // Test icon selector
        $page->click('[data-testid="icon-selector"]')
            ->waitForText('Search icons')
            ->fill('[placeholder="Search icons..."]', 'heart')
            ->waitForText('Heart')
            ->click('[data-icon="Heart"]')
            ->assertNoJavascriptErrors();

        // Submit form
        $page->click('Create Category')
            ->assertPathIs('/categories')
            ->assertSee('Category created successfully')
            ->assertSee('Test Category')
            ->assertNoJavascriptErrors();

        // Verify in database
        expect(Category::where('name', 'Test Category')->exists())->toBeTrue();
        expect(Category::where('name', 'Test Category')->first()->icon)->toBe('Heart');
    });

    it('validates required fields', function () {
        Auth::login($this->user);

        $page = visit('/categories/create');

        $page->click('Create Category')
            ->waitForText('The name field is required')
            ->assertSee('The name field is required')
            ->assertSee('The color field is required')
            ->assertNoJavascriptErrors();
    });

    it('can search and select icons', function () {
        Auth::login($this->user);

        $page = visit('/categories/create');

        // Open icon selector
        $page->click('[data-testid="icon-selector"]')
            ->waitForText('Search icons')
            ->assertNoJavascriptErrors();

        // Search for coffee icons
        $page->fill('[placeholder="Search icons..."]', 'coffee')
            ->waitForText('Coffee')
            ->assertSee('Coffee')
            ->assertSee('CoffeeBean')
            ->assertNoJavascriptErrors();

        // Select Coffee icon
        $page->click('[data-icon="Coffee"]')
            ->assertSee('Coffee') // Should show selected icon name
            ->assertNoJavascriptErrors();
    });

    it('can clear icon selection', function () {
        Auth::login($this->user);

        $page = visit('/categories/create');

        // Select an icon first
        $page->click('[data-testid="icon-selector"]')
            ->waitForText('Search icons')
            ->click('[data-icon="Heart"]')
            ->assertSee('Heart');

        // Clear the selection
        $page->click('[data-testid="icon-selector"]')
            ->click('[data-testid="clear-icon"]')
            ->assertSee('Choose an icon...')
            ->assertNoJavascriptErrors();
    });
});

describe('Category Editing', function () {
    it('can edit existing category', function () {
        Auth::login($this->user);

        $category = $this->categories[0];

        $page = visit("/categories/{$category->id}/edit");

        $page->assertSee('Edit Category')
            ->assertInputValue('name', 'Electronics')
            ->assertInputValue('description', 'Electronic devices and gadgets')
            ->assertNoJavascriptErrors();

        // Update the category
        $page->fill('name', 'Updated Electronics')
            ->fill('description', 'Updated description')
            ->click('[data-testid="color-#EF4444"]') // Change color to red
            ->click('Update Category')
            ->assertPathIs('/categories')
            ->assertSee('Category updated successfully')
            ->assertSee('Updated Electronics')
            ->assertNoJavascriptErrors();

        // Verify in database
        expect($category->fresh()->name)->toBe('Updated Electronics');
        expect($category->fresh()->color)->toBe('#EF4444');
    });

    it('can change category icon', function () {
        Auth::login($this->user);

        $category = $this->categories[0];

        $page = visit("/categories/{$category->id}/edit");

        // Change icon from Smartphone to Laptop
        $page->click('[data-testid="icon-selector"]')
            ->waitForText('Search icons')
            ->fill('[placeholder="Search icons..."]', 'laptop')
            ->waitForText('Laptop')
            ->click('[data-icon="Laptop"]')
            ->click('Update Category')
            ->assertPathIs('/categories')
            ->assertSee('Category updated successfully')
            ->assertNoJavascriptErrors();

        // Verify icon changed in database
        expect($category->fresh()->icon)->toBe('Laptop');
    });
});

describe('Category Deletion', function () {
    it('can delete category with confirmation', function () {
        Auth::login($this->user);

        $category = $this->categories[2]; // Use inactive category

        $page = visit('/categories');

        $page->click('[data-testid="delete-'.$category->id.'"]')
            ->waitForText('Delete Category')
            ->assertSee('Are you sure you want to delete this category?')
            ->click('Delete')
            ->waitForText('Category deleted successfully')
            ->assertSee('Category deleted successfully')
            ->assertDontSee($category->name)
            ->assertNoJavascriptErrors();

        // Verify soft deletion in database
        expect(Category::withTrashed()->find($category->id)->trashed())->toBeTrue();
    });

    it('can cancel category deletion', function () {
        Auth::login($this->user);

        $category = $this->categories[2];

        $page = visit('/categories');

        $page->click('[data-testid="delete-'.$category->id.'"]')
            ->waitForText('Delete Category')
            ->click('Cancel')
            ->assertSee($category->name) // Should still be visible
            ->assertNoJavascriptErrors();

        // Verify category still exists
        expect(Category::find($category->id))->not->toBeNull();
    });
});
