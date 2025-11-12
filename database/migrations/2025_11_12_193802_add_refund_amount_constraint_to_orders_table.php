<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, fix any existing orders where refund_amount exceeds total_amount
        // Set refund_amount to equal total_amount for those records
        DB::statement('UPDATE orders SET refund_amount = total_amount WHERE refund_amount IS NOT NULL AND refund_amount > total_amount');

        // Add a check constraint to ensure refund_amount never exceeds total_amount
        DB::statement('ALTER TABLE orders ADD CONSTRAINT chk_refund_amount_not_exceed_total CHECK (refund_amount IS NULL OR refund_amount <= total_amount)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_refund_amount_not_exceed_total');
    }
};
 