<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CheckInResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'borrowing_schedule_id' => $this->borrowing_schedule_id,
            'schedule' => new ScheduleResource($this->whenLoaded('borrowingSchedule')),
            'check_in_time' => optional($this->check_in_time)->format('Y-m-d H:i:s'),
            'check_out_time' => optional($this->check_out_time)->format('Y-m-d H:i:s'),
            'condition_before' => $this->condition_before,
            'condition_after' => $this->condition_after,
            'status' => $this->status,
        ];
    }
}
