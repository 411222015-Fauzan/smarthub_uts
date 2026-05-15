<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CheckIn extends Model
{
    use HasFactory;

    protected $fillable = [
        'borrowing_schedule_id',
        'check_in_time',
        'check_out_time',
        'condition_before',
        'condition_after',
        'status',
    ];

    protected $casts = [
        'check_in_time' => 'datetime',
        'check_out_time' => 'datetime',
    ];

    public function borrowingSchedule()
    {
        return $this->belongsTo(BorrowingSchedule::class);
    }
}
