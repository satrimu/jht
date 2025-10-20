<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Payment;
use App\Models\SettingApp;
use App\Models\User;
use App\Observers\GlobalActivityLogger;
use App\Observers\SettingAppObserver;
use App\Policies\CategoryPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\UserPolicy;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use App\Repositories\Contracts\ReportRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Eloquent\CategoryRepository;
use App\Repositories\Eloquent\PaymentRepository;
use App\Repositories\Eloquent\ReportRepository;
use App\Repositories\Eloquent\UserRepository;
use App\Services\ImageService;
use App\Services\SecurityLogService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind SecurityLogService as singleton
        $this->app->singleton(SecurityLogService::class, fn ($app): SecurityLogService => new SecurityLogService);

        // Bind ImageService as singleton
        $this->app->singleton(ImageService::class);

        // Bind CategoryRepository interface
        $this->app->bind(
            CategoryRepositoryInterface::class,
            CategoryRepository::class
        );

        // Bind PaymentRepository interface
        $this->app->bind(
            PaymentRepositoryInterface::class,
            PaymentRepository::class
        );

        // Bind ReportRepository interface
        $this->app->bind(
            ReportRepositoryInterface::class,
            ReportRepository::class
        );

        // Bind UserRepository interface
        $this->app->bind(
            UserRepositoryInterface::class,
            UserRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS in production
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        Gate::define('admin', fn ($user): bool => auth()->check() && auth()->user()->role === 'admin');

        // Register Category Policy
        Gate::policy(Category::class, CategoryPolicy::class);

        // Register Payment Policy
        Gate::policy(Payment::class, PaymentPolicy::class);

        // Register User Policy
        Gate::policy(User::class, UserPolicy::class);

        // Share application settings globally with Inertia
        Inertia::share('setting', function (): array {
            $setting = SettingApp::first();

            return [
                'nama_app' => $setting?->nama_app,
                'description' => $setting?->description,
                'address' => $setting?->address,
                'email' => $setting?->email,
                'phone' => $setting?->phone,
                'facebook' => $setting?->facebook,
                'instagram' => $setting?->instagram,
                'tiktok' => $setting?->tiktok,
                'youtube' => $setting?->youtube,
                'image' => $setting?->image,
            ];
        });

        // SettingApp Observers
        SettingApp::observe(GlobalActivityLogger::class);
        SettingApp::observe(SettingAppObserver::class);

    }
}
