<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Patient;
use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ReservationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request, Room $room): InertiaResponse
    {
        if (! $room->typology_id) {
            $exams = Exam::whereNotNull('typology_id')->get();
        } else {
            $exams = Exam::where('typology_id', $room->typology_id)->get();
        }

        $otherExams = Exam::whereNull('typology_id')->get();

        $defaultStartDate = $room->reservations->max('end_date');

        if ($request->has('start')) {
            $defaultStartDate = $request->start;
        }

        return Inertia::render('Reservation/New', [
            'reservation' => null,
            'room' => $room,
            'exams' => $exams,
            'otherExams' => $otherExams,
            'defaultStartDate' => $defaultStartDate,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $validated = $request->validate([
            'room_id' => 'required|integer',
            'name' => 'required|string',
            'phone' => 'nullable',
            'fiscal_code' => 'nullable',
            'extra' => 'nullable',
            'start_date' => 'nullable',
            'end_date' => 'required_with:start_date',
            'exams' => 'required|array',
        ]);

        $reservation = Reservation::create($validated);
        $reservation->exams()->sync($request->exams);

        if ($validated['phone'] && $validated['name']) {
            Patient::updateOrCreate(
                ['name' => $validated['name'], 'phone' => $validated['phone']],
            );
        }

        return redirect()->route('dashboard');
    }

    /**
     * Display the specified resource.
     */
    public function show(Reservation $reservation)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Reservation $reservation, Room $room)
    {
        if (! $room->typology_id) {
            $exams = Exam::whereNotNull('typology_id')->get();
        } else {
            $exams = Exam::where('typology_id', $room->typology_id)->get();
        }

        $otherExams = Exam::whereNull('typology_id')->get();

        $defaultStartDate = $room->reservations->max('end_date');

        return Inertia::render('Reservation/New', [
            'reservation' => $reservation->load('exams'),
            'room' => $room,
            'exams' => $exams,
            'otherExams' => $otherExams,
            'defaultStartDate' => $defaultStartDate,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'room_id' => 'required|integer',
            'name' => 'required|string',
            'phone' => 'nullable',
            'extra' => 'nullable',
            'fiscal_code' => 'nullable',
            'start_date' => 'nullable',
            'end_date' => 'required_with:start_date',
            'exams' => 'required|array',
        ]);

        $reservation->update($validated);
        $reservation->exams()->sync($request->exams);

        if ($validated['phone'] && $validated['name']) {
            Patient::updateOrCreate(
                ['name' => $validated['name'], 'phone' => $validated['phone']],
            );
        }

        return redirect()->route('dashboard');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Reservation $reservation)
    {
        $reservation->delete();

        return redirect()->route('dashboard');
    }

    public function search(Request $request)
    {
        $reservations = null;

        if ($request->search) {
            $reservations =
                Reservation::where(function ($query) use ($request) {
                    $query->where('name', 'like', '%'.$request->search.'%')
                        ->orWhere('phone', 'like', '%'.$request->search.'%');
                });

            if ($request->historical === 'false') {
                $reservations->whereHas('room', function ($query) {
                    $query->where('date', '>=', now()->toDateString());
                });
            }

            $reservations = $reservations
                ->orderBy('start_date', 'asc')
                ->with('room', 'exams')
                ->paginate(8)->withQueryString();
        }

        return Inertia::render('Search/Reservations', [
            'reservations' => $reservations,
        ]);
    }
}
