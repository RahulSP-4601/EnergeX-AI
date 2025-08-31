<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct()
    {
        // Protect everything except register & login with JWT middleware
        $this->middleware('jwt.auth', ['except' => ['register', 'login']]);
    }

    public function register(Request $req)
    {
        $this->validate($req, [
            'name'     => 'required|string',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:6',
        ]);

        $user = User::create([
            'name'     => $req->name,
            'email'    => $req->email,
            'password' => Hash::make($req->password),
        ]);

        return response()->json(['message' => 'Registered', 'user' => $user], 201);
    }

    public function login(Request $req)
    {
        $this->validate($req, [
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $credentials = $req->only('email', 'password');

        // Use the JWT guard configured in config/auth.php
        if (! $token = auth('api')->attempt($credentials)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        return $this->respondWithToken($token);
    }

    public function me()
    {
        return response()->json(auth('api')->user());
    }

    public function logout()
    {
        auth('api')->logout();
        return response()->json(['message' => 'Logged out']);
    }

    public function refresh()
    {
        return $this->respondWithToken(auth('api')->refresh());
    }

    protected function respondWithToken(string $token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => auth('api')->factory()->getTTL() * 60, // seconds
        ]);
    }
}
