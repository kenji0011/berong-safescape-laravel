<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageOptimizationService
{
    /**
     * Optimize an uploaded image to resized WebP on the public disk.
     * Falls back safely to storing the original uploaded file if GD/WebP is unavailable
     * or if the file is a GIF (to preserve animation) or unsupported format.
     */
    public function optimizeUploadedFile(
        UploadedFile $file,
        string $directory = 'uploads',
        int $maxWidth = 1600,
        int $quality = 82
    ): string {
        $mime = strtolower((string) $file->getMimeType());

        // Preserve animated GIFs and fall back if GD WebP support is missing
        if ($mime === 'image/gif' || !$this->supportsWebp()) {
            return $file->store($directory, 'public');
        }

        $realPath = $file->getRealPath();
        if (!$realPath || !is_file($realPath)) {
            return $file->store($directory, 'public');
        }

        try {
            $webpBytes = $this->encodeToWebpBytes($realPath, $mime, $maxWidth, $quality);
            if ($webpBytes === null || strlen($webpBytes) === 0) {
                return $file->store($directory, 'public');
            }

            // If original is already WebP and smaller than our re-encode, store original directly
            $originalSize = @filesize($realPath) ?: 0;
            if ($mime === 'image/webp' && $originalSize > 0 && strlen($webpBytes) >= $originalSize) {
                return $file->store($directory, 'public');
            }

            $relativePath = trim($directory, '/') . '/' . Str::random(40) . '.webp';
            $stored = Storage::disk('public')->put($relativePath, $webpBytes);

            if (!$stored) {
                return $file->store($directory, 'public');
            }

            return $relativePath;
        } catch (\Throwable $e) {
            Log::warning('ImageOptimizationService fallback to raw store: ' . $e->getMessage());
            return $file->store($directory, 'public');
        }
    }

    /**
     * Optimize an existing image file on disk.
     *
     * For JPG/PNG: writes a sibling .webp file (leaves original untouched unless $pruneOriginal is true).
     * For WebP: atomically replaces the file only if the optimized output is at least 5% smaller.
     *
     * @return array{
     *   status: 'optimized'|'skipped',
     *   reason?: string,
     *   old_path: string,
     *   new_path: string,
     *   old_bytes: int,
     *   new_bytes: int,
     *   converted: bool
     * }
     */
    public function optimizeExistingFile(
        string $absolutePath,
        int $maxWidth = 1600,
        int $quality = 80,
        bool $dryRun = false,
        bool $pruneOriginal = false
    ): array {
        $oldBytes = @filesize($absolutePath) ?: 0;

        if (!$this->supportsWebp()) {
            return [
                'status' => 'skipped',
                'reason' => 'GD WebP support not available',
                'old_path' => $absolutePath,
                'new_path' => $absolutePath,
                'old_bytes' => $oldBytes,
                'new_bytes' => $oldBytes,
                'converted' => false,
            ];
        }

        $info = @getimagesize($absolutePath);
        if (!$info || empty($info['mime'])) {
            return [
                'status' => 'skipped',
                'reason' => 'Not a valid image',
                'old_path' => $absolutePath,
                'new_path' => $absolutePath,
                'old_bytes' => $oldBytes,
                'new_bytes' => $oldBytes,
                'converted' => false,
            ];
        }

        $mime = strtolower($info['mime']);
        if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
            return [
                'status' => 'skipped',
                'reason' => "Unsupported mime ({$mime})",
                'old_path' => $absolutePath,
                'new_path' => $absolutePath,
                'old_bytes' => $oldBytes,
                'new_bytes' => $oldBytes,
                'converted' => false,
            ];
        }

        $webpBytes = $this->encodeToWebpBytes($absolutePath, $mime, $maxWidth, $quality);
        if ($webpBytes === null || strlen($webpBytes) === 0) {
            return [
                'status' => 'skipped',
                'reason' => 'Failed to encode WebP',
                'old_path' => $absolutePath,
                'new_path' => $absolutePath,
                'old_bytes' => $oldBytes,
                'new_bytes' => $oldBytes,
                'converted' => false,
            ];
        }

        $newBytes = strlen($webpBytes);
        $isAlreadyWebp = ($mime === 'image/webp');

        // Require at least 5% savings to avoid needless re-encoding
        if ($oldBytes > 0 && $newBytes >= (int) ($oldBytes * 0.95)) {
            return [
                'status' => 'skipped',
                'reason' => 'Already optimal',
                'old_path' => $absolutePath,
                'new_path' => $absolutePath,
                'old_bytes' => $oldBytes,
                'new_bytes' => $oldBytes,
                'converted' => false,
            ];
        }

        $pathInfo = pathinfo($absolutePath);
        $targetPath = $isAlreadyWebp
            ? $absolutePath
            : ($pathInfo['dirname'] . DIRECTORY_SEPARATOR . $pathInfo['filename'] . '.webp');

        if (!$dryRun) {
            $tmpPath = $targetPath . '.opt-' . Str::random(8) . '.tmp';
            if (@file_put_contents($tmpPath, $webpBytes) === false) {
                @unlink($tmpPath);
                return [
                    'status' => 'skipped',
                    'reason' => 'Write failed',
                    'old_path' => $absolutePath,
                    'new_path' => $absolutePath,
                    'old_bytes' => $oldBytes,
                    'new_bytes' => $oldBytes,
                    'converted' => false,
                ];
            }

            // Verify written temp file is a valid WebP before moving into place
            $verify = @getimagesize($tmpPath);
            if (!$verify || ($verify['mime'] ?? '') !== 'image/webp') {
                @unlink($tmpPath);
                return [
                    'status' => 'skipped',
                    'reason' => 'Verification failed',
                    'old_path' => $absolutePath,
                    'new_path' => $absolutePath,
                    'old_bytes' => $oldBytes,
                    'new_bytes' => $oldBytes,
                    'converted' => false,
                ];
            }

            if (!@rename($tmpPath, $targetPath)) {
                @unlink($tmpPath);
                return [
                    'status' => 'skipped',
                    'reason' => 'Atomic rename failed',
                    'old_path' => $absolutePath,
                    'new_path' => $absolutePath,
                    'old_bytes' => $oldBytes,
                    'new_bytes' => $oldBytes,
                    'converted' => false,
                ];
            }

            if (!$isAlreadyWebp && $pruneOriginal && $targetPath !== $absolutePath) {
                @unlink($absolutePath);
            }
        }

        return [
            'status' => 'optimized',
            'old_path' => $absolutePath,
            'new_path' => $targetPath,
            'old_bytes' => $oldBytes,
            'new_bytes' => $newBytes,
            'converted' => !$isAlreadyWebp,
        ];
    }

    public function supportsWebp(): bool
    {
        return extension_loaded('gd') && function_exists('imagewebp');
    }

    protected function encodeToWebpBytes(string $path, string $mime, int $maxWidth, int $quality): ?string
    {
        $src = match ($mime) {
            'image/jpeg', 'image/jpg' => @imagecreatefromjpeg($path),
            'image/png' => @imagecreatefrompng($path),
            'image/webp' => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : false,
            default => false,
        };

        if (!$src) {
            return null;
        }

        try {
            // Respect EXIF camera orientation for JPEGs if exif extension is loaded
            if (($mime === 'image/jpeg' || $mime === 'image/jpg') && function_exists('exif_read_data')) {
                $exif = @exif_read_data($path);
                $orientation = (int) ($exif['Orientation'] ?? 1);
                $rotated = match ($orientation) {
                    3 => @imagerotate($src, 180, 0),
                    6 => @imagerotate($src, -90, 0),
                    8 => @imagerotate($src, 90, 0),
                    default => null,
                };
                if ($rotated) {
                    imagedestroy($src);
                    $src = $rotated;
                }
            }

            // GD's imagewebp requires true-color images (indexed/palette PNGs otherwise fail)
            if (!imageistruecolor($src) && function_exists('imagepalettetotruecolor')) {
                imagepalettetotruecolor($src);
            }
            imagealphablending($src, true);
            imagesavealpha($src, true);

            $origWidth = imagesx($src);
            $origHeight = imagesy($src);

            if ($origWidth <= 0 || $origHeight <= 0) {
                return null;
            }

            $target = $src;
            if ($origWidth > $maxWidth) {
                $newWidth = $maxWidth;
                $newHeight = max(1, (int) round($origHeight * ($maxWidth / $origWidth)));
                $dst = imagecreatetruecolor($newWidth, $newHeight);
                if (!$dst) {
                    return null;
                }
                imagealphablending($dst, false);
                imagesavealpha($dst, true);
                $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
                imagefilledrectangle($dst, 0, 0, $newWidth, $newHeight, $transparent);
                imagecopyresampled($dst, $src, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);
                imagedestroy($src);
                $src = null;
                $target = $dst;
            }

            ob_start();
            $ok = @imagewebp($target, null, max(1, min(100, $quality)));
            $bytes = ob_get_clean();

            if ($target !== $src) {
                imagedestroy($target);
            }

            return ($ok && is_string($bytes) && strlen($bytes) > 0) ? $bytes : null;
        } finally {
            if ($src) {
                @imagedestroy($src);
            }
        }
    }
}
