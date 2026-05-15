<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ScheduleResource;
use App\Models\BorrowingSchedule;
use Illuminate\Http\Request;

class ScheduleApiController extends Controller
{
    public function index(Request $request)
    {
        $query = BorrowingSchedule::with(['member.user', 'equipment', 'room'])->latest();

        if ($request->user()->isMember()) {
            $memberId = $request->user()->member?->id;
            $query->where('member_id', $memberId);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data jadwal berhasil diambil.',
            'data' => ScheduleResource::collection($query->get()),
        ]);
    }

    public function show(BorrowingSchedule $schedule)
    {
        $schedule->load(['member.user', 'equipment', 'room']);

        return response()->json([
            'success' => true,
            'message' => 'Detail jadwal berhasil diambil.',
            'data' => new ScheduleResource($schedule),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'equipment_id' => ['nullable', 'exists:equipments,id'],
            'room_id' => ['nullable', 'exists:rooms,id'],
            'start_time' => ['required', 'date'],
            'end_time' => ['required', 'date', 'after:start_time'],
            'purpose' => ['required', 'string'],
        ]);

        if (!$request->equipment_id && !$request->room_id) {
            return response()->json([
                'success' => false,
                'message' => 'Minimal pilih equipment_id atau room_id.',
            ], 422);
        }

        $member = $request->user()->member;

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'User belum memiliki data member.',
            ], 422);
        }

        $schedule = BorrowingSchedule::create([
            'member_id' => $member->id,
            'equipment_id' => $request->equipment_id,
            'room_id' => $request->room_id,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'purpose' => $request->purpose,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Jadwal peminjaman berhasil dibuat.',
            'data' => new ScheduleResource($schedule->load(['member.user', 'equipment', 'room'])),
        ], 201);
    }

    public function update(Request $request, BorrowingSchedule $schedule)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $request->validate([
            'status' => ['required', 'in:pending,approved,rejected,completed'],
        ]);

        $schedule->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Status jadwal berhasil diperbarui.',
            'data' => new ScheduleResource($schedule->load(['member.user', 'equipment', 'room'])),
        ]);
    }

    public function destroy(Request $request, BorrowingSchedule $schedule)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $schedule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil dihapus.',
        ]);
    }
}
