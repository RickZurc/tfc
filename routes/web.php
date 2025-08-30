<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
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

        // Refund statistics
        $todayRefunds = \App\Models\Order::whereNotNull('refunded_at')
            ->whereDate('refunded_at', today())
            ->sum('refund_amount');

        $weekRefunds = \App\Models\Order::whereNotNull('refunded_at')
            ->where('refunded_at', '>=', now()->startOfWeek())
            ->sum('refund_amount');

        $monthRefunds = \App\Models\Order::whereNotNull('refunded_at')
            ->whereMonth('refunded_at', now()->month)
            ->whereYear('refunded_at', now()->year)
            ->sum('refund_amount');

        $totalRefunds = \App\Models\Order::whereNotNull('refunded_at')->count();
        
        // Calculate refund rate
        $refundRate = $totalOrders > 0 ? ($totalRefunds / $totalOrders) * 100 : 0;

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
                'todayRefunds' => $todayRefunds,
                'weekRefunds' => $weekRefunds,
                'monthRefunds' => $monthRefunds,
                'totalRefunds' => $totalRefunds,
                'refundRate' => $refundRate,
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

    // POS Cart Backup API Routes
    Route::prefix('api/pos')->name('api.pos.')->group(function () {
        Route::post('/save-cart', [\App\Http\Controllers\Api\CartBackupController::class, 'saveCart'])->name('save-cart');
        Route::get('/restore-cart', [\App\Http\Controllers\Api\CartBackupController::class, 'restoreCart'])->name('restore-cart');
        Route::delete('/clear-cart', [\App\Http\Controllers\Api\CartBackupController::class, 'clearCart'])->name('clear-cart');
        Route::get('/cart-info', [\App\Http\Controllers\Api\CartBackupController::class, 'getCartInfo'])->name('cart-info');
    });

    // Product Management Routes
    Route::resource('products', ProductController::class);
    Route::patch('/products/{product}/toggle-status', [ProductController::class, 'toggleStatus'])->name('products.toggle-status');
    Route::post('/products/bulk-action', [ProductController::class, 'bulkAction'])->name('products.bulk-action');

    // Order Management Routes
    Route::resource('orders', OrderController::class)->only(['index', 'show']);
    Route::post('orders/{order}/refund', [OrderController::class, 'refund'])->name('orders.refund');

    // Category Management Routes
    Route::resource('categories', CategoryController::class);
    Route::patch('/categories/{category}/toggle-status', [CategoryController::class, 'toggleStatus'])->name('categories.toggle-status');

    
    // Partial Refund Routes
    Route::post('order-items/{orderItem}/refund', [\App\Http\Controllers\RefundController::class, 'refundItem'])->name('order-items.refund');
    Route::get('orders/{order}/refund-history', [\App\Http\Controllers\RefundController::class, 'getRefundHistory'])->name('orders.refund-history');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
