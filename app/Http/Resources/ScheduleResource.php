<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScheduleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'member' => [
                'id' => $this->member?->id,
                'name' => $this->member?->user?->name,
                'email' => $this->member?->user?->email,
            ],
            'equipment' => $this->equipment ? [
                'id' => $this->equipment->id,
                'name' => $this->equipment->name,
                'code' => $this->equipment->code,
            ] : null,
            'room' => $this->room ? [
                'id' => $this->room->id,
                'name' => $this->room->name,
            ] : null,
            'start_time' => optional($this->start_time)->format('Y-m-d H:i:s'),
            'end_time' => optional($this->end_time)->format('Y-m-d H:i:s'),
            'purpose' => $this->purpose,
            'status' => $this->status,
        ];
    }
}
