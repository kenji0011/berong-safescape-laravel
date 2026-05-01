<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\FloorPlan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class SecurityEnhancementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Clear rate limiters before each test
        RateLimiter::clear('auth:'.request()->ip());
        RateLimiter::clear('ai:'.request()->ip());
        RateLimiter::clear('api:'.request()->ip());
    }

    public function test_auth_rate_limiting_prevents_brute_force_registration()
    {
        // The throttle:auth limit is 5 per minute
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/auth/register', [
                'name' => 'Test User',
                'username' => "testuser{$i}",
                'email' => "test{$i}@example.com",
                'password' => 'ValidP@ssw0rd123!',
                'password_confirmation' => 'ValidP@ssw0rd123!'
            ]);
            // Depending on validation, might be 422 or 201, but NOT 429 yet
            $this->assertNotEquals(429, $response->status());
        }

        // 6th attempt should be blocked
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Hacker',
            'username' => "hacker",
            'email' => "hacker@example.com",
            'password' => 'ValidP@ssw0rd123!',
            'password_confirmation' => 'ValidP@ssw0rd123!'
        ]);

        $response->assertStatus(429);
    }

    public function test_weak_passwords_are_rejected_by_new_policy()
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'username' => 'testuserweak',
            'email' => 'testweak@gmail.com', // use a real domain because of email:dns rule
            'firstName' => 'Test',
            'lastName' => 'User',
            'age' => 20,
            'gender' => 'Male',
            'barangay' => 'Oogong',
            'password' => 'weakpass', // No uppercase, numbers, or symbols
            'password_confirmation' => 'weakpass'
        ]);

        $response->assertStatus(422);
        // AuthApiController returns a flat 'error' string, not the standard Laravel validation array
        $this->assertArrayHasKey('error', $response->json());
        $this->assertStringContainsString('The password field must contain at least one uppercase', $response->json('error'));
    }

    public function test_xss_payloads_are_sanitized_in_feedback()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/feedback', [
            'featureName' => '<script>alert("XSS")</script>Module1',
            'featureType' => 'module',
            'rating' => 5,
            'comments' => '<iframe src="malicious.com"></iframe>Great module!',
            'sessionId' => '12345'
        ]);

        $response->assertStatus(201);
        // strip_tags removes the HTML tags but leaves the inner text
        $this->assertEquals('alert("XSS")Module1', $response->json('feedback.featureName'));
        $this->assertEquals('Great module!', $response->json('feedback.comments'));
    }

    public function test_idor_protection_on_floor_plans()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $floorPlan = FloorPlan::create([
            'userId' => $user1->id,
            'name' => 'My Secret Plan',
            'gridData' => '[]',
            'uploaderName' => 'User One',
        ]);

        // User 1 should be able to access it
        $response1 = $this->actingAs($user1, 'sanctum')->getJson('/api/floor-plans/' . $floorPlan->id);
        $response1->assertStatus(200);

        // User 2 should NOT be able to access User 1's plan
        $response2 = $this->actingAs($user2, 'sanctum')->getJson('/api/floor-plans/' . $floorPlan->id);
        $response2->assertStatus(404); // firstOrFail throws 404
    }
}
