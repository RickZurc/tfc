<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
*/

pest()->extends(TestCase::class)->in('Feature', 'Unit');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

expect()->extend('toHaveRecord', function (array $data) {
    $table = $this->value;
    
    expect(\Illuminate\Support\Facades\DB::table($table)->where($data)->exists())
        ->toBeTrue("Failed asserting that table [{$table}] has record matching: " . json_encode($data));
    
    return $this;
});

expect()->extend('toBeModel', function (string $model) {
    return $this->toBeInstanceOf($model);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function actingAsUser(?string $guard = null): Tests\TestCase
{
    $user = \App\Models\User::factory()->create();
    return test()->actingAs($user, $guard);
}

function createUser(array $attributes = []): \App\Models\User
{
    return \App\Models\User::factory()->create($attributes);
}

function createProduct(array $attributes = []): \App\Models\Product
{
    return \App\Models\Product::factory()->create($attributes);
}

function createCategory(array $attributes = []): \App\Models\Category
{
    return \App\Models\Category::factory()->create($attributes);
}

/*
|--------------------------------------------------------------------------
| Dataset Providers
|--------------------------------------------------------------------------
|
| Dataset providers allow you to run the same test multiple times with different data.
| This is useful for testing edge cases and ensuring your code works with various inputs.
|
*/

dataset('invalid_emails', [
    'invalid-email',
    'test@',
    '@example.com',
    'test.example.com',
    '',
]);

dataset('payment_methods', [
    'cash',
    'card',
    'bank_transfer',
]);

dataset('product_units', [
    'piece',
    'kg',
    'liter',
    'box',
    'pack',
]);

/*
|--------------------------------------------------------------------------
| Shared State
|--------------------------------------------------------------------------
|
| Sometimes you may want to share state between tests. You can use the "beforeEach" and
| "afterEach" functions to set up and tear down state that is shared between tests.
|
*/

// beforeEach(function () {
//     // This runs before each test
// });

// afterEach(function () {
//     // This runs after each test
// });
