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
        Schema::create('user_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('userId')->constrained('users')->cascadeOnDelete();
            $table->string('featureName'); // e.g. 'Module 1', 'Chatbot', 'Quiz', 'Video'
            $table->string('featureType')->default('module'); // module, chatbot, quiz, video, general
            $table->unsignedTinyInteger('rating'); // 1-5 stars
            $table->text('comments')->nullable();
            $table->string('sessionId')->nullable(); // track which session the feedback came from
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_feedback');
    }
};
