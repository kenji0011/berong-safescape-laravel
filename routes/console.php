<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('test:verify-al', function (\App\Services\AdaptiveLearningService $service) {
    $tests = [
        [
            'id' => 'AL-01',
            'phase' => 'Module Quiz',
            'username' => 'test_al01',
            'inputs' => 'Age: 9, Grade: 3, Pre: 4/15',
            'expected' => 'Easy',
            'fn' => function ($u) use ($service) {
                return $service->getModuleDifficulty($u?->age ?? 9, 3, $u?->preTestScore ?? 4);
            }
        ],
        [
            'id' => 'AL-02',
            'phase' => 'Module Quiz',
            'username' => 'test_al02',
            'inputs' => 'Age: 14, Grade: 8, Pre: 8/15',
            'expected' => 'Medium',
            'fn' => function ($u) use ($service) {
                return $service->getModuleDifficulty($u?->age ?? 14, 8, $u?->preTestScore ?? 8);
            }
        ],
        [
            'id' => 'AL-03',
            'phase' => 'Module Quiz',
            'username' => 'test_al03',
            'inputs' => 'Age: 18, Grade: 12, Pre: 13/15',
            'expected' => 'Hard',
            'fn' => function ($u) use ($service) {
                return $service->getModuleDifficulty($u?->age ?? 18, 12, $u?->preTestScore ?? 13);
            }
        ],
        [
            'id' => 'AL-04',
            'phase' => 'Final Exam',
            'username' => 'test_al06',
            'inputs' => 'Pre: 14/15, Mod Avg: 5/5',
            'expected' => 'Hard',
            'fn' => function ($u) use ($service) {
                return $service->getFinalExamDifficulty($u?->age ?? 14, 8, $u?->preTestScore ?? 14, 5, 5, 5, 5);
            }
        ],
        [
            'id' => 'AL-05',
            'phase' => 'Final Exam',
            'username' => 'test_al07',
            'inputs' => 'Pre: 4/15, Mod Avg: 5/5',
            'expected' => 'Medium',
            'fn' => function ($u) use ($service) {
                return $service->getFinalExamDifficulty($u?->age ?? 10, 5, $u?->preTestScore ?? 4, 5, 5, 5, 5);
            }
        ],
        [
            'id' => 'AL-06',
            'phase' => 'Final Exam',
            'username' => 'test_al08',
            'inputs' => 'Pre: 14/15, Mod Avg: 1/5',
            'expected' => 'Easy',
            'fn' => function ($u) use ($service) {
                return $service->getFinalExamDifficulty($u?->age ?? 10, 5, $u?->preTestScore ?? 14, 1, 1, 1, 1);
            }
        ],
    ];

    $headers = ['Test ID', 'Phase', 'Account', 'Inputs', 'Expected', 'Observed', 'Match'];
    $rows = [];

    foreach ($tests as $t) {
        $user = null;
        try {
            $user = \App\Models\User::where('username', $t['username'])->first();
        } catch (\Throwable $e) {
            // Local DB not connected
        }
        $observed = $t['fn']($user);
        $match = ($observed === $t['expected']) ? 'YES' : 'NO';
        $rows[] = [
            $t['id'],
            $t['phase'],
            $t['username'] . ($user ? ' (Active)' : ''),
            $t['inputs'],
            $t['expected'],
            $observed,
            $match
        ];
    }

    $this->table($headers, $rows);
})->purpose('Verify Adaptive Learning difficulty classification test accounts');

Artisan::command('images:optimize-uploads {--max-width=1600} {--quality=80} {--dry-run} {--prune}', function (\App\Services\ImageOptimizationService $optimizer) {
    $maxWidth = max(320, (int) $this->option('max-width'));
    $quality = max(40, min(95, (int) $this->option('quality')));
    $dryRun = (bool) $this->option('dry-run');
    $prune = (bool) $this->option('prune');

    if (!$optimizer->supportsWebp()) {
        $this->error('PHP GD with WebP support is required to optimize uploads.');
        return 1;
    }

    $uploadsRoot = \Illuminate\Support\Facades\Storage::disk('public')->path('uploads');
    if (!is_dir($uploadsRoot)) {
        $this->info("No uploads directory found at {$uploadsRoot}. Nothing to optimize.");
        return 0;
    }

    $this->info(($dryRun ? '[DRY RUN] ' : '') . "Scanning {$uploadsRoot} (maxWidth={$maxWidth}px, quality={$quality}, prune=" . ($prune ? 'yes' : 'no') . ')...');

    $iterator = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($uploadsRoot, \FilesystemIterator::SKIP_DOTS)
    );

    $files = [];
    foreach ($iterator as $fileInfo) {
        if (!$fileInfo->isFile()) {
            continue;
        }
        $ext = strtolower($fileInfo->getExtension());
        if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
            $files[] = $fileInfo->getPathname();
        }
    }

    if (empty($files)) {
        $this->info('No JPEG/PNG/WebP uploads found.');
        return 0;
    }

    $publicRoot = rtrim(str_replace('\\', '/', \Illuminate\Support\Facades\Storage::disk('public')->path('')), '/');
    $rows = [];
    $totalBefore = 0;
    $totalAfter = 0;
    $optimizedCount = 0;
    $dbUpdates = 0;

    foreach ($files as $absolutePath) {
        $result = $optimizer->optimizeExistingFile($absolutePath, $maxWidth, $quality, $dryRun, $prune);
        $oldRel = ltrim(str_replace($publicRoot, '', str_replace('\\', '/', $result['old_path'])), '/');
        $newRel = ltrim(str_replace($publicRoot, '', str_replace('\\', '/', $result['new_path'])), '/');

        $totalBefore += $result['old_bytes'];
        $totalAfter += $result['new_bytes'];

        if ($result['status'] !== 'optimized') {
            continue;
        }

        $optimizedCount++;
        $updatedHere = 0;

        if ($result['converted'] && $oldRel !== $newRel && !$dryRun) {
            // Update CarouselImage URLs
            \App\Models\CarouselImage::where('imageUrl', 'like', '%' . $oldRel)->get()->each(function ($item) use ($oldRel, $newRel, &$updatedHere) {
                $item->imageUrl = str_replace($oldRel, $newRel, $item->imageUrl);
                $item->save();
                $updatedHere++;
            });

            // Update BlogPost cover image URLs
            \App\Models\BlogPost::where('imageUrl', 'like', '%' . $oldRel)->get()->each(function ($post) use ($oldRel, $newRel, &$updatedHere) {
                $post->imageUrl = str_replace($oldRel, $newRel, $post->imageUrl);
                $post->save();
                $updatedHere++;
            });

            // Update BlogPost embedded HTML content URLs if any
            \App\Models\BlogPost::where('content', 'like', '%' . $oldRel . '%')->get()->each(function ($post) use ($oldRel, $newRel, &$updatedHere) {
                $post->content = str_replace($oldRel, $newRel, $post->content);
                $post->save();
                $updatedHere++;
            });

            // Update User avatar URLs if any
            \App\Models\User::where('avatar', 'like', '%' . $oldRel)->get()->each(function ($user) use ($oldRel, $newRel, &$updatedHere) {
                $user->avatar = str_replace($oldRel, $newRel, $user->avatar);
                $user->save();
                $updatedHere++;
            });
        }

        $dbUpdates += $updatedHere;
        $savedPct = $result['old_bytes'] > 0
            ? round((1 - ($result['new_bytes'] / $result['old_bytes'])) * 100, 1) . '%'
            : '0%';

        $rows[] = [
            basename($oldRel) . ($result['converted'] ? ' -> ' . basename($newRel) : ''),
            round($result['old_bytes'] / 1024, 1) . ' KB',
            round($result['new_bytes'] / 1024, 1) . ' KB',
            '-' . $savedPct,
            $updatedHere,
        ];
    }

    if (!$dryRun && $optimizedCount > 0) {
        \Illuminate\Support\Facades\Cache::forget('carousel_images_active');
    }

    if (!empty($rows)) {
        $this->table(['File', 'Before', 'After', 'Saved', 'DB Rows'], $rows);
    }

    $savedMb = round(($totalBefore - $totalAfter) / 1048576, 2);
    $this->info("Scanned " . count($files) . " image(s). Optimized {$optimizedCount}, updated {$dbUpdates} DB reference(s), saved {$savedMb} MB.");
    if (!$prune && $optimizedCount > 0 && !$dryRun) {
        $this->comment('Original JPG/PNG files were kept on disk as zero-404 fallbacks. Pass --prune if you want to remove old originals later.');
    }

    return 0;
})->purpose('Resize and WebP-compress uploaded images in storage/app/public/uploads and update DB references');

