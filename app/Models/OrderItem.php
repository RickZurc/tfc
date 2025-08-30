<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderItem extends Model
{
    /** @use HasFactory<\Database\Factories\OrderItemFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'total_price' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'refunded_amount' => 'decimal:2',
            'refunded_at' => 'datetime',
        ];
    }

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_sku',
        'unit_price',
        'quantity',
        'refunded_quantity',
        'refunded_amount',
        'refund_reason',
        'refunded_by',
        'refunded_at',
        'total_price',
        'tax_rate',
        'tax_amount',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function calculateTotals(): void
    {
        $this->total_price = $this->unit_price * $this->quantity;
        $this->tax_amount = ($this->total_price * $this->tax_rate) / 100;
        $this->save();
    }

    public function getRemainingQuantityAttribute(): int
    {
        return $this->quantity - $this->refunded_quantity;
    }

    public function getIsFullyRefundedAttribute(): bool
    {
        return $this->refunded_quantity >= $this->quantity;
    }

    public function getIsPartiallyRefundedAttribute(): bool
    {
        return $this->refunded_quantity > 0 && $this->refunded_quantity < $this->quantity;
    }

    public function canRefund(int $quantity = null): bool
    {
        $quantityToRefund = $quantity ?? $this->remaining_quantity;
        return $quantityToRefund > 0 && ($this->refunded_quantity + $quantityToRefund) <= $this->quantity;
    }

    public function refundItem(int $quantity, string $reason, int $refundedBy): bool
    {
        if (!$this->canRefund($quantity)) {
            return false;
        }

        $refundAmount = ($this->unit_price * $quantity);
        
        $this->refunded_quantity += $quantity;
        $this->refunded_amount += $refundAmount;
        $this->refund_reason = $reason;
        $this->refunded_by = $refundedBy;
        $this->refunded_at = now();

        return $this->save();
    }

    public function refundedBy(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'refunded_by');
    }
}
