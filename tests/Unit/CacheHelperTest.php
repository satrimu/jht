<?php

use App\Services\CacheService;

test('cache_service helper function exists', function () {
    expect(function_exists('cache_service'))->toBeTrue();
});

test('cache_service helper returns CacheService instance', function () {
    $cacheService = cache_service();

    expect($cacheService)->toBeInstanceOf(CacheService::class);
});

test('cache_service provides access to supportsTags method', function () {
    $cacheService = cache_service();

    expect(method_exists($cacheService, 'supportsTags'))->toBeTrue();
    expect($cacheService->supportsTags())->toBeBool();
});

test('cache_service provides access to usersListKey method', function () {
    $cacheService = cache_service();

    expect(method_exists($cacheService, 'usersListKey'))->toBeTrue();

    $key = $cacheService->usersListKey(1, 15);
    expect($key)->toBe('users_list_page_1_per_15');
});

test('cache_service provides access to rememberUsersList method', function () {
    $cacheService = cache_service();

    expect(method_exists($cacheService, 'rememberUsersList'))->toBeTrue();
});

test('cache_service provides access to clearUsersList method', function () {
    $cacheService = cache_service();

    expect(method_exists($cacheService, 'clearUsersList'))->toBeTrue();
});
