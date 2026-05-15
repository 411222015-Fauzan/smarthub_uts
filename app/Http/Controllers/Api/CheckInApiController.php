<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCheckInRequest;
use App\Http\Resources\CheckInResource;
use App\Models\BorrowingSchedule;
use App\Models\CheckIn;
use Illuminate\Http\Request;

class CheckInApiController extends Controller
{
    public function store(StoreCheckInRequest $request)
    {
        $schedule = BorrowingSchedule::with(['equipment', 'room'])->findOrFail($request->borrowing_schedule_id);

        if ($schedule->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Check-in hanya bisa dilakukan untuk jadwal yang sudah approved.',
            ], 422);
        }

        $checkIn = CheckIn::create([
            'borrowing_schedule_id' => $schedule->id,
            'check_in_time' => now(),
            'condition_before' => $request->condition_before,
            'status' => $request->status ?? 'checked_in',
        ]);

        if ($schedule->equipment) {
            $schedule->equipment->update(['status' => 'borrowed']);
        }

        if ($schedule->room) {
            $schedule->room->update(['status' => 'booked']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Check-in berhasil disimpan.',
            'data' => new CheckInResource($checkIn->load('borrowingSchedule.member.user', 'borrowingSchedule.equipment', 'borrowingSchedule.room')),
        ], 201);
    }

    public function checkout(Request $request, CheckIn $checkIn)
    {
        $request->validate([
            'condition_after' => ['required', 'string'],
            'status' => ['nullable', 'in:checked_out,problem'],
        ]);

        $checkIn->update([
            'check_out_time' => now(),
            'condition_after' => $request->condition_after,
            'status' => $request->status ?? 'checked_out',
        ]);

        $schedule = $checkIn->borrowingSchedule()->with(['equipment', 'room'])->first();

        if ($schedule?->equipment) {
            $schedule->equipment->update([
                'status' => $checkIn->status === 'problem' ? 'unavailable' : 'available',
            ]);
        }

        if ($schedule?->room) {
            $schedule->room->update([
                'status' => $checkIn->status === 'problem' ? 'maintenance' : 'available',
            ]);
        }

        $schedule?->update(['status' => 'completed']);

        return response()->json([
            'success' => true,
            'message' => 'Check-out berhasil disimpan.',
            'data' => new CheckInResource($checkIn->load('borrowingSchedule.member.user', 'borrowingSchedule.equipment', 'borrowingSchedule.room')),
        ]);
    }

    public function history()
    {
        $checkIns = CheckIn::with('borrowingSchedule.member.user', 'borrowingSchedule.equipment', 'borrowingSchedule.room')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Riwayat check-in berhasil diambil.',
            'data' => CheckInResource::collection($checkIns),
        ]);
    }
}
