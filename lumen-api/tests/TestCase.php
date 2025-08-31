<?php

use Laravel\Lumen\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Creates the application.
     *
     * @return \Laravel\Lumen\Application
     */
    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';

        // Safety guard: never run tests against the dev/prod DB
        $db = env('DB_DATABASE', '');
        if (!str_ends_with($db, '_test')) {
            throw new RuntimeException(
                "Refusing to run tests on non-test DB '{$db}'. ".
                "Point tests to a DB ending with _test (see .env.testing)."
            );
        }

        return $app;
    }
}
