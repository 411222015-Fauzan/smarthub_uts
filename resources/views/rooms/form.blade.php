<label>Nama Ruangan</label>
<input type="text" name="name" value="{{ old('name', $room->name ?? '') }}">

<label>Kapasitas</label>
<input type="number" name="capacity" value="{{ old('capacity', $room->capacity ?? 1) }}">

<label>Status</label>
<select name="status">
    @foreach(['available', 'booked', 'maintenance'] as $status)
        <option value="{{ $status }}" @selected(old('status', $room->status ?? 'available') == $status)>{{ $status }}</option>
    @endforeach
</select>

<label>Deskripsi</label>
<textarea name="description">{{ old('description', $room->description ?? '') }}</textarea>

<button class="btn">Simpan</button>
<a href="{{ route('rooms.index') }}" class="btn btn-danger">Batal</a>
