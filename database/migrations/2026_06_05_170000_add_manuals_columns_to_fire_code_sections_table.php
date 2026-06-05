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
        Schema::table('fire_code_sections', function (Blueprint $table) {
            $table->string('category')->default('Fire Code')->after('title');
            $table->text('description')->nullable()->after('category');
            $table->string('filename')->nullable()->after('description');
            
            // Make sectionNum and content nullable so manuals don't require them
            $table->string('sectionNum')->nullable()->change();
            $table->text('content')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fire_code_sections', function (Blueprint $table) {
            $table->string('sectionNum')->nullable(false)->change();
            $table->text('content')->nullable(false)->change();
            
            $table->dropColumn(['category', 'description', 'filename']);
        });
    }
};
