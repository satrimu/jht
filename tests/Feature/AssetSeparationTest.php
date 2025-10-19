<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('loads admin template for admin routes', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->get('/admin/dashboard');

    $response->assertStatus(200);
    // The admin template should be used (this checks via Inertia's component)
    $response->assertInertia(fn (Assert $page) => $page->component('admin/dashboard'));
});

it('loads site template for home route', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page->component('site/home'));
});

it('loads site template for dashboard route', function () {
    $user = User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page->component('dashboard'));
});

it('loads site template for auth routes', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page->component('auth/login'));
});

it('loads site template for settings routes', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/settings/profile');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page->component('settings/profile'));
});

it('middleware correctly determines admin root view', function () {
    $middleware = new \App\Http\Middleware\HandleInertiaRequests(app());
    $request = \Illuminate\Http\Request::create('/admin/users', 'GET');

    $rootView = $middleware->rootView($request);

    expect($rootView)->toBe('admin/app');
});

it('middleware correctly determines site root view for home', function () {
    $middleware = new \App\Http\Middleware\HandleInertiaRequests(app());
    $request = \Illuminate\Http\Request::create('/', 'GET');

    $rootView = $middleware->rootView($request);

    expect($rootView)->toBe('site/app');
});

it('middleware correctly determines site root view for dashboard', function () {
    $middleware = new \App\Http\Middleware\HandleInertiaRequests(app());
    $request = \Illuminate\Http\Request::create('/dashboard', 'GET');

    $rootView = $middleware->rootView($request);

    expect($rootView)->toBe('site/app');
});

it('middleware correctly determines site root view for auth', function () {
    $middleware = new \App\Http\Middleware\HandleInertiaRequests(app());
    $request = \Illuminate\Http\Request::create('/login', 'GET');

    $rootView = $middleware->rootView($request);

    expect($rootView)->toBe('site/app');
});
