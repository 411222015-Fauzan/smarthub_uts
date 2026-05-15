<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\EquipmentController;
use App\Http\Controllers\Web\RoomController;
use App\Http\Controllers\Web\BorrowingScheduleController;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/login', [AuthController::class, 'showLoginForm'])
    ->name('login');

Route::post('/login', [AuthController::class, 'login'])
    ->name('login.process');

Route::post('/logout', [AuthController::class, 'logout'])
    ->name('logout');

Route::middleware('auth')->group(function () {
    Route::resource('equipments', EquipmentController::class);
    Route::resource('rooms', RoomController::class);
    Route::resource('borrowing-schedules', BorrowingScheduleController::class);
});