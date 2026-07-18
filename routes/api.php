<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EquipmentApiController;
use App\Http\Controllers\Api\ScheduleApiController;
use App\Http\Controllers\Api\CheckInApiController;

use App\Http\Controllers\Api\RoomApiController;
use App\Http\Controllers\Api\MemberApiController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('equipments', EquipmentApiController::class);
    Route::apiResource('rooms', RoomApiController::class);
    Route::apiResource('members', MemberApiController::class);

    Route::get('/schedules', [ScheduleApiController::class, 'index']);
    Route::post('/schedules', [ScheduleApiController::class, 'store']);
    Route::get('/schedules/{borrowingSchedule}', [ScheduleApiController::class, 'show']);
    Route::put('/schedules/{schedule}', [ScheduleApiController::class, 'update']);
    Route::delete('/schedules/{schedule}', [ScheduleApiController::class, 'destroy']);

    Route::post('/check-ins', [CheckInApiController::class, 'store']);
    Route::put('/check-ins/{checkIn}/checkout', [CheckInApiController::class, 'checkout']);
    Route::get('/check-ins/history', [CheckInApiController::class, 'history']);
});