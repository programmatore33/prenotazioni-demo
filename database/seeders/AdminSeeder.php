<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (config('app.env') == 'local') {
            $password = Hash::make('password');
            User::firstOrCreate(['name' => 'Vincenzo', 'email' => 'vincenzo.schettino@gmail.com', 'password' => $password]);
        }
    }
}
