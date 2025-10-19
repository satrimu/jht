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
        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->timestamp('payment_date');
            $table->enum('status', ['pending', 'terbayar'])->default('pending');
            $table->text('notes')->nullable();
            $table->string('image')->nullable(); // stores filename only
            $table->timestamps();
            $table->softDeletes();

            // Add indexes for performance
            $table->index(['user_id']); // For filtering by user
            $table->index(['status']); // For filtering by status
            $table->index(['payment_date']); // For sorting by payment date
            $table->index(['created_at']); // For sorting by creation date
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
