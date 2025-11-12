<?php

use App\Models\Customer;
use App\Models\Order;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('rejects refund amount exceeding order total', function () {
    $customer = Customer::factory()->create();

    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'user_id' => $this->user->id,
        'status' => 'completed',
        'total_amount' => 100.00,
        'refund_amount' => null,
    ]);

    $response = $this->postJson(route('orders.refund', $order), [
        'refund_amount' => 150.00, // Exceeds total
        'refund_reason' => 'Testing excessive refund',
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('refund_amount');
});

it('accepts refund amount equal to order total', function () {
    $customer = Customer::factory()->create();

    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'user_id' => $this->user->id,
        'status' => 'completed',
        'total_amount' => 100.00,
        'refund_amount' => null,
    ]);

    $response = $this->postJson(route('orders.refund', $order), [
        'refund_amount' => 100.00, // Exactly the total
        'refund_reason' => 'Full refund',
    ]);

    $response->assertRedirect();

    $order->refresh();
    expect($order->refund_amount)->toBe('100.00');
    expect($order->status)->toBe('refunded');
});

it('accepts partial refund less than order total', function () {
    $customer = Customer::factory()->create();

    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'user_id' => $this->user->id,
        'status' => 'completed',
        'total_amount' => 100.00,
        'refund_amount' => null,
    ]);

    $response = $this->postJson(route('orders.refund', $order), [
        'refund_amount' => 50.00, // Half the total
        'refund_reason' => 'Partial refund',
    ]);

    $response->assertRedirect();

    $order->refresh();
    expect($order->refund_amount)->toBe('50.00');
    expect($order->status)->toBe('refunded');
    expect($order->isPartialRefund())->toBeTrue();
});

it('rejects refund for already refunded order', function () {
    $customer = Customer::factory()->create();

    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'user_id' => $this->user->id,
        'status' => 'refunded',
        'total_amount' => 100.00,
        'refund_amount' => 100.00,
        'refunded_at' => now(),
    ]);

    $response = $this->postJson(route('orders.refund', $order), [
        'refund_amount' => 50.00,
        'refund_reason' => 'Double refund attempt',
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('order');
});
