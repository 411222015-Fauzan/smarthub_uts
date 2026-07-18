<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;

class RoomApiController extends Controller
{
    public function index()
    {
        $rooms = Room::latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Data ruangan berhasil diambil.',
            'data' => $rooms,
        ]);
    }

    public function show(Room $room)
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail ruangan berhasil diambil.',
            'data' => $room,
        ]);
    }

    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:rooms,name'],
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:available,booked,maintenance'],
            'description' => ['nullable', 'string'],
        ]);

        $room = Room::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Data ruangan berhasil ditambahkan.',
            'data' => $room,
        ], 201);
    }

    public function update(Request $request, Room $room)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:rooms,name,' . $room->id],
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:available,booked,maintenance'],
            'description' => ['nullable', 'string'],
        ]);

        $room->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Data ruangan berhasil diperbarui.',
            'data' => $room,
        ]);
    }

    public function destroy(Request $request, Room $room)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $room->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data ruangan berhasil dihapus.',
        ]);
    }
}
