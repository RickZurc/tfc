<?php

namespace App\Http\Controllers;

use App\Http\Requests\RefundOrderRequest;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of all orders/sales.
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'customer', 'items.product'])
            ->orderBy('created_at', 'desc');

        // Filter by status if provided (but not 'all')
        if ($request->has('status') && $request->status !== '' && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by date range if provided
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search by order number, customer name, or cashier name
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('order_number', 'like', '%'.$searchTerm.'%')
                    ->orWhereHas('customer', function ($customerQuery) use ($searchTerm) {
                        $customerQuery->where('name', 'like', '%'.$searchTerm.'%');
                    })
                    ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                        $userQuery->where('name', 'like', '%'.$searchTerm.'%');
                    });
            });
        }

        $orders = $query->paginate(20)->withQueryString();

        // Get summary statistics
        $stats = [
            'total_sales' => Order::where('status', 'completed')->sum('total_amount'),
            'total_orders' => Order::where('status', 'completed')->count(),
            'today_sales' => Order::where('status', 'completed')
                ->whereDate('completed_at', today())
                ->sum('total_amount'),
            'today_orders' => Order::where('status', 'completed')
                ->whereDate('completed_at', today())
                ->count(),
        ];

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'stats' => $stats,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'search']),
        ]);
    }

    /**
     * Display the specified order with full details.
     */
    public function show(Order $order)
    {
        $order->load(['user', 'customer', 'items.product.category', 'refundedBy']);

        return Inertia::render('Orders/Show', [
            'order' => $order,
        ]);
    }

    /**
     * Process a refund for the specified order.
     */
    public function refund(Order $order, RefundOrderRequest $request)
    {
        try {
            $success = $order->processRefund(
                $request->validated('refund_amount'),
                $request->validated('refund_reason'),
                auth()->id()
            );

            if (! $success) {
                return back()->with('error', 'Unable to process refund. Please check order status and refund amount.');
            }

            return back()->with('success', "Order {$order->order_number} has been successfully refunded.");
        } catch (\Exception $e) {
            return back()->with('error', 'An error occurred while processing the refund: '.$e->getMessage());
        }
    }
}
