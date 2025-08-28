<?php

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Sales Management', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
    });

    it('can view the sales index page', function () {
        $response = $this->actingAs($this->user)->get('/orders');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Orders/Index')
            ->has('orders')
            ->has('stats')
            ->has('filters')
        );
    });

    it('can view a specific order', function () {
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)->get("/orders/{$order->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Orders/Show')
            ->has('order')
            ->where('order.id', $order->id)
        );
    });

    it('can filter orders by status', function () {
        Order::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'completed',
        ]);

        Order::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)->get('/orders?status=completed');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Orders/Index')
            ->has('orders.data', 1) // Should only have 1 completed order
        );
    });

    it('can search orders by order number', function () {
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'order_number' => 'TEST-123',
        ]);

        Order::factory()->create([
            'user_id' => $this->user->id,
            'order_number' => 'OTHER-456',
        ]);

        $response = $this->actingAs($this->user)->get('/orders?search=TEST');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Orders/Index')
            ->has('orders.data', 1) // Should only find the TEST order
        );
    });

    it('includes proper statistics in the response', function () {
        // Create some completed orders for today
        Order::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'status' => 'completed',
            'total_amount' => 100.00,
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->get('/orders');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Orders/Index')
            ->has('stats')
            ->where('stats.total_orders', 3)
            ->where('stats.today_orders', 3)
            ->where('stats.total_sales', '300.00')
            ->where('stats.today_sales', '300.00')
        );
    });
});
