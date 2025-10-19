<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    /**
     * Set up the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Ensure migrations are run for the in-memory sqlite database used in tests.
        // Some CI environments or custom bootstraps may not run migrations automatically,
        // so run them here to guarantee tables exist for factories.
        $this->artisan('migrate', ['--force' => true]);
    }
}
