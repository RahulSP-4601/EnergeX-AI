<?php

use Laravel\Lumen\Testing\DatabaseMigrations;

class PostTest extends TestCase
{
    use DatabaseMigrations;

    protected $token;

    public function setUp(): void
    {
        parent::setUp();

        $reg = $this->post('/api/register', [
            'name' => 'Poster',
            'email' => 'poster@example.com',
            'password' => 'secret123'
        ]);

        if ($reg->response->getStatusCode() !== 201) {
            fwrite(STDERR, "\nPostTest register body: ".$reg->response->getContent()."\n");
        }

        $loginRes = $this->post('/api/login', [
            'email' => 'poster@example.com',
            'password' => 'secret123'
        ]);

        if ($loginRes->response->getStatusCode() !== 200) {
            fwrite(STDERR, "\nPostTest login body: ".$loginRes->response->getContent()."\n");
        }

        $body = json_decode($loginRes->response->getContent(), true) ?: [];
        $this->token = $body['token']          // some implementations
            ?? $body['access_token']           // jwt-auth default
            ?? $body['jwt']
            ?? null;

        $this->assertNotNull($this->token, 'Login response did not contain a token');
    }

    public function testCreatePost()
    {
        $res = $this->post('/api/posts', [
            'title' => 'Hello',
            'content' => 'World'
        ], ['Authorization' => "Bearer {$this->token}"]);

        if ($res->response->getStatusCode() !== 201) {
            fwrite(STDERR, "\nCreate post body: ".$res->response->getContent()."\n");
        }

        $res->seeStatusCode(201)
            ->seeJsonStructure(['post' => ['id', 'title', 'content', 'user_id']]);
    }

    public function testFetchAllPosts()
    {
        $res = $this->get('/api/posts', ['Authorization' => "Bearer {$this->token}"]);
        if ($res->response->getStatusCode() !== 200) {
            fwrite(STDERR, "\nFetch all posts body: ".$res->response->getContent()."\n");
        }
        $res->seeStatusCode(200);
    }
}
