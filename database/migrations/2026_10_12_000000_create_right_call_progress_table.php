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
        Schema::create('right_call_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->unsignedInteger('high_score')->default(0);
            $table->unsignedInteger('total_calls_handled')->default(0);
            $table->unsignedInteger('successful_calls')->default(0);
            $table->unsignedInteger('failed_calls')->default(0);
            $table->decimal('accuracy_rate', 5, 2)->default(0.00);
            $table->string('current_rank')->default('Junior Dispatcher');
            $table->json('completed_scenarios')->nullable();
            $table->json('game_state_data')->nullable();
            $table->timestamp('last_played_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('right_call_progress');
    }
};
