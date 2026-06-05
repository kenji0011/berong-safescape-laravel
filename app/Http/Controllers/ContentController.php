<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Video;
use App\Models\QuickQuestion;
use App\Models\CarouselImage;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    /**
     * GET /api/content/blogs
     */
    public function blogs(Request $request)
    {
        $query = BlogPost::with('author:id,name')
            ->orderBy('created_at', 'desc');

        if ($request->has('category')) {
            $query->where('category', $request->query('category'));
        }

        return response()->json($query->get());
    }

    /**
     * GET /api/content/blogs/{id}
     */
    public function showBlog(string $id)
    {
        $blog = BlogPost::with('author:id,name')->find($id);

        if (!$blog) {
            return response()->json(['error' => 'Blog not found'], 404);
        }

        return response()->json($blog);
    }

    /**
     * GET /api/content/videos
     */
    public function videos(Request $request)
    {
        $query = Video::orderBy('created_at', 'desc');

        if ($request->has('category')) {
            $query->where('category', $request->query('category'));
        }

        return response()->json($query->get());
    }

    /**
     * GET /api/content/questions (Quick Questions / FAQs)
     */
    public function questions()
    {
        $questions = QuickQuestion::where('isActive', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($questions);
    }

    /**
     * GET /api/content/carousel
     */
    public function carousel()
    {
        $images = CarouselImage::where('isActive', true)
            ->orderBy('order', 'asc')
            ->get();

        return response()->json($images);
    }

    /**
     * GET /api/content/manuals
     */
    public function manuals()
    {
        $manuals = \App\Models\FireCodeSection::orderBy('category')->orderBy('sectionNum')->orderBy('id')->get();
        return response()->json($manuals);
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
