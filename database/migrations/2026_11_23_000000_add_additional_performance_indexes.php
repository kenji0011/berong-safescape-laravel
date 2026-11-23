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
        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['userId', 'createdAt']);
        });

        Schema::table('engagement_logs', function (Blueprint $table) {
            $table->index('loggedAt');
        });

        Schema::table('user_answers', function (Blueprint $table) {
            $table->index(['userId', 'testType', 'answeredAt']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['userId', 'createdAt']);
        });

        Schema::table('engagement_logs', function (Blueprint $table) {
            $table->dropIndex(['loggedAt']);
        });

        Schema::table('user_answers', function (Blueprint $table) {
            $table->dropIndex(['userId', 'testType', 'answeredAt']);
        });
    }
};
