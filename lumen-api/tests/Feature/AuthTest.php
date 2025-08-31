<?php

use Laravel\Lumen\Testing\DatabaseMigrations;

class AuthTest extends TestCase
{
    use DatabaseMigrations;

    public function testUserCanRegister()
    {
        $res = $this->post('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'secret123'
        ]);

        $res->seeStatusCode(201)
            ->seeJson(['message' => 'Registered'])
            ->seeJsonStructure([
                'message',
                'user' => ['id', 'name', 'email', 'created_at', 'updated_at']
            ]);
    }

    public function testUserCanLoginAndReceiveJwt()
    {
        $this->post('/api/register', [
            'name' => 'Login User',
            'email' => 'login@example.com',
            'password' => 'secret123'
        ]);

        $res = $this->post('/api/login', [
            'email' => 'login@example.com',
            'password' => 'secret123'
        ]);

        $res->seeStatusCode(200)
            ->seeJsonStructure(['access_token', 'token_type', 'expires_in']);
    }
}
