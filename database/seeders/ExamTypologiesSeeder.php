<?php

namespace Database\Seeders;

use App\Models\ExamTypologies;
use Illuminate\Database\Seeder;

class ExamTypologiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ExamTypologies::firstOrCreate(['name' => 'CARD']); //ID 1
        ExamTypologies::firstOrCreate(['name' => 'ANG']); //ID 2
        ExamTypologies::firstOrCreate(['name' => 'ECOG']); //ID 3
        ExamTypologies::firstOrCreate(['name' => 'CARD+ANG']); //ID 4
    }
}
