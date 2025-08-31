<?php

/** @var \Laravel\Lumen\Routing\Router $router */

$router->group(['prefix' => 'api'], function () use ($router) {
    // Public auth routes
    $router->post('register', 'AuthController@register');
    $router->post('login',    'AuthController@login');

    // Public post routes (cached reads)
    $router->get('posts',      'PostController@index');   // cached list
    $router->get('posts/{id}', 'PostController@show');    // cached single

    // Protected post routes (writes require JWT)
    $router->group(['middleware' => 'jwt.auth'], function () use ($router) {
        $router->post('posts', 'PostController@store');   // create -> bust cache
    });

    $router->options('/{any:.*}', function () {
        return response('', 204);
    });
});
