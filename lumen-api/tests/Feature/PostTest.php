<?php

use Laravel\Lumen\Testing\DatabaseMigrations;

class PostTest extends TestCase
{
    use DatabaseMigrations;

    protected $token;

    public function setUp(): void
    {
        parent::setUp();

        $this->post('/api/register', [
            'name' => 'Poster',
            'email' => 'poster@example.com',
            'password' => 'secret123'
        ]);

        $login = $this->post('/api/login', [
            'email' => 'poster@example.com',
            'password' => 'secret123'
        ])->response->getContent();

        $data = json_decode($login, true);

        $this->token = $data['token']
            ?? $data['access_token']
            ?? $data['jwt']
            ?? null;

        $this->assertNotNull($this->token, 'Login response did not contain a token');
    }

    public function testCreatePost()
    {
        $res = $this->post('/api/posts', [
            'title' => 'Hello',
            'content' => 'World'
        ], ['Authorization' => "Bearer {$this->token}"]);

        $res->seeStatusCode(201)
            ->seeJsonStructure(['post' => ['id', 'title', 'content', 'user_id']]);
    }

    public function testFetchAllPosts()
    {
        $res = $this->get('/api/posts', ['Authorization' => "Bearer {$this->token}"]);
        $res->seeStatusCode(200);
    }
}
