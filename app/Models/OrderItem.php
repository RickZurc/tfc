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
        ];
    }

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_sku',
        'unit_price',
        'quantity',
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
}
