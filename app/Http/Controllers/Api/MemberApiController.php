<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class MemberApiController extends Controller
{
    public function index()
    {
        $members = Member::with('user')->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Data anggota berhasil diambil.',
            'data' => $members,
        ]);
    }

    public function show(Member $member)
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail anggota berhasil diambil.',
            'data' => $member->load('user'),
        ]);
    }

    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $member = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'member',
            ]);

            return Member::create([
                'user_id' => $user->id,
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'status' => $data['status'],
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Data anggota berhasil ditambahkan.',
            'data' => $member->load('user'),
        ], 201);
    }

    public function update(Request $request, Member $member)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $user = $member->user;

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['nullable', 'string', 'min:6'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        DB::transaction(function () use ($member, $user, $data) {
            $userData = [
                'name' => $data['name'],
                'email' => $data['email'],
            ];

            if (!empty($data['password'])) {
                $userData['password'] = Hash::make($data['password']);
            }

            $user->update($userData);

            $member->update([
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'status' => $data['status'],
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Data anggota berhasil diperbarui.',
            'data' => $member->load('user'),
        ]);
    }

    public function destroy(Request $request, Member $member)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $user = $member->user;
        
        DB::transaction(function () use ($member, $user) {
            $member->delete();
            $user?->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Data anggota berhasil dihapus.',
        ]);
    }
}
