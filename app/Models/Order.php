<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    /** @use HasFactory<\Database\Factories\OrderFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'change_amount' => 'decimal:2',
            'refund_amount' => 'decimal:2',
            'completed_at' => 'datetime',
            'refunded_at' => 'datetime',
        ];
    }

    protected $fillable = [
        'order_number',
        'customer_id',
        'user_id',
        'status',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'payment_method',
        'amount_paid',
        'change_amount',
        'refund_amount',
        'refund_reason',
        'refunded_by',
        'refunded_at',
        'notes',
        'completed_at',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function refundedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'refunded_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function generateOrderNumber(): string
    {
        return 'ORD-'.date('Ymd').'-'.str_pad($this->id, 4, '0', STR_PAD_LEFT);
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Update customer totals
        $this->customer?->updateTotals();

        // Update product stock
        foreach ($this->items as $item) {
            if ($item->product->track_stock) {
                $item->product->decrement('stock_quantity', $item->quantity);
            }
        }
    }

    public function calculateTotals(): void
    {
        $subtotal = $this->items->sum('total_price');
        $taxAmount = $this->items->sum('tax_amount');

        $this->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total_amount' => $subtotal + $taxAmount - $this->discount_amount,
        ]);
    }

    public function canBeRefunded(): bool
    {
        return $this->status === 'completed' && $this->refund_amount === null;
    }

    public function processRefund(float $refundAmount, string $reason, int $refundedByUserId): bool
    {
        if (!$this->canBeRefunded()) {
            return false;
        }

        if ($refundAmount <= 0 || $refundAmount > $this->total_amount) {
            return false;
        }

        // Restore product stock
        foreach ($this->items as $item) {
            if ($item->product->track_stock) {
                $item->product->increment('stock_quantity', $item->quantity);
            }
        }

        // Update order with refund information
        $this->update([
            'status' => 'refunded',
            'refund_amount' => $refundAmount,
            'refund_reason' => $reason,
            'refunded_by' => $refundedByUserId,
            'refunded_at' => now(),
        ]);

        // Update customer totals if customer exists
        $this->customer?->updateTotals();

        return true;
    }

    public function isFullRefund(): bool
    {
        return $this->refund_amount && $this->refund_amount >= $this->total_amount;
    }

    public function isPartialRefund(): bool
    {
        return $this->refund_amount && $this->refund_amount < $this->total_amount;
    }
}
