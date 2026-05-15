<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEquipmentRequest;
use App\Http\Requests\UpdateEquipmentRequest;
use App\Http\Resources\EquipmentResource;
use App\Models\Equipment;

class EquipmentApiController extends Controller
{
    public function index()
    {
        $equipments = Equipment::latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Data inventaris berhasil diambil.',
            'data' => EquipmentResource::collection($equipments),
        ]);
    }

    public function show(Equipment $equipment)
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail inventaris berhasil diambil.',
            'data' => new EquipmentResource($equipment),
        ]);
    }

    public function store(StoreEquipmentRequest $request)
    {
        if (!request()->user()->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $equipment = Equipment::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Data inventaris berhasil ditambahkan.',
            'data' => new EquipmentResource($equipment),
        ], 201);
    }

    public function update(UpdateEquipmentRequest $request, Equipment $equipment)
    {
        if (!request()->user()->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $equipment->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Data inventaris berhasil diperbarui.',
            'data' => new EquipmentResource($equipment),
        ]);
    }

    public function destroy(Equipment $equipment)
    {
        if (!request()->user()->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $equipment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data inventaris berhasil dihapus.',
        ]);
    }
}
