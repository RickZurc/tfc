<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    /** @use HasFactory<\Database\Factories\CustomerFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'total_spent' => 'decimal:2',
            'last_purchase_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'tax_number',
        'type',
        'total_spent',
        'total_orders',
        'last_purchase_date',
        'is_active',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function completedOrders(): HasMany
    {
        return $this->hasMany(Order::class)->where('status', 'completed');
    }

    public function updateTotals(): void
    {
        $completedOrders = $this->completedOrders();

        $this->update([
            'total_spent' => $completedOrders->sum('total_amount'),
            'total_orders' => $completedOrders->count(),
            'last_purchase_date' => $completedOrders->latest('completed_at')->first()?->completed_at?->toDateString(),
        ]);
    }
}
