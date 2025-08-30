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
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('discount_percentage', 5, 2)->nullable()->after('price');
            $table->decimal('discount_amount', 10, 2)->nullable()->after('discount_percentage');
            $table->enum('discount_type', ['percentage', 'fixed'])->nullable()->after('discount_amount');
            $table->timestamp('discount_starts_at')->nullable()->after('discount_type');
            $table->timestamp('discount_ends_at')->nullable()->after('discount_starts_at');
            $table->boolean('discount_active')->default(false)->after('discount_ends_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'discount_percentage',
                'discount_amount',
                'discount_type',
                'discount_starts_at',
                'discount_ends_at',
                'discount_active'
            ]);
        });
    }
};
