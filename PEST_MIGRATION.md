# Pest 4 Migration Guide

This project has been successfully migrated from PHPUnit to Pest 4, providing a more expressive and elegant testing experience.

## What's Changed

### Test Structure
- **Before (PHPUnit)**: Class-based tests with `public function test_*()` methods
- **After (Pest)**: Functional tests using `test()` and `it()` functions

### Key Benefits of Pest 4

1. **More Readable Tests**: Tests are written in a more natural, descriptive way
2. **Powerful Expectations**: Enhanced expectation API with fluent syntax
3. **Better Organization**: `describe()` blocks for grouping related tests
4. **Datasets**: Easy parameterized testing with `with()` method
5. **Parallel Execution**: Built-in parallel test execution support
6. **Laravel Integration**: Seamless Laravel-specific testing features

## New Features Used

### 1. Functional Test Syntax
```php
// Before (PHPUnit)
public function test_user_can_login()
{
    $user = User::factory()->create();
    $response = $this->post('/login', [...]);
    $this->assertAuthenticated();
}

// After (Pest)
test('user can login', function () {
    $user = User::factory()->create();
    $response = $this->post('/login', [...]);
    $this->assertAuthenticated();
});
```

### 2. Enhanced Expectations
```php
// Before (PHPUnit)
$this->assertDatabaseHas('products', ['name' => 'Test Product']);
$this->assertEquals('test-product', $product->slug);

// After (Pest)
expect('products')->toHaveRecord(['name' => 'Test Product']);
expect($product->slug)->toBe('test-product');
```

### 3. Describe Blocks for Organization
```php
describe('Product Management', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    });

    it('can create a product', function () {
        // Test implementation
    });

    it('can update a product', function () {
        // Test implementation
    });
});
```

### 4. Parameterized Tests with Datasets
```php
it('validates required fields', function (string $field) {
    // Test implementation that runs for each field
})->with(['name', 'category_id', 'price', 'sku']);

it('calculates profit margin correctly', function (float $price, float $cost, float $expected) {
    // Test implementation
})->with([
    [100.00, 50.00, 100.0],
    [150.00, 100.00, 50.0],
    [120.00, 100.00, 20.0],
]);
```

### 5. Custom Expectations
We've added custom expectations in `tests/Pest.php`:
- `toHaveRecord()`: Check database records
- `toBeModel()`: Check model instances

### 6. Helper Functions
Convenient helper functions for common operations:
- `actingAsUser()`: Quickly authenticate a user
- `createUser()`, `createProduct()`, `createCategory()`: Factory shortcuts

## Configuration Files

### tests/Pest.php
Main configuration file with:
- Test case bindings
- Custom expectations
- Helper functions
- Dataset definitions
- Shared setup/teardown

### pest.xml
PHPUnit configuration optimized for Pest with:
- Test discovery
- Environment variables
- Coverage settings
- Laravel-specific optimizations

## Running Tests

```bash
# Run all tests
./vendor/bin/sail pest

# Run tests in parallel
./vendor/bin/sail pest --parallel

# Run specific test file
./vendor/bin/sail pest tests/Feature/ProductManagementTest.php

# Run tests with coverage
./vendor/bin/sail pest --coverage

# Run tests in watch mode (if using Pest watch plugin)
./vendor/bin/sail pest --watch
```

## Test Categories Migrated

✅ **Unit Tests**: Basic unit tests  
✅ **Feature Tests**: HTTP request/response tests  
✅ **Authentication Tests**: Login, registration, password reset  
✅ **Settings Tests**: Profile and password updates  
✅ **Product Management Tests**: CRUD operations with advanced features  
✅ **POS System Tests**: Point of sale functionality  
✅ **Dashboard Tests**: Statistics and reporting  

## Advanced Features Demonstrated

1. **Fluent Expectations**: Chained expectations for complex assertions
2. **Database Testing**: Custom `toHaveRecord()` expectation
3. **Factory Integration**: Seamless model factory usage
4. **HTTP Testing**: Inertia.js response testing
5. **Authentication Testing**: Built-in auth helpers
6. **Validation Testing**: Form validation assertions
7. **Mutation Testing**: Built-in mutation testing support (use `--mutate` flag)

## Next Steps

- Consider adding more custom expectations for domain-specific assertions
- Explore Pest's mutation testing capabilities for test quality assessment
- Add architectural testing with Pest plugins
- Consider snapshot testing for complex data structures

## Resources

- [Pest Documentation](https://pestphp.com/)
- [Pest Laravel Plugin](https://pestphp.com/docs/plugins/laravel)
- [Pest Expectations](https://pestphp.com/docs/expectations)
- [Pest Datasets](https://pestphp.com/docs/datasets)
