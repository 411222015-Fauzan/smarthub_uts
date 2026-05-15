<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartHub UTS</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; color: #222; }
        header { background: #1f2937; color: white; padding: 16px 32px; }
        nav a { color: white; margin-right: 16px; text-decoration: none; }
        .container { max-width: 1100px; margin: 24px auto; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 18px rgba(0,0,0,.07); }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border-bottom: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f1f5f9; }
        .btn { display: inline-block; padding: 8px 12px; background: #2563eb; color: white; border-radius: 6px; text-decoration: none; border: 0; cursor: pointer; }
        .btn-danger { background: #dc2626; }
        .btn-warning { background: #d97706; }
        .alert { padding: 10px; background: #dcfce7; border: 1px solid #86efac; margin-bottom: 12px; border-radius: 8px; }
        .error { color: #dc2626; font-size: 14px; }
        input, select, textarea { width: 100%; padding: 9px; margin-top: 5px; margin-bottom: 12px; border: 1px solid #ccc; border-radius: 6px; }
        label { font-weight: bold; }
    </style>
</head>
<body>
<header>
    <h2>SmartHub Management System</h2>
    <nav>
    <a href="{{ route('equipments.index') }}">Inventaris</a>
    <a href="{{ route('rooms.index') }}">Ruangan</a>
    <a href="{{ route('borrowing-schedules.index') }}">Jadwal Peminjaman</a>

    <form method="POST" action="{{ route('logout') }}" style="display:inline;">
        @csrf
        <button type="submit">Logout</button>
    </form>
</nav>
</header>
<div class="container">
    @if(session('success'))
        <div class="alert">{{ session('success') }}</div>
    @endif

    @yield('content')
</div>
</body>
</html>
