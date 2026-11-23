<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\CarouselImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageOptimizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_image_upload_resizes_and_converts_to_webp(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create([
            'role' => 'admin',
            'isActive' => true,
        ]);

        // Create an oversized 2400x1200 PNG to verify resizing and WebP conversion
        $file = UploadedFile::fake()->image('hero-banner.png', 2400, 1200);

        $response = $this->actingAs($admin)->post('/api/admin/upload', [
            'file' => $file,
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $url = $response->json('url');
        $this->assertIsString($url);
        $this->assertStringEndsWith('.webp', $url);

        $relativePath = ltrim(parse_url($url, PHP_URL_PATH), '/');
        $diskPath = preg_replace('#^storage/#', '', $relativePath);

        Storage::disk('public')->assertExists($diskPath);

        $info = getimagesize(Storage::disk('public')->path($diskPath));
        $this->assertIsArray($info);
        $this->assertSame('image/webp', $info['mime']);
        $this->assertLessThanOrEqual(1600, $info[0]);
        $this->assertSame(800, $info[1]); // Preserves 2:1 aspect ratio
    }

    public function test_admin_gif_upload_preserves_original_format(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create([
            'role' => 'admin',
            'isActive' => true,
        ]);

        $gifBytes = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        $file = UploadedFile::fake()->createWithContent('anim.gif', $gifBytes);

        $response = $this->actingAs($admin)->post('/api/admin/upload', [
            'file' => $file,
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $url = $response->json('url');
        $this->assertStringEndsWith('.gif', $url);
    }

    public function test_optimize_uploads_command_converts_files_and_updates_db_without_breaking_originals(): void
    {
        Storage::fake('public');

        // Build a large noisy PNG on the fake public disk (guaranteed to compress smaller as WebP)
        $uploadsDir = Storage::disk('public')->path('uploads');
        if (!is_dir($uploadsDir)) {
            mkdir($uploadsDir, 0755, true);
        }
        $pngPath = $uploadsDir . DIRECTORY_SEPARATOR . 'legacy-slide.png';
        $im = imagecreatetruecolor(2200, 1100);
        for ($y = 0; $y < 1100; $y += 10) {
            $color = imagecolorallocate($im, ($y * 3) % 255, ($y * 7) % 255, 180);
            imagefilledrectangle($im, 0, $y, 2200, $y + 10, $color);
        }
        imagepng($im, $pngPath, 1);
        imagedestroy($im);

        $author = User::factory()->create(['role' => 'admin', 'isActive' => true]);

        $slide = CarouselImage::create([
            'title' => 'Hero Slide',
            'altText' => 'Alt text',
            'imageUrl' => 'https://bfpscberong.app/storage/uploads/legacy-slide.png',
            'order' => 1,
            'isActive' => true,
        ]);

        $blog = BlogPost::create([
            'title' => 'Fire Safety Guide',
            'excerpt' => 'Short summary',
            'content' => '<p>See <img src="https://bfpscberong.app/storage/uploads/legacy-slide.png" /></p>',
            'imageUrl' => 'https://bfpscberong.app/storage/uploads/legacy-slide.png',
            'category' => 'adult',
            'authorId' => $author->id,
            'isPublished' => true,
        ]);

        Cache::put('carousel_images_active', ['stale'], now()->addHour());

        $this->artisan('images:optimize-uploads')
            ->assertExitCode(0);

        // New WebP exists, original PNG is kept by default as a zero-404 fallback
        Storage::disk('public')->assertExists('uploads/legacy-slide.webp');
        Storage::disk('public')->assertExists('uploads/legacy-slide.png');

        $slide->refresh();
        $blog->refresh();

        $this->assertSame('https://bfpscberong.app/storage/uploads/legacy-slide.webp', $slide->imageUrl);
        $this->assertSame('https://bfpscberong.app/storage/uploads/legacy-slide.webp', $blog->imageUrl);
        $this->assertStringContainsString('uploads/legacy-slide.webp', $blog->content);
        $this->assertFalse(Cache::has('carousel_images_active'));
    }

    public function test_welcome_page_emits_server_side_lcp_preload_for_first_carousel_slide(): void
    {
        Cache::forget('carousel_images_active');

        CarouselImage::create([
            'title' => 'First Slide',
            'altText' => 'First Alt',
            'imageUrl' => 'https://bfpscberong.app/storage/uploads/slide-one.webp',
            'order' => 1,
            'isActive' => true,
        ]);

        CarouselImage::create([
            'title' => 'Second Slide',
            'altText' => 'Second Alt',
            'imageUrl' => 'https://bfpscberong.app/storage/uploads/slide-two.webp',
            'order' => 2,
            'isActive' => true,
        ]);

        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertSee(
            '<link rel="preload" as="image" href="https://bfpscberong.app/storage/uploads/slide-one.webp" fetchpriority="high">',
            false
        );
        $response->assertDontSee(
            '<link rel="preload" as="image" href="https://bfpscberong.app/storage/uploads/slide-two.webp"',
            false
        );
        $response->assertSee('media="print" onload="this.media=\'all\'"', false);
    }
}
