<?php

namespace App\Models;

use App\Enums\AmPmEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'typology_id',
        'am_or_pm',
        'date',
    ];

    protected $casts = [
        'am_or_pm' => AmPmEnum::class,
        'date' => 'date',
    ];

    public function Reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function Typology()
    {
        return $this->belongsTo(ExamTypologies::class);
    }
}
