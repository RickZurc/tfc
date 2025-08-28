<?php

use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();

    // Create test data
    $this->customers = Customer::factory()->count(3)->create();
    $this->category = Category::factory()->create();
    $this->products = Product::factory()->count(5)->create([
        'category_id' => $this->category->id,
    ]);

    // Create test orders with different statuses
    $this->orders = collect([
        Order::factory()->create([
            'customer_id' => $this->customers[0]->id,
            'total_amount' => 999.99,
            'status' => 'completed',
            'payment_method' => 'credit_card',
            'created_at' => now()->subDays(1),
        ]),
        Order::factory()->create([
            'customer_id' => $this->customers[1]->id,
            'total_amount' => 1599.98,
            'status' => 'pending',
            'payment_method' => 'cash',
            'created_at' => now()->subHours(2),
        ]),
        Order::factory()->create([
            'customer_id' => $this->customers[2]->id,
            'total_amount' => 249.99,
            'status' => 'refunded',
            'payment_method' => 'credit_card',
            'created_at' => now()->subDays(3),
        ]),
    ]);

    // Create order items for each order
    foreach ($this->orders as $order) {
        OrderItem::factory()->count(2)->create([
            'order_id' => $order->id,
            'product_id' => $this->products->random()->id,
        ]);
    }
});

describe('Orders Index Page', function () {
    it('displays all orders with customer and status information', function () {
        Auth::login($this->user);

        $page = visit('/orders');

        $page->assertSee('Orders')
            ->assertSee('Order Management')
            ->assertSee($this->orders[0]->customer->name)
            ->assertSee($this->orders[1]->customer->name)
            ->assertSee($this->orders[2]->customer->name)
            ->assertSee('$999.99')
            ->assertSee('$1,599.98')
            ->assertSee('$249.99')
            ->assertSee('Completed')
            ->assertSee('Pending')
            ->assertSee('Refunded')
            ->assertNoJavascriptErrors();
    });

    it('can filter orders by status', function () {
        Auth::login($this->user);

        $page = visit('/orders');

        // Filter by completed status
        $page->select('[data-testid="status-filter"]', 'completed')
            ->waitForText('$999.99')
            ->assertSee('$999.99')
            ->assertDontSee('$1,599.98')
            ->assertDontSee('$249.99')
            ->assertNoJavascriptErrors();

        // Filter by pending status
        $page->select('[data-testid="status-filter"]', 'pending')
            ->waitForText('$1,599.98')
            ->assertSee('$1,599.98')
            ->assertDontSee('$999.99')
            ->assertDontSee('$249.99')
            ->assertNoJavascriptErrors();

        // Filter by refunded status
        $page->select('[data-testid="status-filter"]', 'refunded')
            ->waitForText('$249.99')
            ->assertSee('$249.99')
            ->assertDontSee('$999.99')
            ->assertDontSee('$1,599.98')
            ->assertNoJavascriptErrors();
    });

    it('can filter orders by date range', function () {
        Auth::login($this->user);

        $page = visit('/orders');

        // Filter to today's orders
        $page->fill('[data-testid="date-from"]', now()->toDateString())
            ->fill('[data-testid="date-to"]', now()->toDateString())
            ->click('[data-testid="apply-date-filter"]')
            ->waitForText('$1,599.98')
            ->assertSee('$1,599.98') // Today's order
            ->assertDontSee('$999.99') // Yesterday's order
            ->assertDontSee('$249.99') // 3 days ago order
            ->assertNoJavascriptErrors();
    });

    it('can search orders by customer name or order ID', function () {
        Auth::login($this->user);

        $page = visit('/orders');

        // Search by customer name
        $customerName = $this->orders[0]->customer->name;
        $page->fill('[data-testid="search-input"]', $customerName)
            ->click('[data-testid="search-button"]')
            ->waitForText($customerName)
            ->assertSee($customerName)
            ->assertSee('$999.99')
            ->assertNoJavascriptErrors();

        // Search by order ID
        $page->fill('[data-testid="search-input"]', '#'.$this->orders[1]->id)
            ->click('[data-testid="search-button"]')
            ->waitForText('$1,599.98')
            ->assertSee('$1,599.98')
            ->assertNoJavascriptErrors();
    });

    it('can filter orders by payment method', function () {
        Auth::login($this->user);

        $page = visit('/orders');

        // Filter by credit card
        $page->select('[data-testid="payment-method-filter"]', 'credit_card')
            ->waitForText('$999.99')
            ->assertSee('$999.99')
            ->assertSee('$249.99')
            ->assertDontSee('$1,599.98')
            ->assertNoJavascriptErrors();

        // Filter by cash
        $page->select('[data-testid="payment-method-filter"]', 'cash')
            ->waitForText('$1,599.98')
            ->assertSee('$1,599.98')
            ->assertDontSee('$999.99')
            ->assertDontSee('$249.99')
            ->assertNoJavascriptErrors();
    });

    it('shows order statistics and totals', function () {
        Auth::login($this->user);

        $page = visit('/orders');

        $page->assertSee('Total Orders')
            ->assertSee('Total Revenue')
            ->assertSee('Pending Orders')
            ->assertSee('Today\'s Sales')
            ->assertPresent('[data-testid="total-orders-count"]')
            ->assertPresent('[data-testid="total-revenue"]')
            ->assertPresent('[data-testid="pending-orders-count"]')
            ->assertNoJavascriptErrors();
    });

    it('can export orders to CSV', function () {
        Auth::login($this->user);

        $page = visit('/orders');

        $page->click('[data-testid="export-orders"]')
            ->waitForDownload()
            ->assertNoJavascriptErrors();
    });
});

describe('Order Details Page', function () {
    it('shows complete order information', function () {
        Auth::login($this->user);

        $order = $this->orders[0];

        $page = visit("/orders/{$order->id}");

        $page->assertSee('Order Details')
            ->assertSee("Order #{$order->id}")
            ->assertSee($order->customer->name)
            ->assertSee($order->customer->email)
            ->assertSee($order->customer->phone)
            ->assertSee('$999.99')
            ->assertSee('Completed')
            ->assertSee('Credit Card')
            ->assertNoJavascriptErrors();
    });

    it('displays order items with product details', function () {
        Auth::login($this->user);

        $order = $this->orders[0];

        $page = visit("/orders/{$order->id}");

        $page->assertSee('Order Items')
            ->assertSee('Product')
            ->assertSee('Quantity')
            ->assertSee('Price')
            ->assertSee('Subtotal')
            ->assertNoJavascriptErrors();

        // Check that order items are displayed
        foreach ($order->orderItems as $item) {
            $page->assertSee($item->product->name)
                ->assertSee($item->quantity)
                ->assertSee('$'.number_format($item->price, 2));
        }
    });

    it('shows order timeline and status history', function () {
        Auth::login($this->user);

        $order = $this->orders[0];

        $page = visit("/orders/{$order->id}");

        $page->assertSee('Order Timeline')
            ->assertSee('Order Created')
            ->assertSee('Payment Processed')
            ->assertSee('Order Completed')
            ->assertNoJavascriptErrors();
    });

    it('can update order status', function () {
        Auth::login($this->user);

        $order = $this->orders[1]; // Pending order

        $page = visit("/orders/{$order->id}");

        $page->select('[data-testid="status-update"]', 'completed')
            ->click('[data-testid="update-status"]')
            ->waitForText('Order status updated')
            ->assertSee('Order status updated')
            ->assertSee('Completed')
            ->assertNoJavascriptErrors();

        // Verify status updated in database
        expect($order->fresh()->status)->toBe('completed');
    });

    it('can add notes to order', function () {
        Auth::login($this->user);

        $order = $this->orders[0];

        $page = visit("/orders/{$order->id}");

        $page->fill('[data-testid="order-notes"]', 'Customer requested expedited shipping')
            ->click('[data-testid="save-notes"]')
            ->waitForText('Notes saved successfully')
            ->assertSee('Notes saved successfully')
            ->assertInputValue('[data-testid="order-notes"]', 'Customer requested expedited shipping')
            ->assertNoJavascriptErrors();
    });

    it('can print order receipt', function () {
        Auth::login($this->user);

        $order = $this->orders[0];

        $page = visit("/orders/{$order->id}");

        $page->click('[data-testid="print-receipt"]')
            ->assertNoJavascriptErrors();

        // Verify print dialog opens (in a real browser this would trigger print)
    });
});

describe('Order Refunds', function () {
    it('can initiate full refund for completed orders', function () {
        Auth::login($this->user);

        $order = $this->orders[0]; // Completed order

        $page = visit("/orders/{$order->id}");

        $page->click('[data-testid="refund-order"]')
            ->waitForText('Refund Order')
            ->assertSee('Refund Order')
            ->assertSee('Full Refund')
            ->assertSee('$999.99')
            ->fill('[data-testid="refund-reason"]', 'Customer return request')
            ->click('Process Refund')
            ->waitForText('Refund processed successfully')
            ->assertSee('Refund processed successfully')
            ->assertSee('Refunded')
            ->assertNoJavascriptErrors();

        // Verify order status updated in database
        expect($order->fresh()->status)->toBe('refunded');
    });

    it('can process partial refunds', function () {
        Auth::login($this->user);

        $order = $this->orders[0];

        $page = visit("/orders/{$order->id}");

        $page->click('[data-testid="refund-order"]')
            ->waitForText('Refund Order')
            ->click('[data-testid="partial-refund-tab"]')
            ->fill('[data-testid="refund-amount"]', '500.00')
            ->fill('[data-testid="refund-reason"]', 'Partial product return')
            ->click('Process Refund')
            ->waitForText('Partial refund processed successfully')
            ->assertSee('Partial refund processed successfully')
            ->assertNoJavascriptErrors();
    });

    it('validates refund amounts', function () {
        Auth::login($this->user);

        $order = $this->orders[0];

        $page = visit("/orders/{$order->id}");

        $page->click('[data-testid="refund-order"]')
            ->waitForText('Refund Order')
            ->click('[data-testid="partial-refund-tab"]')
            ->fill('[data-testid="refund-amount"]', '1500.00') // More than order total
            ->click('Process Refund')
            ->waitForText('Refund amount cannot exceed order total')
            ->assertSee('Refund amount cannot exceed order total')
            ->assertNoJavascriptErrors();
    });

    it('prevents refunds on already refunded orders', function () {
        Auth::login($this->user);

        $order = $this->orders[2]; // Already refunded order

        $page = visit("/orders/{$order->id}");

        $page->assertDontSee('Refund Order')
            ->assertSee('Refunded')
            ->assertNoJavascriptErrors();
    });
});

describe('Order Analytics', function () {
    it('displays order analytics dashboard', function () {
        Auth::login($this->user);

        $page = visit('/orders?view=analytics');

        $page->assertSee('Order Analytics')
            ->assertSee('Sales Overview')
            ->assertSee('Top Products')
            ->assertSee('Customer Analytics')
            ->assertPresent('[data-testid="sales-chart"]')
            ->assertPresent('[data-testid="order-status-chart"]')
            ->assertNoJavascriptErrors();
    });

    it('can filter analytics by date range', function () {
        Auth::login($this->user);

        $page = visit('/orders?view=analytics');

        $page->fill('[data-testid="analytics-date-from"]', now()->subWeek()->toDateString())
            ->fill('[data-testid="analytics-date-to"]', now()->toDateString())
            ->click('[data-testid="apply-analytics-filter"]')
            ->waitForText('Analytics updated')
            ->assertNoJavascriptErrors();
    });
});

describe('Mobile Order Management', function () {
    it('works correctly on mobile devices', function () {
        Auth::login($this->user);

        $page = visit('/orders')
            ->resize(375, 667); // iPhone size

        $page->assertSee('Orders')
            ->assertPresent('[data-testid="orders-table"]')
            ->assertNoJavascriptErrors();

        // Test mobile-specific interactions
        $order = $this->orders[0];
        $page->click('[data-testid="order-'.$order->id.'"]')
            ->assertPathIs("/orders/{$order->id}")
            ->assertSee('Order Details')
            ->assertNoJavascriptErrors();
    });
});
