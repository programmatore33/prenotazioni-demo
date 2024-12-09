<?php

namespace App\Http\Controllers;

use App\Models\ExamTypologies;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): InertiaResponse
    {
        return Inertia::render(
            'Dashboard',
            [
                'typologies' => ExamTypologies::all(),
            ]
        );
    }

    public function getRoomsData(Request $request): JsonResponse
    {
        $date = Carbon::createFromLocaleFormat('j F Y', 'it', $request->date)->format('Y-m-d');
        $rooms = Room::where('date', $date)->where('am_or_pm', $request->amPm)
            ->with(['reservations' => function ($query) {
                $query->orderByRaw('ISNULL(start_date), start_date ASC, end_date ASC');
            }, 'reservations.exams'])
            ->get()->toArray();

        $startTimes = [
            'AM' => Carbon::createFromFormat('Y-m-d', $date)->setTimeFromTimeString(config('app.morning_start') . ':00'),
            'PM' => Carbon::createFromFormat('Y-m-d', $date)->setTimeFromTimeString(config('app.afternoon_start') . ':00'),
        ];

        foreach ($rooms as $roomKey => $room) {
            $k = 1;
            if (!empty($room['reservations']) && $room['reservations'][0]['start_date'] > $startTimes[$request->amPm]) {
                $newReservation = [
                    'room_id' => null,
                    'start_date' => $startTimes[$request->amPm],
                    'end_date' => $room['reservations'][0]['start_date'],
                ];
                array_unshift($rooms[$roomKey]['reservations'], $newReservation);
                $k++;
            }
            foreach ($room['reservations'] as $index => $reservation) {
                if (isset($room['reservations'][$index + 1])) {
                    $nextReservation = $room['reservations'][$index + 1];
                    if ($reservation['end_date'] < $nextReservation['start_date']) {
                        $newReservation = [
                            'room_id' => null,
                            'start_date' => $reservation['end_date'],
                            'end_date' => $nextReservation['start_date'],
                        ];
                        array_splice($rooms[$roomKey]['reservations'], $index + $k, 0, [$newReservation]);
                        $k++;
                    }
                }
            }
        }
        return Response::json($rooms);
    }
}
