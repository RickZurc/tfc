<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        // Get sales statistics for the dashboard
        $todaySales = \App\Models\Order::where('status', 'completed')
            ->whereDate('completed_at', today())
            ->sum('total_amount');

        $weekSales = \App\Models\Order::where('status', 'completed')
            ->where('completed_at', '>=', now()->startOfWeek())
            ->sum('total_amount');

        $monthSales = \App\Models\Order::where('status', 'completed')
            ->whereMonth('completed_at', now()->month)
            ->whereYear('completed_at', now()->year)
            ->sum('total_amount');

        $totalOrders = \App\Models\Order::where('status', 'completed')->count();

        // Sales by category (last 30 days)
        $salesByCategory = \App\Models\OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('orders.status', 'completed')
            ->where('orders.completed_at', '>=', now()->subDays(30))
            ->selectRaw('categories.name as category, categories.color, SUM(order_items.total_price) as total_sales')
            ->groupBy('categories.id', 'categories.name', 'categories.color')
            ->orderBy('total_sales', 'desc')
            ->get();

        // Daily sales for the last 7 days
        $dailySales = \App\Models\Order::where('status', 'completed')
            ->where('completed_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(completed_at) as date, SUM(total_amount) as total, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top selling products (last 30 days)
        $topProducts = \App\Models\OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.status', 'completed')
            ->where('orders.completed_at', '>=', now()->subDays(30))
            ->selectRaw('products.name, SUM(order_items.quantity) as total_sold, SUM(order_items.total_price) as revenue')
            ->groupBy('products.id', 'products.name')
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get();

        // Low stock products
        $lowStockProducts = \App\Models\Product::where('track_stock', true)
            ->whereRaw('stock_quantity <= min_stock_level')
            ->with('category')
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'statistics' => [
                'todaySales' => $todaySales,
                'weekSales' => $weekSales,
                'monthSales' => $monthSales,
                'totalOrders' => $totalOrders,
            ],
            'salesByCategory' => $salesByCategory,
            'dailySales' => $dailySales,
            'topProducts' => $topProducts,
            'lowStockProducts' => $lowStockProducts,
        ]);
    })->name('dashboard');

    // POS Routes
    Route::prefix('pos')->name('pos.')->group(function () {
        Route::get('/', [POSController::class, 'index'])->name('index');
        Route::post('/orders', [POSController::class, 'createOrder'])->name('orders.create');
        Route::get('/products/search', [POSController::class, 'searchProducts'])->name('products.search');
    });

    // Product Management Routes
    Route::resource('products', ProductController::class);
    Route::patch('/products/{product}/toggle-status', [ProductController::class, 'toggleStatus'])->name('products.toggle-status');
    Route::post('/products/bulk-action', [ProductController::class, 'bulkAction'])->name('products.bulk-action');

    // Order Management Routes
    Route::resource('orders', OrderController::class)->only(['index', 'show']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
