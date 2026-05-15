<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EquipmentApiController;
use App\Http\Controllers\Api\ScheduleApiController;
use App\Http\Controllers\Api\CheckInApiController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/equipments', [EquipmentApiController::class, 'index']);
    Route::get('/equipments/{equipment}', [EquipmentApiController::class, 'show']);

    Route::get('/schedules', [ScheduleApiController::class, 'index']);
    Route::post('/schedules', [ScheduleApiController::class, 'store']);
    Route::get('/schedules/{borrowingSchedule}', [ScheduleApiController::class, 'show']);

    Route::post('/check-ins', [CheckInApiController::class, 'store']);
    Route::put('/check-ins/{checkIn}/checkout', [CheckInApiController::class, 'checkout']);
    Route::get('/check-ins/history', [CheckInApiController::class, 'history']);
});