<?php

namespace App\Http\Controllers;

use App\Enums\AmPmEnum;
use App\Models\Reservation;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function getRoomData(Room $room): JsonResponse
    {
        $ret = $room->load(['reservations' => function ($query) {
            $query->orderByRaw('ISNULL(start_date), start_date ASC, end_date ASC');
        }, 'reservations.exams'])->toArray();

        $k = 1;
        foreach ($ret['reservations'] as $index => $reservation) {
            if (isset($ret['reservations'][$index + $k])) {
                $nextReservation = $ret['reservations'][$index + $k];
                if ($reservation['end_date'] < $nextReservation['start_date']) {
                    $newReservation = [
                        'room_id' => null,
                        'start_date' => $reservation['end_date'],
                        'end_date' => $nextReservation['start_date'],
                    ];
                    array_splice($ret['reservations'], $index + $k, 0, [$newReservation]);
                    $k++;
                }
            }
        }

        return Response::json($ret);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $date = Carbon::createFromLocaleFormat('j F Y', 'it', $request->date)->format('Y-m-d');
        $request->merge(['date' => $date]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'typology_id' => 'nullable|exists:exam_typologies,id',
            'am_or_pm' => ['required', Rule::enum(AmPmEnum::class)],
            'date' => 'required|date|after_or_equal:today',
        ]);

        Room::create($validated);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Room $room)
    {
        $rules = [
            'name' => 'required|string|max:255',
        ];

        if ($room->whereNotHas('reservations')) {
            $rules['typology_id'] = 'nullable|exists:exam_typologies,id';
        }

        $validated = $request->validate($rules);
        $room->update($validated);

        return redirect()->route('dashboard');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Room $room)
    {
        if ($room->whereNotHas('reservations')) {
            $room->delete();
        }
        return redirect()->route('dashboard');
    }

    public function getAlreadyReserved(Request $request, Room $room, $start_date, $end_date, Reservation $reservation = null)
    {

        $reservations = $room->reservations->filter(function ($checkReservation) use ($start_date, $end_date, $reservation) {
            return $checkReservation->start_date < $end_date && $checkReservation->end_date > $start_date && $checkReservation->id !== $reservation?->id;
        })->values();

        return response()->json($reservations);
    }

    public function search(Request $request)
    {
        $rooms = null;

        if ($request->search) {
            $rooms =
                Room::where('name', 'like', '%' . $request->search . '%');

            if ($request->historical === 'false') {
                $rooms->where('date', '>=', now()->toDateString());
            }

            $rooms = $rooms
                ->with('typology')
                ->orderBy('date', 'asc')
                ->paginate(8)->withQueryString();
        }

        return Inertia::render('Search/Rooms', [
            'rooms' => $rooms,
        ]);
    }
}
