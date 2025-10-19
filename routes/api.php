<?php

use App\Http\Controllers\Admin\ApiTokenController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', fn(Request $request) => $request->user());

// Admin-only API token management routes
// Route::middleware(['auth:sanctum', 'can:admin'])->group(function () {
//     Route::get('/admin/tokens', [ApiTokenController::class, 'index'])->name('api.admin.tokens.index');
//     Route::post('/admin/tokens', [ApiTokenController::class, 'store'])->name('api.admin.tokens.store');
//     Route::delete('/admin/tokens/{token}', [ApiTokenController::class, 'destroy'])->name('api.admin.tokens.destroy');
// });
