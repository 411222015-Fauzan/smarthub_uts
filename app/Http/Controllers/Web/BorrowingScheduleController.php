<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\BorrowingSchedule;
use App\Models\Equipment;
use App\Models\Member;
use App\Models\Room;
use Illuminate\Http\Request;

class BorrowingScheduleController extends Controller
{
    public function index()
    {
        $schedules = BorrowingSchedule::with(['member.user', 'equipment', 'room'])->latest()->get();
        return view('schedules.index', compact('schedules'));
    }

    public function create()
    {
        $members = Member::with('user')->where('status', 'active')->get();
        $equipments = Equipment::where('status', 'available')->get();
        $rooms = Room::where('status', 'available')->get();

        return view('schedules.create', compact('members', 'equipments', 'rooms'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'member_id' => ['required', 'exists:members,id'],
            'equipment_id' => ['nullable', 'exists:equipments,id'],
            'room_id' => ['nullable', 'exists:rooms,id'],
            'start_time' => ['required', 'date'],
            'end_time' => ['required', 'date', 'after:start_time'],
            'purpose' => ['required', 'string'],
            'status' => ['required', 'in:pending,approved,rejected,completed'],
        ]);

        if (empty($data['equipment_id']) && empty($data['room_id'])) {
            return back()->withErrors(['equipment_id' => 'Pilih minimal peralatan atau ruangan.'])->withInput();
        }

        BorrowingSchedule::create($data);

        return redirect()
            ->route('borrowing-schedules.index')
            ->with('success', 'Jadwal peminjaman berhasil dibuat.');
    }

    public function edit($borrowing_schedule)
    {
        $schedule = BorrowingSchedule::findOrFail($borrowing_schedule);

        $members = Member::with('user')->get();
        $equipments = Equipment::all();
        $rooms = Room::all();

        return view('schedules.edit', compact('schedule', 'members', 'equipments', 'rooms'));
    }

    public function update(Request $request, $borrowing_schedule)
    {
        $schedule = BorrowingSchedule::findOrFail($borrowing_schedule);

        $data = $request->validate([
            'member_id' => ['required', 'exists:members,id'],
            'equipment_id' => ['nullable', 'exists:equipments,id'],
            'room_id' => ['nullable', 'exists:rooms,id'],
            'start_time' => ['required', 'date'],
            'end_time' => ['required', 'date', 'after:start_time'],
            'purpose' => ['required', 'string'],
            'status' => ['required', 'in:pending,approved,rejected,completed'],
        ]);

        $schedule->update($data);

        return redirect()
            ->route('borrowing-schedules.index')
            ->with('success', 'Jadwal peminjaman berhasil diperbarui.');
    }

    public function destroy($borrowing_schedule)
    {
        $schedule = BorrowingSchedule::findOrFail($borrowing_schedule);
        $schedule->delete();

        return redirect()
            ->route('borrowing-schedules.index')
            ->with('success', 'Jadwal peminjaman berhasil dihapus.');
    }
}