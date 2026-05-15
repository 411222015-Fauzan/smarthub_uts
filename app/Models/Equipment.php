<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    protected $table = 'equipments';

    protected $fillable = [
        'name',
        'code',
        'category',
        'condition',
        'status',
        'stock',
        'description'
    ];

    public function borrowingSchedules()
    {
        return $this->hasMany(BorrowingSchedule::class);
    }
}