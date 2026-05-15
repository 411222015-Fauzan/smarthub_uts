@extends('layouts.app')

@section('content')
<h2>Tambah Peralatan</h2>
<form action="{{ route('equipments.store') }}" method="POST">
    @csrf
    @include('equipments.form')
</form>
@endsection
