<?php

namespace Database\Seeders;

use App\Models\Exam;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ExamsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //CARD
        Exam::firstOrCreate(['name' => 'ECG', 'duration' => 5, 'typology_id' => 1]);
        Exam::firstOrCreate(['name' => 'VIS', 'duration' => 10, 'typology_id' => 1]);
        Exam::firstOrCreate(['name' => 'E2C', 'duration' => 15, 'typology_id' => 1]);
        Exam::firstOrCreate(['name' => 'ESC', 'duration' => 20, 'typology_id' => 1]);

        //ANG
        Exam::firstOrCreate(['name' => 'TSA', 'duration' => 10, 'typology_id' => 2]);
        Exam::firstOrCreate(['name' => 'A INF', 'duration' => 10, 'typology_id' => 2]);
        Exam::firstOrCreate(['name' => 'V INF', 'duration' => 10, 'typology_id' => 2]);
        Exam::firstOrCreate(['name' => 'AV INF', 'duration' => 15, 'typology_id' => 2]);
        Exam::firstOrCreate(['name' => 'A SUP', 'duration' => 10, 'typology_id' => 2]);
        Exam::firstOrCreate(['name' => 'V SUP', 'duration' => 10, 'typology_id' => 2]);
        Exam::firstOrCreate(['name' => 'AV SUP', 'duration' => 15, 'typology_id' => 2]);
        Exam::firstOrCreate(['name' => 'AOA', 'duration' => 10, 'typology_id' => 2]);
        Exam::firstOrCreate(['name' => 'VAN', 'duration' => 15, 'typology_id' => 2]);

        //ECOG
        Exam::firstOrCreate(['name' => 'ECI', 'duration' => 20, 'typology_id' => 3]);
        Exam::firstOrCreate(['name' => 'VSN', 'duration' => 15, 'typology_id' => 3]);
        Exam::firstOrCreate(['name' => 'AD CO', 'duration' => 20, 'typology_id' => 3]);
        Exam::firstOrCreate(['name' => 'VSN+E', 'duration' => 20, 'typology_id' => 3]);

        //CARD+ANG
        Exam::firstOrCreate(['name' => 'ECG', 'duration' => 5, 'typology_id' => 4]);
        Exam::firstOrCreate(['name' => 'VIS', 'duration' => 10, 'typology_id' => 4]);
        Exam::firstOrCreate(['name' => 'E2C', 'duration' => 15, 'typology_id' => 4]);
        Exam::firstOrCreate(['name' => 'ESC', 'duration' => 20, 'typology_id' => 4]);
        Exam::firstOrCreate(['name' => 'TSA', 'duration' => 10, 'typology_id' => 4]);
        Exam::firstOrCreate(['name' => 'A INF', 'duration' => 10, 'typology_id' => 4]);
        Exam::firstOrCreate(['name' => 'V INF', 'duration' => 10, 'typology_id' => 4]);
        Exam::firstOrCreate(['name' => 'AV INF', 'duration' => 15, 'typology_id' => 4]);
        Exam::firstOrCreate(['name' => 'A SUP', 'duration' => 10, 'typology_id' => 4]);
        Exam::firstOrCreate(['name' => 'V SUP', 'duration' => 10, 'typology_id' => 4]);
        Exam::firstOrCreate(['name' => 'AV SUP', 'duration' => 15, 'typology_id' => 4]);
        Exam::firstOrCreate(['name' => 'AOA', 'duration' => 10, 'typology_id' => 4]);
        Exam::firstOrCreate(['name' => 'VAN', 'duration' => 15, 'typology_id' => 4]);

        Exam::firstOrCreate(['name' => 'H C']);
        Exam::firstOrCreate(['name' => 'H P']);
    }
}
