<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reservation extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'room_id',
        'name',
        'phone',
        'fiscal_code',
        'note',
        'start_date',
        'end_date',
        'extra',
    ];

    public function Exams(): BelongsToMany
    {
        return $this->belongsToMany(Exam::class, 'reservation_exam');
    }

    public function Room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}
