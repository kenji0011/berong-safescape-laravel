<?php

/**
 * BFP Berong SafeScape - Interactive Fire Safety E-Learning Platform
 * Copyright (c) 2026 Bureau of Fire Protection - Sta. Cruz Fire Station, Laguna.
 * All Rights Reserved.
 *
 * Module: Web Application Routing Definitions
 */

use App\Http\Controllers\AdminController;
use App\Http\Controllers\BadgeController;
use App\Http\Controllers\WebPageController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WebPageController::class, 'welcome']);
Route::get('/about', [WebPageController::class, 'about']);
Route::get('/game', [WebPageController::class, 'game']);
Route::get('/maintenance', [WebPageController::class, 'maintenance'])->name('maintenance');

// Primary User Flow Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/assessment/{type}', [WebPageController::class, 'assessment'])->name('assessment.test');
    Route::get('/dashboard', [WebPageController::class, 'dashboard'])->name('dashboard');
    Route::get('/profile', [WebPageController::class, 'profile'])->name('profile');

    Route::middleware('role:kid,adult')->group(function () {
        Route::get('/kids', [WebPageController::class, 'kidsDashboard'])->name('kids');

        Route::post('/api/badges/award', [BadgeController::class, 'award'])->name('badges.award');
        Route::get('/api/badges', [BadgeController::class, 'index'])->name('badges.index');

        Route::get('/kids/safescape', [WebPageController::class, 'kidsCourse'])->name('kids.course');
        Route::get('/kids/safescape/{moduleNum}', [WebPageController::class, 'kidsModule'])->name('kids.module');
        Route::get('/kids/videos', [WebPageController::class, 'kidsVideos'])->name('kids.videos');
        Route::get('/kids/quiz', [WebPageController::class, 'kidsQuiz'])->name('kids.quiz');
        Route::get('/kids/memory-game', [WebPageController::class, 'kidsMemory'])->name('kids.memory');
        Route::get('/kids/smoke-crawl', [WebPageController::class, 'kidsSmokeCrawl'])->name('kids.smoke_crawl');
        Route::get('/kids/hot-or-not', [WebPageController::class, 'kidsHotOrNot'])->name('kids.hot_or_not');
        Route::get('/kids/the-right-call', [WebPageController::class, 'kidsRightCall'])->name('kids.right_call');
        Route::get('/kids/hazard-blitz', [WebPageController::class, 'kidsHazardBlitz'])->name('kids.hazard_blitz');
        Route::get('/kids/challenges', [WebPageController::class, 'kidsChallenges'])->name('kids.challenges');
        Route::get('/kids/badges', [WebPageController::class, 'kidsBadges'])->name('kids.badges');
        Route::get('/kids/task-master', [WebPageController::class, 'kidsTaskMaster'])->name('kids.task-master');
        Route::get('/kids/certificate', [WebPageController::class, 'kidsCertificate'])->name('kids.certificate');
    }); // End Kids role group

    Route::middleware('role:adult,professional')->group(function () {
        Route::get('/adult', [WebPageController::class, 'adultDashboard'])->name('adult');
        Route::get('/adult/blog/{id}', [WebPageController::class, 'adultBlogShow'])->name('adult.blog.show');
    }); // End Adult role group

    Route::middleware('role:professional')->group(function () {
        Route::get('/professional', [WebPageController::class, 'professionalDashboard'])->name('professional');
        Route::get('/professional/the-right-call', [WebPageController::class, 'kidsRightCall'])->name('professional.right_call');
    }); // End Professional role group

    // Admin routing
    Route::middleware('admin')->group(function () {
        Route::get('/admin', [AdminController::class, 'dashboardPage'])->name('admin');
        Route::get('/admin/analytics', [AdminController::class, 'analyticsPage'])->name('admin.analytics');
    });
});

require __DIR__.'/auth.php';
