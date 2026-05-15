@extends('layouts.app')
@section('content')
<h2>Tambah Ruangan</h2>
<form action="{{ route('rooms.store') }}" method="POST">
    @csrf
    @include('rooms.form')
</form>
@endsection
