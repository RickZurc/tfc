<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('password'),
    ]);
});

describe('Authentication Flow', function () {
    it('can visit the login page', function () {
        $page = visit('/login');

        $page->assertSee('Log in to your account')
            ->assertSee('Email address')
            ->assertSee('Password')
            ->assertSee('Log in')
            ->assertSee('Sign up')
            ->assertNoJavascriptErrors();
    });

    it('can log in with valid credentials', function () {
        $page = visit('/login');

        $page->fill('email', 'test@example.com')
            ->fill('password', 'password')
            ->click('Log in')
            ->assertPathIs('/dashboard')
            ->assertSee('Dashboard')
            ->assertNoJavascriptErrors();
    });

    it('shows error with invalid credentials', function () {
        $page = visit('/login');

        $page->fill('email', 'wrong@example.com')
            ->fill('password', 'wrongpassword')
            ->click('Log in')
            ->waitForText('These credentials do not match our records')
            ->assertSee('These credentials do not match our records')
            ->assertNoJavascriptErrors();
    });

    it('can register a new user', function () {
        $page = visit('/register');

        $page->assertSee('Create an account')
            ->fill('name', 'John Doe')
            ->fill('email', 'john@example.com')
            ->fill('password', 'password123')
            ->fill('password_confirmation', 'password123')
            ->click('Create account')
            ->assertPathIs('/dashboard')
            ->assertSee('Dashboard')
            ->assertNoJavascriptErrors();

        // Verify user was created in database
        expect(User::where('email', 'john@example.com')->exists())->toBeTrue();
    });

    it('redirects to login when accessing protected pages', function () {
        $page = visit('/dashboard');

        $page->assertPathIs('/login')
            ->assertPathIs('/login')
            ->assertSee('Log in to your account')
            ->assertNoJavascriptErrors();
    });

    it('can log out successfully', function () {
        Auth::login($this->user);

        $page = visit('/dashboard');

        $page->click('[data-testid="user-menu"]')
            ->waitForText('Sign out')
            ->click('Sign out')
            ->assertPathIs('/')
            ->assertPathIs('/')
            ->assertNoJavascriptErrors();
    });
});

describe('Password Reset Flow', function () {
    it('can request password reset', function () {
        $page = visit('/forgot-password');

        $page->assertSee('Forgot your password?')
            ->fill('email', 'test@example.com')
            ->click('Email Password Reset Link')
            ->waitForText('We have emailed your password reset link')
            ->assertSee('We have emailed your password reset link')
            ->assertNoJavascriptErrors();
    });

    it('shows error for non-existent email', function () {
        $page = visit('/forgot-password');

        $page->fill('email', 'nonexistent@example.com')
            ->click('Email Password Reset Link')
            ->waitForText('We can\'t find a user with that email address')
            ->assertSee('We can\'t find a user with that email address')
            ->assertNoJavascriptErrors();
    });
});

describe('Mobile Authentication', function () {
    it('works correctly on mobile devices', function () {
        $page = visit('/login')
            ->resize(375, 667); // iPhone size

        $page->assertSee('Log in to your account')
            ->assertPresent('[type="email"]')
            ->assertPresent('[type="password"]')
            ->assertNoJavascriptErrors();
    });
});
