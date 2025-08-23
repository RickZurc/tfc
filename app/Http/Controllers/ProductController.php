<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::with(['category']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('sku', 'like', "%{$searchTerm}%")
                    ->orWhere('barcode', 'like', "%{$searchTerm}%");
            });
        }

        // Category filter
        if ($request->has('category') && $request->category) {
            $query->where('category_id', $request->category);
        }

        // Status filter
        if ($request->has('status') && $request->status !== '') {
            $query->where('is_active', $request->status === 'active');
        }

        // Stock filter
        if ($request->has('stock') && $request->stock) {
            switch ($request->stock) {
                case 'low':
                    $query->where('track_stock', true)
                        ->whereRaw('stock_quantity <= min_stock_level');
                    break;
                case 'out':
                    $query->where('track_stock', true)
                        ->where('stock_quantity', 0);
                    break;
                case 'in':
                    $query->where('track_stock', true)
                        ->where('stock_quantity', '>', 0);
                    break;
            }
        }

        // Sorting
        $sortField = $request->get('sort', 'name');
        $sortDirection = $request->get('direction', 'asc');

        if (in_array($sortField, ['name', 'price', 'stock_quantity', 'created_at'])) {
            $query->orderBy($sortField, $sortDirection);
        }

        $products = $query->paginate(15)->withQueryString();

        // Get categories for filters
        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'status', 'stock', 'sort', 'direction']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        return Inertia::render('Products/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();

        // Generate slug from name
        $validated['slug'] = $this->generateSlug($validated['name']);

        // Generate SKU if not provided
        if (empty($validated['sku'])) {
            $validated['sku'] = $this->generateSKU($validated['name']);
        }

        // Set defaults
        $validated['track_stock'] = $validated['track_stock'] ?? false;
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['tax_rate'] = $validated['tax_rate'] ?? 0;

        // If not tracking stock, set stock fields to 0
        if (! $validated['track_stock']) {
            $validated['stock_quantity'] = 0;
            $validated['min_stock_level'] = 0;
            $validated['max_stock_level'] = null; // This one can be null
        }

        $product = Product::create($validated);

        return redirect()
            ->route('products.index')
            ->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $product->load(['category']);

        // Get recent orders for this product
        $recentOrders = $product->orderItems()
            ->with(['order.customer'])
            ->latest()
            ->take(10)
            ->get();

        // Get sales statistics
        $totalSold = $product->orderItems()
            ->whereHas('order', fn ($q) => $q->where('status', 'completed'))
            ->sum('quantity');

        $totalRevenue = $product->orderItems()
            ->whereHas('order', fn ($q) => $q->where('status', 'completed'))
            ->sum('total_price');

        return Inertia::render('Products/Show', [
            'product' => $product,
            'recentOrders' => $recentOrders,
            'statistics' => [
                'totalSold' => $totalSold,
                'totalRevenue' => $totalRevenue,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        return Inertia::render('Products/Edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $validated = $request->validated();

        // Generate new slug if name has changed
        if (isset($validated['name']) && $validated['name'] !== $product->name) {
            $validated['slug'] = $this->generateSlug($validated['name']);
        }

        // Set defaults
        $validated['track_stock'] = $validated['track_stock'] ?? false;
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['tax_rate'] = $validated['tax_rate'] ?? 0;

        // Handle stock tracking fields
        if (! $validated['track_stock']) {
            // If not tracking stock, set stock fields to 0
            $validated['stock_quantity'] = 0;
            $validated['min_stock_level'] = 0;
            $validated['max_stock_level'] = null; // This one can be null
        } else {
            // If tracking stock, ensure required fields have defaults
            $validated['stock_quantity'] = $validated['stock_quantity'] ?? 0;
            $validated['min_stock_level'] = $validated['min_stock_level'] ?? 0;
        }

        $product->update($validated);

        return redirect()
            ->route('products.index')
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Check if product has any orders
        if ($product->orderItems()->exists()) {
            return redirect()
                ->route('products.index')
                ->with('error', 'Cannot delete product that has been used in orders. You can deactivate it instead.');
        }

        $product->delete();

        return redirect()
            ->route('products.index')
            ->with('success', 'Product deleted successfully.');
    }

    /**
     * Toggle product status (active/inactive)
     */
    public function toggleStatus(Product $product)
    {
        $product->update(['is_active' => ! $product->is_active]);

        $status = $product->is_active ? 'activated' : 'deactivated';

        return redirect()
            ->route('products.index')
            ->with('success', "Product {$status} successfully.");
    }

    /**
     * Bulk actions for products
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate,delete',
            'products' => 'required|array|min:1',
            'products.*' => 'exists:products,id',
        ]);

        $products = Product::whereIn('id', $request->products);

        switch ($request->action) {
            case 'activate':
                $products->update(['is_active' => true]);
                $message = 'Products activated successfully.';
                break;

            case 'deactivate':
                $products->update(['is_active' => false]);
                $message = 'Products deactivated successfully.';
                break;

            case 'delete':
                // Check if any products have orders
                $productsWithOrders = $products->whereHas('orderItems')->count();
                if ($productsWithOrders > 0) {
                    return redirect()
                        ->route('products.index')
                        ->with('error', 'Some products cannot be deleted because they have been used in orders.');
                }

                $products->delete();
                $message = 'Products deleted successfully.';
                break;
        }

        return redirect()
            ->route('products.index')
            ->with('success', $message);
    }

    /**
     * Generate a unique SKU based on product name
     */
    private function generateSKU(string $name): string
    {
        $base = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $name), 0, 6));
        $counter = 1;

        do {
            $sku = $base.str_pad($counter, 3, '0', STR_PAD_LEFT);
            $exists = Product::where('sku', $sku)->exists();
            $counter++;
        } while ($exists);

        return $sku;
    }

    /**
     * Generate a unique slug based on product name
     */
    private function generateSlug(string $name): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        do {
            $exists = Product::where('slug', $slug)->exists();
            if ($exists) {
                $slug = $originalSlug.'-'.$counter;
                $counter++;
            }
        } while ($exists);

        return $slug;
    }
}
