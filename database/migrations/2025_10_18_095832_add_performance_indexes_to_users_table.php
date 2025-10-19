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
            // Index for filtering by role (WHERE role = 'admin')
            $table->index('role', 'users_role_index');

            // Index for filtering by status (WHERE is_active = 1)
            $table->index('is_active', 'users_is_active_index');

            // Composite index for common queries (WHERE role = 'admin' AND is_active = 1)
            $table->index(['role', 'is_active'], 'users_role_active_index');

            // Index for searching by name (WHERE name LIKE '%...%')
            $table->index('name', 'users_name_index');
            $table->index('full_name', 'users_full_name_index');

            // Index for date range queries (WHERE join_date BETWEEN '...' AND '...')
            $table->index('join_date', 'users_join_date_index');

            // Index for sorting by creation date (ORDER BY created_at DESC)
            $table->index('created_at', 'users_created_at_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            // Drop all indexes in reverse order
            $table->dropIndex('users_created_at_index');
            $table->dropIndex('users_join_date_index');
            $table->dropIndex('users_full_name_index');
            $table->dropIndex('users_name_index');
            $table->dropIndex('users_role_active_index');
            $table->dropIndex('users_is_active_index');
            $table->dropIndex('users_role_index');
        });
    }
};
