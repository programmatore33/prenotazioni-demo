<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoomController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

/*
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});
*/

Route::get('/', function () {
    return redirect(route('login'));
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {

    Route::get('/rooms-data/{amPm}/{date}', [DashboardController::class, 'getRoomsData'])->name('rooms.get-data');
    Route::get('/room-data/{room}', [RoomController::class, 'getRoomData'])->name('room.get-data');
    Route::get('/room-data/{room}/{start_date}/{end_date}/{reservation?}', [RoomController::class, 'getAlreadyReserved'])->name('room.check');
    Route::get('rooms/search', [App\Http\Controllers\RoomController::class, 'search'])->name('rooms.search');
    Route::resource('rooms', RoomController::class)->only('store', 'update', 'destroy');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    //Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('reservations/search', [App\Http\Controllers\ReservationController::class, 'search'])->name('reservations.search');
    Route::get('reservations/create/{room}', [App\Http\Controllers\ReservationController::class, 'create'])->name('reservations.create');
    Route::get('reservations/{reservation}/edit/{room}', [App\Http\Controllers\ReservationController::class, 'edit'])->name('reservations.edit');
    Route::resource('reservations', App\Http\Controllers\ReservationController::class)->except('create', 'edit');

    Route::get('patients', [App\Http\Controllers\PatientController::class, 'getPatients'])->name('patients.get');
    Route::delete('patients/{patient}', [App\Http\Controllers\PatientController::class, 'destroy'])->name('patients.destroy');
});

require __DIR__ . '/auth.php';
