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
        Schema::table('carousel_images', function (Blueprint $table) {
            $table->index(['isActive', 'order']);
        });

        Schema::table('videos', function (Blueprint $table) {
            $table->index(['category', 'isActive', 'order']);
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->index(['isPublished', 'created_at']);
        });

        Schema::table('engagement_logs', function (Blueprint $table) {
            $table->index(['userId', 'eventType']);
        });

        Schema::table('safescape_progress', function (Blueprint $table) {
            $table->index(['userId', 'completed', 'moduleNum']);
        });

        Schema::table('user_badges', function (Blueprint $table) {
            $table->index('userId');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('carousel_images', function (Blueprint $table) {
            $table->dropIndex(['isActive', 'order']);
        });

        Schema::table('videos', function (Blueprint $table) {
            $table->dropIndex(['category', 'isActive', 'order']);
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropIndex(['isPublished', 'created_at']);
        });

        Schema::table('engagement_logs', function (Blueprint $table) {
            $table->dropIndex(['userId', 'eventType']);
        });

        Schema::table('safescape_progress', function (Blueprint $table) {
            $table->dropIndex(['userId', 'completed', 'moduleNum']);
        });

        Schema::table('user_badges', function (Blueprint $table) {
            $table->dropIndex(['userId']);
        });
    }
};
