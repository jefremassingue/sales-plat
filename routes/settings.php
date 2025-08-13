<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SettingsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    // System Settings CRUD
    Route::get('settings/system', [SettingsController::class, 'index'])->name('settings.system');
    Route::post('settings/system', [SettingsController::class, 'store'])->name('settings.store');
    Route::put('settings/system/{setting}', [SettingsController::class, 'update'])->name('settings.update');
    Route::delete('settings/system/{setting}', [SettingsController::class, 'destroy'])->name('settings.destroy');
    Route::get('settings/group/{group}', [SettingsController::class, 'getByGroup'])->name('settings.group');
});
