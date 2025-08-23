<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class POSController extends Controller
{
    public function index()
    {
        $categories = Category::with('activeProducts')
            ->where('is_active', true)
            ->get();

        $products = Product::with('category')
            ->where('is_active', true)
            ->get();

        return Inertia::render('POS/Index', [
            'categories' => $categories,
            'products' => $products,
        ]);
    }

    public function createOrder(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'customer_id' => 'nullable|exists:customers,id',
            'payment_method' => 'required|in:cash,card,digital,mixed',
            'amount_paid' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|in:percentage,numerical',
            'discount_input' => 'nullable|numeric|min:0',
        ]);

        // Generate a temporary order number for creation
        $tempOrderNumber = 'TEMP-'.time().'-'.rand(1000, 9999);

        $order = Order::create([
            'order_number' => $tempOrderNumber,
            'customer_id' => $request->customer_id,
            'user_id' => auth()->id(),
            'status' => 'pending',
            'subtotal' => 0,
            'tax_amount' => 0,
            'discount_amount' => $request->discount_amount ?? 0,
            'total_amount' => 0,
            'payment_method' => $request->payment_method,
            'amount_paid' => $request->amount_paid,
            'change_amount' => 0,
        ]);

        foreach ($request->items as $item) {
            $product = Product::find($item['product_id']);

            $orderItem = OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_sku' => $product->sku,
                'unit_price' => $product->price,
                'quantity' => $item['quantity'],
                'total_price' => $product->price * $item['quantity'],
                'tax_rate' => $product->tax_rate,
                'tax_amount' => ($product->price * $item['quantity'] * $product->tax_rate) / 100,
            ]);
        }

        $order->calculateTotals();
        $order->update([
            'change_amount' => max(0, $order->amount_paid - $order->total_amount),
        ]);

        // Generate order number after creation
        $order->update([
            'order_number' => $order->generateOrderNumber(),
        ]);

        $order->markAsCompleted();

        return response()->json([
            'success' => true,
            'order' => $order->load('items.product', 'customer'),
            'message' => 'Order created successfully',
        ]);
    }

    public function searchProducts(Request $request)
    {
        $query = $request->get('q');

        $products = Product::with('category')
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('sku', 'like', "%{$query}%")
                    ->orWhere('barcode', 'like', "%{$query}%");
            })
            ->limit(20)
            ->get();

        return response()->json($products);
    }
}
