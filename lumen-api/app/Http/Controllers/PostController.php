<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Predis\Client as Predis;

class PostController extends Controller
{
    private Predis $redis;
    private string $LIST_KEY = 'posts:all';
    private string $ITEM_KEY_PREFIX = 'posts:id:';
    private int $TTL = 300;

    public function __construct()
    {
        $this->redis = new Predis([
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'port' => (int) env('REDIS_PORT', 6379),
            'password' => env('REDIS_PASSWORD') ?: null,
        ]);
    }

    public function index()
    {
        if ($cached = $this->redis->get($this->LIST_KEY)) {
            return response($cached, 200, ['Content-Type' => 'application/json']);
        }

        $posts = \App\Models\Post::with('user')->latest()->get();
        $json  = $posts->toJson();

        $this->redis->setex($this->LIST_KEY, $this->TTL, $json);
        return response()->json($posts);
    }

    public function show($id)
    {
        $key = $this->ITEM_KEY_PREFIX.$id;

        if ($cached = $this->redis->get($key)) {
            return response($cached, 200, ['Content-Type' => 'application/json']);
        }

        $post = \App\Models\Post::findOrFail($id);
        $json = $post->toJson();

        $this->redis->setex($key, $this->TTL, $json);
        return response()->json($post);
    }

    public function store(Request $req)
    {
        $this->validate($req, [
            'title'   => 'required|string',
            'content' => 'required|string',
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $post = \App\Models\Post::create($req->only('title','content','user_id'));

        // Invalidate caches
        $this->redis->del($this->LIST_KEY);
        $this->redis->del($this->ITEM_KEY_PREFIX.$post->id);

        return response()->json($post, 201);
    }
}
