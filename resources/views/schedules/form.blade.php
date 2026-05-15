<label>Anggota</label>
<select name="member_id" required>
    @foreach($members as $member)
        <option value="{{ $member->id }}"
            {{ old('member_id', $schedule->member_id ?? '') == $member->id ? 'selected' : '' }}>
            {{ $member->user->name ?? 'Tanpa Nama' }}
        </option>
    @endforeach
</select>

<label>Peralatan</label>
<select name="equipment_id">
    <option value="">Tidak Meminjam Peralatan</option>
    @foreach($equipments as $equipment)
        <option value="{{ $equipment->id }}"
            {{ old('equipment_id', $schedule->equipment_id ?? '') == $equipment->id ? 'selected' : '' }}>
            {{ $equipment->name }}
        </option>
    @endforeach
</select>

<label>Ruangan</label>
<select name="room_id">
    <option value="">Tidak Meminjam Ruangan</option>
    @foreach($rooms as $room)
        <option value="{{ $room->id }}"
            {{ old('room_id', $schedule->room_id ?? '') == $room->id ? 'selected' : '' }}>
            {{ $room->name }}
        </option>
    @endforeach
</select>

<label>Waktu Mulai</label>
<input
    type="datetime-local"
    name="start_time"
    value="{{ old('start_time', isset($schedule) ? \Carbon\Carbon::parse($schedule->start_time)->format('Y-m-d\TH:i') : '') }}"
    required
>

<label>Waktu Selesai</label>
<input
    type="datetime-local"
    name="end_time"
    value="{{ old('end_time', isset($schedule) ? \Carbon\Carbon::parse($schedule->end_time)->format('Y-m-d\TH:i') : '') }}"
    required
>

<label>Tujuan</label>
<textarea name="purpose">{{ old('purpose', $schedule->purpose ?? '') }}</textarea>

<label>Status</label>
<select name="status" required>
    <option value="pending" {{ old('status', $schedule->status ?? '') == 'pending' ? 'selected' : '' }}>Pending</option>
    <option value="approved" {{ old('status', $schedule->status ?? '') == 'approved' ? 'selected' : '' }}>Approved</option>
    <option value="rejected" {{ old('status', $schedule->status ?? '') == 'rejected' ? 'selected' : '' }}>Rejected</option>
    <option value="completed" {{ old('status', $schedule->status ?? '') == 'completed' ? 'selected' : '' }}>Completed</option>
</select>