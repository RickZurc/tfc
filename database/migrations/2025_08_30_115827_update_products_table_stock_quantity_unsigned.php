<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // First, update any negative values to 0
            DB::table('products')
                ->where('stock_quantity', '<', 0)
                ->update(['stock_quantity' => 0]);
            
            // Then modify the column to be unsigned
            $table->integer('stock_quantity')->unsigned()->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Revert back to signed integer
            $table->integer('stock_quantity')->default(0)->change();
        });
    }
};
