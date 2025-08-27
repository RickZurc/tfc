<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CartBackupController extends Controller
{
    /**
     * Save cart data to server-side storage for backup
     */
    public function saveCart(Request $request)
    {
        try {
            $request->validate([
                'items' => 'required|array',
                'items.*.id' => 'required|integer',
                'items.*.quantity' => 'required|integer|min:1',
                'discountAmount' => 'nullable|string',
                'discountType' => 'nullable|in:percentage,numerical',
                'paymentMethod' => 'nullable|in:cash,card,digital',
                'customerId' => 'nullable|integer',
            ]);

            $userId = auth()->id();
            $sessionId = session()->getId();
            
            // Create a unique key for this user/session
            $cacheKey = "pos_cart_backup_{$userId}_{$sessionId}";
            
            $cartData = [
                'items' => $request->items,
                'discountAmount' => $request->discountAmount ?? '0',
                'discountType' => $request->discountType ?? 'numerical',
                'paymentMethod' => $request->paymentMethod ?? 'cash',
                'customerId' => $request->customerId,
                'savedAt' => now()->toISOString(),
                'userId' => $userId,
                'sessionId' => $sessionId,
            ];

            // Store in cache for 24 hours
            Cache::put($cacheKey, $cartData, now()->addHours(24));

            Log::info('POS cart backed up to server', [
                'user_id' => $userId,
                'session_id' => $sessionId,
                'item_count' => count($request->items),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cart saved successfully',
                'saved_at' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to backup POS cart', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to save cart',
            ], 500);
        }
    }

    /**
     * Restore cart data from server-side storage
     */
    public function restoreCart(Request $request)
    {
        try {
            $userId = auth()->id();
            $sessionId = session()->getId();
            
            $cacheKey = "pos_cart_backup_{$userId}_{$sessionId}";
            
            $cartData = Cache::get($cacheKey);
            
            if (!$cartData) {
                return response()->json([
                    'success' => false,
                    'message' => 'No saved cart found',
                    'data' => null,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Cart restored successfully',
                'data' => $cartData,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to restore POS cart', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to restore cart',
            ], 500);
        }
    }

    /**
     * Clear saved cart data
     */
    public function clearCart(Request $request)
    {
        try {
            $userId = auth()->id();
            $sessionId = session()->getId();
            
            $cacheKey = "pos_cart_backup_{$userId}_{$sessionId}";
            
            Cache::forget($cacheKey);

            return response()->json([
                'success' => true,
                'message' => 'Saved cart cleared successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to clear POS cart backup', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to clear saved cart',
            ], 500);
        }
    }

    /**
     * Get cart backup info
     */
    public function getCartInfo(Request $request)
    {
        try {
            $userId = auth()->id();
            $sessionId = session()->getId();
            
            $cacheKey = "pos_cart_backup_{$userId}_{$sessionId}";
            
            $cartData = Cache::get($cacheKey);
            
            if (!$cartData) {
                return response()->json([
                    'success' => true,
                    'has_backup' => false,
                    'info' => null,
                ]);
            }

            return response()->json([
                'success' => true,
                'has_backup' => true,
                'info' => [
                    'item_count' => count($cartData['items'] ?? []),
                    'saved_at' => $cartData['savedAt'],
                    'discount_amount' => $cartData['discountAmount'],
                    'payment_method' => $cartData['paymentMethod'],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get POS cart info', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get cart info',
            ], 500);
        }
    }
}
