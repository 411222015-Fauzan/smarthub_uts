@extends('layouts.app')

@section('content')
<h2>Jadwal Peminjaman</h2>
<a href="{{ route('borrowing-schedules.create') }}" class="btn">Tambah Jadwal</a>
<table>
    <thead>
        <tr><th>Member</th><th>Peralatan</th><th>Ruangan</th><th>Mulai</th><th>Selesai</th><th>Status</th><th>Aksi</th></tr>
    </thead>
    <tbody>
    @foreach($schedules as $schedule)
        <tr>
            <td>{{ $schedule->member?->user?->name }}</td>
            <td>{{ $schedule->equipment?->name ?? '-' }}</td>
            <td>{{ $schedule->room?->name ?? '-' }}</td>
            <td>{{ $schedule->start_time?->format('Y-m-d H:i') }}</td>
            <td>{{ $schedule->end_time?->format('Y-m-d H:i') }}</td>
            <td>{{ $schedule->status }}</td>
            <td>
                <a href="{{ route('borrowing-schedules.edit', $schedule) }}" class="btn btn-warning">Edit</a>
                <form action="{{ route('borrowing-schedules.destroy', $schedule) }}" method="POST" style="display:inline">
                    @csrf @method('DELETE')
                    <button class="btn btn-danger" onclick="return confirm('Hapus data ini?')">Hapus</button>
                </form>
            </td>
        </tr>
    @endforeach
    </tbody>
</table>
@endsection
