@extends('layouts.app')
@section('content')
<h2>Edit Ruangan</h2>
<form action="{{ route('rooms.update', $room) }}" method="POST">
    @csrf @method('PUT')
    @include('rooms.form')
</form>
@endsection
