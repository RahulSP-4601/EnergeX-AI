<?php

require_once __DIR__ . '/../vendor/autoload.php';

(new Laravel\Lumen\Bootstrap\LoadEnvironmentVariables(
    dirname(__DIR__)
))->bootstrap();

date_default_timezone_set(env('APP_TIMEZONE', 'UTC'));

/*
|--------------------------------------------------------------------------
| Create The Application
|--------------------------------------------------------------------------
*/
$app = new Laravel\Lumen\Application(
    dirname(__DIR__)
);

/*
|--------------------------------------------------------------------------
| Tell Lumen where your config files live
|--------------------------------------------------------------------------
| You’ve placed config files under app/config, so set the config path.
*/
$app->instance('path.config', $app->basePath('app/config'));

/*
|--------------------------------------------------------------------------
| Enable Facades & Eloquent
|--------------------------------------------------------------------------
*/
$app->withFacades();
$app->withEloquent();

/*
|--------------------------------------------------------------------------
| Register Config Files
|--------------------------------------------------------------------------
*/
$app->configure('app');
$app->configure('database');
$app->configure('auth');
$app->configure('cache');
$app->configure('jwt');

/*
|--------------------------------------------------------------------------
| Register Container Bindings
|--------------------------------------------------------------------------
*/
$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);

$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);

/*
|--------------------------------------------------------------------------
| Predis client binding (so you can use app('redis'))
|--------------------------------------------------------------------------
*/
$app->singleton('redis', function () {
    $params = [
        'scheme'   => 'tcp',
        'host'     => env('REDIS_HOST', '127.0.0.1'),
        'port'     => (int) env('REDIS_PORT', 6379),
        'password' => env('REDIS_PASSWORD') ?: null,
        // If you plan to use a database index, uncomment next line:
        // 'database' => (int) env('REDIS_DB', 0),
    ];
    return new Predis\Client($params);
});

/*
|--------------------------------------------------------------------------
| Register Middleware
|--------------------------------------------------------------------------
*/
// $app->middleware([
//     // Add global middleware (e.g., CORS) here if needed
// ]);

$app->routeMiddleware([
    'auth'        => App\Http\Middleware\Authenticate::class,
    'jwt.auth'    => PHPOpenSourceSaver\JWTAuth\Http\Middleware\Authenticate::class,
    'jwt.refresh' => PHPOpenSourceSaver\JWTAuth\Http\Middleware\RefreshToken::class,
]);

/*
|--------------------------------------------------------------------------
| Register Service Providers
|--------------------------------------------------------------------------
*/
// Do NOT register Illuminate\Redis\RedisServiceProvider here (version mismatch on PHP 8.4).
$app->register(PHPOpenSourceSaver\JWTAuth\Providers\LumenServiceProvider::class);

/*
|--------------------------------------------------------------------------
| Facade Aliases (for convenience)
|--------------------------------------------------------------------------
*/
class_alias(PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth::class, 'JWTAuth');
class_alias(PHPOpenSourceSaver\JWTAuth\Facades\JWTFactory::class, 'JWTFactory');

// Optional providers if you create them:
// $app->register(App\Providers\AppServiceProvider::class);
// $app->register(App\Providers\AuthServiceProvider::class);
// $app->register(App\Providers\EventServiceProvider::class);

/*
|--------------------------------------------------------------------------
| Load The Application Routes
|--------------------------------------------------------------------------
*/
$app->router->group([
    'namespace' => 'App\Http\Controllers',
], function ($router) {
    require __DIR__ . '/../routes/web.php';
});

return $app;
