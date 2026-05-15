@extends('layouts.app')

@section('content')

<form method="POST" action="{{ route('logout') }}" style="text-align: right; margin-bottom: 15px;">
    @csrf
    <button type="submit" style="background: #dc2626; color: white; padding: 8px 14px; border: none; border-radius: 6px;">
        Logout
    </button>
</form>

<h2>Data Inventaris Peralatan</h2>
<a href="{{ route('equipments.create') }}" class="btn">Tambah Peralatan</a>

<table>
    <thead>
        <tr>
            <th>Nama</th>
            <th>Kode</th>
            <th>Kategori</th>
            <th>Kondisi</th>
            <th>Status</th>
            <th>Stok</th>
            <th>Aksi</th>
        </tr>
    </thead>
    <tbody>
        @foreach($equipments as $equipment)
        <tr>
            <td>{{ $equipment->name }}</td>
            <td>{{ $equipment->code }}</td>
            <td>{{ $equipment->category }}</td>
            <td>{{ $equipment->condition }}</td>
            <td>{{ $equipment->status }}</td>
            <td>{{ $equipment->stock }}</td>
            <td>
                <a href="{{ route('equipments.edit', $equipment) }}" class="btn btn-warning">Edit</a>
                <form action="{{ route('equipments.destroy', $equipment) }}" method="POST" style="display:inline">
                    @csrf
                    @method('DELETE')
                    <button class="btn btn-danger" onclick="return confirm('Hapus data ini?')">Hapus</button>
                </form>
            </td>
        </tr>
        @endforeach
    </tbody>
</table>
@endsection
