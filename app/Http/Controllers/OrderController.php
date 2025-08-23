<?php

namespace App\Http\Controllers;

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

        // Filter by status if provided
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter by date range if provided
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search by order number
        if ($request->has('search') && $request->search) {
            $query->where('order_number', 'like', '%'.$request->search.'%');
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
        $order->load(['user', 'customer', 'items.product.category']);

        return Inertia::render('Orders/Show', [
            'order' => $order,
        ]);
    }
}
