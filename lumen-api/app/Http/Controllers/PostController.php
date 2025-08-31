<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PostController extends Controller
{
    // GET /api/posts  (cached)
    public function index()
    {
        $cacheKey = 'posts.index';
        $ttl = (int) env('CACHE_TTL', 300); // seconds

        $wasHit = Cache::has($cacheKey);
        $posts = Cache::remember($cacheKey, $ttl, function () {
            return Post::orderBy('id', 'desc')->get();
        });

        return response()->json($posts)
            ->header('X-Cache', $wasHit ? 'HIT' : 'MISS');
    }

    // GET /api/posts/{id}  (cached)
    public function show($id)
    {
        $cacheKey = "posts.show.$id";
        $ttl = (int) env('CACHE_TTL', 300);

        $wasHit = Cache::has($cacheKey);
        $post = Cache::remember($cacheKey, $ttl, function () use ($id) {
            return Post::find($id);
        });

        if (!$post) {
            // Avoid caching null for long TTLs
            Cache::forget($cacheKey);
            return response()->json(['error' => 'Post not found'], 404)
                ->header('X-Cache', $wasHit ? 'HIT' : 'MISS');
        }

        return response()->json($post)
            ->header('X-Cache', $wasHit ? 'HIT' : 'MISS');
    }

    // POST /api/posts  (invalidates caches)
    public function store(Request $req)
    {
        $this->validate($req, [
            'title'   => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        // jwt.auth middleware attaches the authenticated user
        $user = $req->user();

        $post = Post::create([
            'title'   => $req->input('title'),
            'content' => $req->input('content'),
            'user_id' => $user->id,
        ]);

        // Bust caches
        Cache::forget('posts.index');
        Cache::forget("posts.show.{$post->id}");

        return response()->json(['message' => 'Created', 'post' => $post], 201);
    }
}
