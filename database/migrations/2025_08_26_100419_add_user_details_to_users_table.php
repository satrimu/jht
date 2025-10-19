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
        Schema::table('users', function (Blueprint $table): void {
            $table->string('role')->default('member');
            $table->string('member_number')->unique(); // Required field
            $table->string('full_name'); // Required field
            $table->text('address'); // Required field
            $table->string('phone'); // Required field
            $table->date('join_date')->nullable();
            $table->text('note')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn([
                'role',
                'member_number',
                'full_name',
                'address',
                'phone',
                'join_date',
                'note',
                'image',
                'is_active',
            ]);
        });
    }
};
