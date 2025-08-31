<?php

/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$router->group(['prefix' => 'api'], function () use ($router) {
    $router->post('register', 'AuthController@register');
    $router->post('login',    'AuthController@login');

    // Protected routes
    $router->group(['middleware' => 'jwt.auth'], function () use ($router) {
        $router->get('posts',        'PostController@index');      // cached list
        $router->post('posts',       'PostController@store');      // write -> bust cache
        $router->get('posts/{id}',   'PostController@show');       // cached single
    });
});
