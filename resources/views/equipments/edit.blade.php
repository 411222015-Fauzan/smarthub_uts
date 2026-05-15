@extends('layouts.app')

@section('content')
<h2>Edit Peralatan</h2>
<form action="{{ route('equipments.update', $equipment) }}" method="POST">
    @csrf
    @method('PUT')
    @include('equipments.form')
</form>
@endsection
