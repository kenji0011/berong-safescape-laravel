<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\RightCallProgress;
use App\Models\UserBadge;
use App\Models\Notification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RightCallProgressTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_load_initial_progress_for_user(): void
    {
        $user = User::factory()->create(['name' => 'Dispatcher Juan']);

        $response = $this->getJson("/api/games/right-call/load?user_id={$user->id}");

        $response->assertStatus(200)
            ->assertJson([
                'user_id'             => $user->id,
                'player_name'         => 'Dispatcher Juan',
                'high_score'          => 0,
                'total_calls_handled' => 0,
                'successful_calls'    => 0,
                'failed_calls'        => 0,
                'accuracy_rate'       => 0,
                'current_rank'        => 'Junior Dispatcher',
                'completed_scenarios' => [],
                'badge_unlocked'      => false,
            ]);

        $this->assertDatabaseHas('right_call_progress', [
            'user_id' => $user->id,
            'high_score' => 0,
        ]);
    }

    public function test_can_save_progress_and_update_stats(): void
    {
        $user = User::factory()->create(['name' => 'Maria']);

        $payload = [
            'user_id'             => $user->id,
            'score'               => 650,
            'calls_handled'       => 4,
            'successful_calls'    => 3,
            'failed_calls'        => 1,
            'completed_scenarios' => ['call_kitchen_fire', 'call_gas_leak'],
        ];

        $response = $this->postJson('/api/games/right-call/save', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'saved',
                'is_new_badge' => false,
            ]);

        $this->assertDatabaseHas('right_call_progress', [
            'user_id'             => $user->id,
            'high_score'          => 650,
            'total_calls_handled' => 4,
            'successful_calls'    => 3,
            'failed_calls'        => 1,
            'accuracy_rate'       => 75.00,
        ]);
    }

    public function test_preserves_highest_score_across_saves(): void
    {
        $user = User::factory()->create();

        // First session: 500 points
        $this->postJson('/api/games/right-call/save', [
            'user_id' => $user->id,
            'score'   => 500,
        ]);

        // Second session: 300 points (should not lower the high score)
        $this->postJson('/api/games/right-call/save', [
            'user_id' => $user->id,
            'score'   => 300,
        ]);

        $progress = RightCallProgress::where('user_id', $user->id)->first();
        $this->assertEquals(500, $progress->high_score);

        // Third session: 950 points (new high score)
        $this->postJson('/api/games/right-call/save', [
            'user_id' => $user->id,
            'score'   => 950,
        ]);

        $progress->refresh();
        $this->assertEquals(950, $progress->high_score);
    }

    public function test_awards_dispatch_hero_badge_and_notification_on_win(): void
    {
        $user = User::factory()->create(['role' => 'kid']);

        $response = $this->postJson('/api/games/right-call/save', [
            'user_id' => $user->id,
            'score'   => 1200,
            'is_won'  => true,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status'       => 'saved',
                'is_new_badge' => true,
            ]);

        $this->assertDatabaseHas('user_badges', [
            'userId'   => $user->id,
            'badge_id' => 'dispatch_hero',
        ]);

        $this->assertDatabaseHas('notifications', [
            'userId'   => $user->id,
            'category' => 'kids/badges',
        ]);

        // Saving again should not duplicate badge or notification
        $response2 = $this->postJson('/api/games/right-call/save', [
            'user_id' => $user->id,
            'score'   => 1500,
            'is_won'  => true,
        ]);

        $response2->assertStatus(200)
            ->assertJson([
                'is_new_badge' => false,
            ]);

        $this->assertEquals(1, UserBadge::where('userId', $user->id)->where('badge_id', 'dispatch_hero')->count());
    }

    public function test_rank_advances_as_successful_calls_increase(): void
    {
        $user = User::factory()->create();

        // 5 successful calls -> Dispatch Officer
        $this->postJson('/api/games/right-call/save', [
            'user_id'          => $user->id,
            'successful_calls' => 5,
            'calls_handled'    => 5,
        ]);

        $this->assertDatabaseHas('right_call_progress', [
            'user_id'      => $user->id,
            'current_rank' => 'Dispatch Officer',
        ]);

        // 5 more (10 total) -> Senior Dispatcher
        $this->postJson('/api/games/right-call/save', [
            'user_id'          => $user->id,
            'successful_calls' => 5,
            'calls_handled'    => 5,
        ]);

        $this->assertDatabaseHas('right_call_progress', [
            'user_id'      => $user->id,
            'current_rank' => 'Senior Dispatcher',
        ]);
    }

    public function test_leaderboard_endpoint(): void
    {
        $user1 = User::factory()->create(['name' => 'Rookie']);
        $user2 = User::factory()->create(['name' => 'Veteran']);

        RightCallProgress::create([
            'user_id'          => $user1->id,
            'high_score'       => 400,
            'successful_calls' => 3,
        ]);

        RightCallProgress::create([
            'user_id'          => $user2->id,
            'high_score'       => 1500,
            'successful_calls' => 15,
        ]);

        $response = $this->getJson('/api/games/right-call/leaderboard');

        $response->assertStatus(200);
        $data = $response->json();

        $this->assertCount(2, $data);
        $this->assertEquals($user2->id, $data[0]['user_id']); // Veteran ranked 1st
        $this->assertEquals($user1->id, $data[1]['user_id']); // Rookie ranked 2nd
    }
}
