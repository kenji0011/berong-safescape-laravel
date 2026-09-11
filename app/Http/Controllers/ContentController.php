<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Video;
use App\Models\QuickQuestion;
use App\Models\CarouselImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ContentController extends Controller
{
    /**
     * GET /api/content/blogs
     */
    public function blogs(Request $request)
    {
        try {
            $query = BlogPost::with('author:id,name')
                ->orderBy('order', 'asc')
                ->orderBy('created_at', 'desc');

            if ($request->has('category')) {
                $query->where('category', $request->query('category'));
            }

            $limit = min((int)$request->query('limit', 50), 100);

            return response()->json($query->limit($limit)->get());
        } catch (\Throwable $e) {
            Log::error('ContentController@blogs failed: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'Failed to retrieve blogs.'], 500);
        }
    }

    /**
     * GET /api/content/blogs/{id}
     */
    public function showBlog(string $id)
    {
        try {
            $blog = BlogPost::with('author:id,name')->find($id);

            if (!$blog) {
                return response()->json(['error' => 'Blog not found'], 404);
            }

            return response()->json($blog);
        } catch (\Throwable $e) {
            Log::error('ContentController@showBlog failed: ' . $e->getMessage(), ['id' => $id, 'exception' => $e]);
            return response()->json(['error' => 'Failed to retrieve blog.'], 500);
        }
    }

    /**
     * GET /api/content/videos
     */
    public function videos(Request $request)
    {
        try {
            $query = Video::orderBy('order', 'asc')->orderBy('created_at', 'desc');

            if ($request->has('category')) {
                $query->where('category', $request->query('category'));
            }

            $limit = min((int)$request->query('limit', 50), 100);

            return response()->json($query->limit($limit)->get());
        } catch (\Throwable $e) {
            Log::error('ContentController@videos failed: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'Failed to retrieve videos.'], 500);
        }
    }

    /**
     * GET /api/content/questions (Quick Questions / FAQs)
     */
    public function questions()
    {
        try {
            $questions = QuickQuestion::where('isActive', true)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($questions);
        } catch (\Throwable $e) {
            Log::error('ContentController@questions failed: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'Failed to retrieve quick questions.'], 500);
        }
    }

    /**
     * GET /api/content/carousel
     */
    public function carousel()
    {
        try {
            $images = CarouselImage::where('isActive', true)
                ->orderBy('order', 'asc')
                ->get();

            return response()->json($images);
        } catch (\Throwable $e) {
            Log::error('ContentController@carousel failed: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'Failed to retrieve carousel images.'], 500);
        }
    }

    /**
     * GET /api/content/manuals
     */
    public function manuals()
    {
        try {
            $manuals = \App\Models\FireCodeSection::orderBy('category')->orderBy('sectionNum')->orderBy('id')->get();
            return response()->json($manuals);
        } catch (\Throwable $e) {
            Log::error('ContentController@manuals failed: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'Failed to retrieve fire code manuals.'], 500);
        }
    }

    /**
     * Default resource methods for admin CRUD
     */
    public function index() { return $this->blogs(request()); }
    public function store(Request $request) { /* admin blog creation */ }
    public function show(string $id) { return $this->showBlog($id); }
    public function update(Request $request, string $id) { /* admin update */ }
    public function destroy(string $id) { /* admin delete */ }
}
