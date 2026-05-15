@extends('layouts.app')

@section('content')
<h2>Edit Jadwal</h2>

<form action="{{ route('borrowing-schedules.update', $schedule) }}" method="POST">
    @csrf
    @method('PUT')

    @include('schedules.form')

    <br>
    <button type="submit" class="btn">Update</button>
    <a href="{{ route('borrowing-schedules.index') }}" class="btn btn-warning">Kembali</a>
</form>
@endsection