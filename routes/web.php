<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/login', function () {
    return Inertia::render('Login');
})->name('login');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

Route::get('/equipments', function () {
    return Inertia::render('Equipments');
})->name('equipments');

Route::get('/rooms', function () {
    return Inertia::render('Rooms');
})->name('rooms');

Route::get('/members', function () {
    return Inertia::render('Members');
})->name('members');

Route::get('/schedules', function () {
    return Inertia::render('Schedules');
})->name('schedules');

Route::get('/check-ins', function () {
    return Inertia::render('CheckIns');
})->name('check-ins');