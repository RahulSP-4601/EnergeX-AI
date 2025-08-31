<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    // GET /api/posts  (cache list)
    public function index()
    {
        $redis = app('redis');
        $key   = 'posts:all';
        $ttl   = (int) env('CACHE_TTL', 60);

        if ($cached = $redis->get($key)) {
            $data = json_decode($cached, true);
            return response()->json($data, 200, ['X-Cache' => 'HIT']);
        }

        $posts = Post::with('user:id,name,email')
            ->orderByDesc('id')
            ->get()
            ->toArray();

        $redis->setex($key, $ttl, json_encode($posts));
        return response()->json($posts, 200, ['X-Cache' => 'MISS']);
    }

    // GET /api/posts/{id}  (cache single)
    public function show($id)
    {
        $redis = app('redis');
        $key   = "posts:$id";
        $ttl   = (int) env('CACHE_TTL', 60);

        if ($cached = $redis->get($key)) {
            $data = json_decode($cached, true);
            return response()->json($data, 200, ['X-Cache' => 'HIT']);
        }

        $post = Post::with('user:id,name,email')->find($id);
        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        $payload = $post->toArray();
        $redis->setex($key, $ttl, json_encode($payload));

        return response()->json($payload, 200, ['X-Cache' => 'MISS']);
    }

    // POST /api/posts  (invalidate list cache; optionally seed single-key)
    public function store(Request $req)
    {
        $this->validate($req, [
            'title'   => 'required|string',
            'content' => 'required|string',
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $post = Post::create([
            'title'   => $req->title,
            'content' => $req->content,
            'user_id' => $req->user_id,
        ]);

        // Invalidate caches
        $redis = app('redis');
        $redis->del('posts:all');              // list cache
        $redis->del("posts:{$post->id}");      // single cache (ensure fresh next read)

        return response()->json(['message' => 'Created', 'post' => $post], 201);
    }
}
