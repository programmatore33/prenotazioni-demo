<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (config('app.env') == 'local') {
            $this->call([
                \Database\Seeders\AdminSeeder::class,
            ]);
        }

        $this->call([
            \Database\Seeders\ExamTypologiesSeeder::class,
            \Database\Seeders\ExamsSeeder::class,
        ]);
    }
}
