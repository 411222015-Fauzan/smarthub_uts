<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BorrowingSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'equipment_id',
        'room_id',
        'start_time',
        'end_time',
        'purpose',
        'status',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function checkIns()
    {
        return $this->hasMany(CheckIn::class);
    }
}
