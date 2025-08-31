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

        // Helpful debug if not 201:
        if ($res->response->getStatusCode() !== 201) {
            fwrite(STDERR, "\nRegister body: ".$res->response->getContent()."\n");
        }

        $res->seeStatusCode(201)
            ->seeJson(['message' => 'Registered'])
            ->seeJsonStructure([
                'message',
                'user' => ['id', 'name', 'email', 'created_at', 'updated_at']
            ]);
    }

    public function testUserCanLoginAndReceiveJwt()
    {
        // Arrange
        $reg = $this->post('/api/register', [
            'name' => 'Login User',
            'email' => 'login@example.com',
            'password' => 'secret123'
        ]);

        if ($reg->response->getStatusCode() !== 201) {
            fwrite(STDERR, "\nPre-login register body: ".$reg->response->getContent()."\n");
        }

        // Act
        $res = $this->post('/api/login', [
            'email' => 'login@example.com',
            'password' => 'secret123'
        ]);

        // Print body when 500 to see exact error
        if ($res->response->getStatusCode() !== 200) {
            fwrite(STDERR, "\nLogin body: ".$res->response->getContent()."\n");
        }

        // Assert (php-open-source-saver/jwt-auth usually returns access_token)
        $res->seeStatusCode(200)
            ->seeJsonStructure(['access_token', 'token_type', 'expires_in']);
    }
}
