<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'discount_percentage' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'is_active' => 'boolean',
            'track_stock' => 'boolean',
            'discount_active' => 'boolean',
            'discount_starts_at' => 'datetime',
            'discount_ends_at' => 'datetime',
        ];
    }

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'sku',
        'barcode',
        'price',
        'cost_price',
        'stock_quantity',
        'min_stock_level',
        'unit',
        'image_url',
        'is_active',
        'track_stock',
        'tax_rate',
        'discount_percentage',
        'discount_amount',
        'discount_type',
        'discount_starts_at',
        'discount_ends_at',
        'discount_active',
    ];

    /**
     * The attributes that should be validated before saving.
     */
    public static function rules(): array
    {
        return [
            'stock_quantity' => 'integer|min:0',
            'min_stock_level' => 'integer|min:0',
            'price' => 'numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|in:percentage,fixed',
            'discount_starts_at' => 'nullable|date',
            'discount_ends_at' => 'nullable|date|after:discount_starts_at',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function isLowStock(): bool
    {
        return $this->track_stock && $this->stock_quantity <= $this->min_stock_level;
    }

    public function isOutOfStock(): bool
    {
        return $this->track_stock && $this->stock_quantity <= 0;
    }

    public function calculateProfitMargin(): float
    {
        if (! $this->cost_price || $this->cost_price <= 0) {
            return 0;
        }

        return (($this->price - $this->cost_price) / $this->cost_price) * 100;
    }

    public function hasActiveDiscount(): bool
    {
        if (!$this->discount_active) {
            return false;
        }

        $now = now();
        
        if ($this->discount_starts_at && $this->discount_starts_at > $now) {
            return false;
        }
        
        if ($this->discount_ends_at && $this->discount_ends_at < $now) {
            return false;
        }

        return true;
    }

    /**
     * Get the discounted price if discount is active.
     */
    public function getDiscountedPrice(): float
    {
        if (!$this->hasActiveDiscount()) {
            return $this->price;
        }

        if ($this->discount_type === 'percentage') {
            $percentage = (float) $this->getAttributes()['discount_percentage'] ?? 0;
            return $this->price * (1 - ($percentage / 100));
        } elseif ($this->discount_type === 'fixed') {
            $amount = (float) $this->getAttributes()['discount_amount'] ?? 0;
            return max(0, $this->price - $amount);
        }

        return $this->price;
    }

    /**
     * Get the current effective price (discounted if applicable).
     */
    public function getCurrentPrice(): float
    {
        return $this->getDiscountedPrice();
    }

    /**
     * Get the discount amount in currency.
     */
    public function getDiscountAmount(): float
    {
        if (!$this->hasActiveDiscount()) {
            return 0;
        }

        return $this->price - $this->getDiscountedPrice();
    }

    /**
     * Get the discount percentage (calculated if fixed amount).
     */
    public function getDiscountPercentage(): float
    {
        if (!$this->hasActiveDiscount()) {
            return 0;
        }

        if ($this->discount_type === 'percentage') {
            return (float) $this->getAttributes()['discount_percentage'] ?? 0;
        }

        // Calculate percentage for fixed amount discounts
        if ($this->price > 0) {
            return ($this->getDiscountAmount() / $this->price) * 100;
        }

        return 0;
    }

    /**
     * Check if discount is expiring soon (within 24 hours).
     */
    public function isDiscountExpiringSoon(): bool
    {
        if (!$this->hasActiveDiscount() || !$this->discount_ends_at) {
            return false;
        }

        return $this->discount_ends_at <= now()->addDay();
    }

    // Accessors for API responses
    public function getHasActiveDiscountAttribute(): bool
    {
        return $this->hasActiveDiscount();
    }

    public function getCurrentPriceAttribute(): float
    {
        return $this->getDiscountedPrice();
    }

    public function getDiscountAmountAttribute(): float
    {
        return $this->getDiscountAmount();
    }

    public function getDiscountPercentageAttribute(): float
    {
        return $this->getDiscountPercentage();
    }
}
