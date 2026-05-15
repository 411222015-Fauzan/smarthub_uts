<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Login - SmartHub UTS</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #eef2f7;
            margin: 0;
            padding: 0;
        }

        .login-container {
            width: 400px;
            margin: 100px auto;
            background: #ffffff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.12);
        }

        h2 {
            text-align: center;
            margin-bottom: 8px;
            color: #1f2937;
        }

        .subtitle {
            text-align: center;
            margin-bottom: 25px;
            color: #6b7280;
            font-size: 14px;
        }

        label {
            display: block;
            margin-bottom: 6px;
            color: #374151;
            font-weight: bold;
        }

        input {
            width: 100%;
            padding: 11px;
            margin-bottom: 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            box-sizing: border-box;
        }

        button {
            width: 100%;
            padding: 12px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
        }

        button:hover {
            background: #1d4ed8;
        }

        .error {
            background: #fee2e2;
            color: #991b1b;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-size: 14px;
        }

        .success {
            background: #dcfce7;
            color: #166534;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-size: 14px;
        }

        .info {
            margin-top: 18px;
            padding: 12px;
            background: #f3f4f6;
            border-radius: 8px;
            font-size: 13px;
            color: #374151;
        }
    </style>
</head>
<body>

<div class="login-container">
    <h2>SmartHub Login</h2>
    <div class="subtitle">Masuk ke Dashboard Admin</div>

    @if (session('success'))
        <div class="success">
            {{ session('success') }}
        </div>
    @endif

    @if ($errors->any())
        <div class="error">
            {{ $errors->first() }}
        </div>
    @endif

    <form method="POST" action="{{ route('login.process') }}">
        @csrf

        <label>Email</label>
        <input 
            type="email" 
            name="email" 
            value="{{ old('email') }}" 
            placeholder="Masukkan email"
            required
        >

        <label>Password</label>
        <input 
            type="password" 
            name="password" 
            placeholder="Masukkan password"
            required
        >

        <button type="submit">Login</button>
    </form>

    <div class="info">
        <strong>Akun Admin:</strong><br>
        Email: admin@smarthub.local<br>
        Password: password
    </div>
</div>

</body>
</html>