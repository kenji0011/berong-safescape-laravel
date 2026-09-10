<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class RouteNavigationTest extends TestCase
{
    use RefreshDatabase;

    public function test_kids_mini_games_render_correct_inertia_components(): void
    {
        $user = User::factory()->create([
            'role' => 'kid',
            'isActive' => true,
        ]);

        $this->actingAs($user)
            ->get('/kids/memory-game')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('Kids/Games/MemoryGame'));

        $this->actingAs($user)
            ->get('/kids/smoke-crawl')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('Kids/Games/SmokeCrawl'));

        $this->actingAs($user)
            ->get('/kids/hot-or-not')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('Kids/Games/HotOrNot'));

        $this->actingAs($user)
            ->get('/kids/the-right-call')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('Kids/Games/RightCall'));

        $this->actingAs($user)
            ->get('/kids/hazard-blitz')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('Kids/Games/HazardBlitz'));

        $this->actingAs($user)
            ->get('/kids/task-master')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('Kids/Games/TaskMaster'));
    }

    public function test_admin_dashboard_renders_cleanly(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'isActive' => true,
        ]);

        $this->actingAs($admin)
            ->get('/admin')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('AdminDashboard'));

        $this->actingAs($admin)
            ->get('/admin/analytics')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Analytics'));
    }

    public function test_public_and_role_dashboards_render_cleanly(): void
    {
        // 1. Welcome Page (Uses Components/Landing)
        $this->get('/')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('Welcome'));

        // 2. About Page (Uses Components/Effects)
        $this->get('/about')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('About'));

        // 3. Adult Dashboard (Uses Components/Banners)
        $adult = User::factory()->create(['role' => 'adult', 'isActive' => true]);
        $this->actingAs($adult)
            ->get('/adult')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('AdultDashboard'));

        // 4. Kids Dashboard (Uses Components/Banners)
        $kid = User::factory()->create(['role' => 'kid', 'isActive' => true]);
        $this->actingAs($kid)
            ->get('/kids')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('KidsDashboard'));

        // 5. Professional Dashboard (Uses Components/Banners)
        $prof = User::factory()->create(['role' => 'professional', 'isActive' => true]);
        $this->actingAs($prof)
            ->get('/professional')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('ProfessionalDashboard'));
    }
}
