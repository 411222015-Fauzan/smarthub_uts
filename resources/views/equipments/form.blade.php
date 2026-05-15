<label>Nama Peralatan</label>
<input type="text" name="name" value="{{ old('name', $equipment->name ?? '') }}">
@error('name') <div class="error">{{ $message }}</div> @enderror

<label>Kode</label>
<input type="text" name="code" value="{{ old('code', $equipment->code ?? '') }}">
@error('code') <div class="error">{{ $message }}</div> @enderror

<label>Kategori</label>
<input type="text" name="category" value="{{ old('category', $equipment->category ?? '') }}">
@error('category') <div class="error">{{ $message }}</div> @enderror

<label>Kondisi</label>
<select name="condition">
    @foreach(['good', 'damaged', 'maintenance'] as $condition)
        <option value="{{ $condition }}" @selected(old('condition', $equipment->condition ?? 'good') == $condition)>{{ $condition }}</option>
    @endforeach
</select>

<label>Status</label>
<select name="status">
    @foreach(['available', 'borrowed', 'unavailable'] as $status)
        <option value="{{ $status }}" @selected(old('status', $equipment->status ?? 'available') == $status)>{{ $status }}</option>
    @endforeach
</select>

<label>Stok</label>
<input type="number" name="stock" value="{{ old('stock', $equipment->stock ?? 1) }}">
@error('stock') <div class="error">{{ $message }}</div> @enderror

<label>Deskripsi</label>
<textarea name="description">{{ old('description', $equipment->description ?? '') }}</textarea>

<button class="btn">Simpan</button>
<a href="{{ route('equipments.index') }}" class="btn btn-danger">Batal</a>
