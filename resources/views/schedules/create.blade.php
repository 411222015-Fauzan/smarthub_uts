@extends('layouts.app')

@section('content')
<h2>Tambah Jadwal</h2>

<form action="{{ route('borrowing-schedules.store') }}" method="POST">
    @csrf

    @include('schedules.form')

    <br>
    <button type="submit" class="btn">Simpan</button>
    <a href="{{ route('borrowing-schedules.index') }}" class="btn btn-warning">Kembali</a>
</form>
@endsection