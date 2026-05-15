<?php

namespace Database\Seeders;

use App\Models\BorrowingSchedule;
use App\Models\Equipment;
use App\Models\Member;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SmartHubSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@smarthub.local'],
            [
                'name' => 'Admin SmartHub',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        $memberUser = User::updateOrCreate(
            ['email' => 'fauzan@smarthub.local'],
            [
                'name' => 'Fauzan Member',
                'password' => Hash::make('password'),
                'role' => 'member',
            ]
        );

        $member = Member::updateOrCreate(
            ['user_id' => $memberUser->id],
            [
                'phone' => '081234567890',
                'address' => 'Tangerang, Indonesia',
                'status' => 'active',
            ]
        );

        $camera = Equipment::updateOrCreate(
            ['code' => 'CAM-001'],
            [
                'name' => 'Kamera Sony A6400',
                'category' => 'Kamera',
                'condition' => 'good',
                'status' => 'available',
                'stock' => 2,
                'description' => 'Kamera mirrorless untuk produksi konten.',
            ]
        );

        Equipment::updateOrCreate(
            ['code' => 'MIC-001'],
            [
                'name' => 'Wireless Microphone',
                'category' => 'Audio',
                'condition' => 'good',
                'status' => 'available',
                'stock' => 4,
                'description' => 'Mic wireless untuk podcast dan video.',
            ]
        );

        $room = Room::updateOrCreate(
            ['name' => 'Studio Podcast'],
            [
                'capacity' => 5,
                'status' => 'available',
                'description' => 'Ruangan khusus rekaman podcast.',
            ]
        );

        BorrowingSchedule::updateOrCreate(
            [
                'member_id' => $member->id,
                'equipment_id' => $camera->id,
                'room_id' => $room->id,
                'start_time' => now()->addDay()->setTime(9, 0),
            ],
            [
                'end_time' => now()->addDay()->setTime(12, 0),
                'purpose' => 'Produksi konten video komunitas.',
                'status' => 'approved',
            ]
        );
    }
}
