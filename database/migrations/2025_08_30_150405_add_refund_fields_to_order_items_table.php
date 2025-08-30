<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->integer('refunded_quantity')->default(0)->after('quantity');
            $table->decimal('refunded_amount', 10, 2)->default(0)->after('refunded_quantity');
            $table->text('refund_reason')->nullable()->after('refunded_amount');
            $table->foreignId('refunded_by')->nullable()->constrained('users')->after('refund_reason');
            $table->timestamp('refunded_at')->nullable()->after('refunded_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('refunded_by');
            $table->dropColumn(['refunded_quantity', 'refunded_amount', 'refund_reason', 'refunded_at']);
        });
    }
};
