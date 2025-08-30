<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RefundController extends Controller
{
    public function refundItem(Request $request, OrderItem $orderItem)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:500',
        ]);

        $quantity = (int) $request->quantity;
        
        // Check if the quantity can be refunded
        if (!$orderItem->canRefund($quantity)) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot refund the requested quantity. Available for refund: ' . $orderItem->remaining_quantity
            ], 400);
        }

        try {
            DB::beginTransaction();

            $success = $orderItem->order->refundItem(
                $orderItem->id,
                $quantity,
                $request->reason,
                Auth::id()
            );

            if ($success) {
                DB::commit();
                
                return response()->json([
                    'success' => true,
                    'message' => "Successfully refunded {$quantity} unit(s) of {$orderItem->product_name}",
                    'refunded_amount' => $orderItem->unit_price * $quantity,
                ]);
            } else {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to process refund'
                ], 400);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing the refund: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getRefundHistory(Order $order)
    {
        $refundedItems = $order->items()
            ->where('refunded_quantity', '>', 0)
            ->with(['product', 'refundedBy'])
            ->get();

        return response()->json([
            'success' => true,
            'refunded_items' => $refundedItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'product_sku' => $item->product_sku,
                    'original_quantity' => $item->quantity,
                    'refunded_quantity' => $item->refunded_quantity,
                    'remaining_quantity' => $item->remaining_quantity,
                    'unit_price' => $item->unit_price,
                    'refunded_amount' => $item->refunded_amount,
                    'refund_reason' => $item->refund_reason,
                    'refunded_by' => $item->refundedBy?->name,
                    'refunded_at' => $item->refunded_at?->format('Y-m-d H:i:s'),
                ];
            }),
            'total_refunded' => $order->total_refunded_amount,
        ]);
    }
}
