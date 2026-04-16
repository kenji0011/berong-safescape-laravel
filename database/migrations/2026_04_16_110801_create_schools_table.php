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
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('address')->nullable();
            $table->string('region')->nullable();
            $table->string('district')->nullable();
            $table->string('type')->default('elementary'); // elementary, highschool, college
            $table->string('contactPerson')->nullable();
            $table->string('contactEmail')->nullable();
            $table->string('contactPhone')->nullable();
            $table->integer('totalStudents')->default(0);
            $table->float('averagePreTestScore')->default(0);
            $table->float('averagePostTestScore')->default(0);
            $table->float('averageCompletionRate')->default(0);
            $table->integer('totalModulesCompleted')->default(0);
            $table->boolean('isActive')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};
