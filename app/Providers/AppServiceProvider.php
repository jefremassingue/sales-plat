<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Registrar o alias do PDF
        $this->app->bind('PDF', function() {
            return new \Barryvdh\DomPDF\PDF;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
         URL::forceRootUrl(env('ASSET_URL'));
    }
}
