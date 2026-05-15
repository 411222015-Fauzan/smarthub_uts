@extends('layouts.app')

@section('content')
<h2>Data Ruangan</h2>
<a href="{{ route('rooms.create') }}" class="btn">Tambah Ruangan</a>
<table>
    <thead><tr><th>Nama</th><th>Kapasitas</th><th>Status</th><th>Aksi</th></tr></thead>
    <tbody>
    @foreach($rooms as $room)
        <tr>
            <td>{{ $room->name }}</td>
            <td>{{ $room->capacity }}</td>
            <td>{{ $room->status }}</td>
            <td>
                <a href="{{ route('rooms.edit', $room) }}" class="btn btn-warning">Edit</a>
                <form action="{{ route('rooms.destroy', $room) }}" method="POST" style="display:inline">
                    @csrf @method('DELETE')
                    <button class="btn btn-danger" onclick="return confirm('Hapus data ini?')">Hapus</button>
                </form>
            </td>
        </tr>
    @endforeach
    </tbody>
</table>
@endsection
