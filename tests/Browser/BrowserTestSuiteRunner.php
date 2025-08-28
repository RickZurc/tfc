<?php

use App\Models\User;

use Illuminate\Support\Facades\Auth;

beforeEach(function () {
    $this->user = User::factory()->create();
});

describe('Browser Test Suite Runner', function () {
    it('runs authentication tests', function () {
        Auth::login($this->user);

        $this->artisan('test', [
            'filter' => 'Browser/AuthenticationTest',
            '--coverage' => false,
        ])->assertExitCode(0);

        expect(true)->toBeTrue();
    });

    it('runs dashboard tests', function () {
        Auth::login($this->user);

        $this->artisan('test', [
            'filter' => 'Browser/DashboardTest',
            '--coverage' => false,
        ])->assertExitCode(0);

        expect(true)->toBeTrue();
    });

    it('runs category management tests', function () {
        Auth::login($this->user);

        $this->artisan('test', [
            'filter' => 'Browser/CategoryManagementTest',
            '--coverage' => false,
        ])->assertExitCode(0);

        expect(true)->toBeTrue();
    });

    it('runs product management tests', function () {
        Auth::login($this->user);

        $this->artisan('test', [
            'filter' => 'Browser/ProductManagementTest',
            '--coverage' => false,
        ])->assertExitCode(0);

        expect(true)->toBeTrue();
    });

    it('runs POS system tests', function () {
        Auth::login($this->user);

        $this->artisan('test', [
            'filter' => 'Browser/POSSystemTest',
            '--coverage' => false,
        ])->assertExitCode(0);

        expect(true)->toBeTrue();
    });

    it('runs order management tests', function () {
        Auth::login($this->user);

        $this->artisan('test', [
            'filter' => 'Browser/OrderManagementTest',
            '--coverage' => false,
        ])->assertExitCode(0);

        expect(true)->toBeTrue();
    });

    it('runs customer management tests', function () {
        Auth::login($this->user);

        $this->artisan('test', [
            'filter' => 'Browser/CustomerManagementTest',
            '--coverage' => false,
        ])->assertExitCode(0);

        expect(true)->toBeTrue();
    });
});

describe('Full Application Browser Test Suite', function () {
    it('runs complete browser test suite', function () {
        Auth::login($this->user);

        $this->artisan('test', [
            'testsuite' => 'Browser',
            '--parallel' => true,
            '--coverage' => false,
        ])->assertExitCode(0);

        expect(true)->toBeTrue();
    });

    it('generates browser test coverage report', function () {
        Auth::login($this->user);

        $this->artisan('test', [
            'testsuite' => 'Browser',
            '--coverage' => true,
            '--coverage-html' => 'coverage-browser',
        ])->assertExitCode(0);

        expect(true)->toBeTrue();
    });
});
