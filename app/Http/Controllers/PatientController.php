<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function getPatients(Request $request): JsonResponse
    {
        $patients = Patient::where('name', 'like', '%' . $request->input('name') . '%')->get();
        return response()->json($patients);
    }

    public function destroy(Patient $patient) : JsonResponse
    {
        $patient->delete();
        return response()->json(['message' => 'Patient deleted']);
    }
}
