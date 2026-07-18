https://github.com/411222015-Fauzan/smarthub_uts# SmartHub Management System

## Summary

SmartHub Management System merupakan aplikasi berbasis web yang dikembangkan untuk membantu proses pengelolaan data aset, ruangan, anggota, dan transaksi peminjaman peralatan dalam satu sistem terintegrasi. Aplikasi menerapkan arsitektur REST API menggunakan Laravel sebagai backend dan Laravel Inertia.js sebagai frontend sehingga mampu memberikan performa yang baik, mudah dikembangkan, serta mendukung tampilan yang responsif pada berbagai perangkat.

---

# Technology Stack

## Backend

* Laravel 13
* Laravel Sanctum (Token Authentication)
* RESTful API

## Frontend

* Laravel 13
* Inertia.js
* React.js
* Tailwind CSS
* Axios
* Vite

## Database

* PostgreSQL (Supabase Cloud Database)

## Version Control

* Git
* GitHub

## AI Recommendation

* ChatGPT (OpenAI) – membantu analisis kebutuhan sistem, penyusunan dokumentasi, debugging, dan pengembangan kode.
* GitHub Copilot / Cursor AI – membantu proses code completion, refactoring, dan percepatan pengembangan aplikasi.

---

# System Architecture

```text
User
   │
   ▼
Frontend
(Laravel + Inertia.js + React)
   │
Axios / HTTP Request
   │
REST API Laravel
   │
Authentication (Sanctum)
   │
Business Logic
   │
Supabase PostgreSQL
```

---

# Main Features

### Authentication

* Login
* Logout
* Token Authentication
* Protected Route

### Dashboard

* Ringkasan Data
* Statistik Sistem
* Monitoring Aktivitas

### Master Data

* Manage Member
* Manage Equipment
* Manage Room

### Transaction

* Create Borrowing
* Update Borrowing
* Check In Equipment
* Check Out Equipment
* Data Validation

---

# Application Flow

1. Pengguna membuka halaman Login.
2. Sistem melakukan autentikasi menggunakan Laravel Sanctum melalui REST API.
3. Setelah berhasil login, pengguna diarahkan ke Dashboard.
4. Pengguna dapat mengelola data master seperti Member, Equipment, dan Room.
5. Pengguna dapat membuat, mengubah, serta mengelola transaksi peminjaman peralatan.
6. Sistem melakukan validasi terhadap data transaksi sebelum disimpan.
7. Seluruh data disimpan pada database PostgreSQL yang di-host di Supabase.
8. Dashboard menampilkan ringkasan informasi berdasarkan data yang tersimpan.
9. Pengguna dapat logout untuk mengakhiri sesi penggunaan aplikasi.

---

# Project Structure

```text
smarthub-api/
│
├── app/
├── bootstrap/
├── config/
├── database/
├── routes/
├── resources/
└── ...

smarthub-frontend/
│
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   ├── Layouts/
│   │   ├── Pages/
│   │   └── Services/
├── routes/
├── public/
└── ...
```

---

# Installation

```bash
git clone <repository-url>

composer install

npm install

cp .env.example .env

php artisan key:generate

php artisan migrate

npm run dev

php artisan serve
```

---

# Version Control Strategy

Pengembangan aplikasi menggunakan Git dengan pemisahan repository antara backend dan frontend. Backend bertanggung jawab terhadap REST API, autentikasi, serta komunikasi dengan database Supabase, sedangkan frontend bertanggung jawab terhadap antarmuka pengguna menggunakan Laravel Inertia.js dan React. Pendekatan ini memudahkan proses maintenance, pengembangan fitur baru, dan kolaborasi tanpa menyebabkan konflik antarproyek.

---

# Testing

Pengujian dilakukan terhadap:

* Login Authentication
* CRUD Master Data
* CRUD Transaction
* API Integration
* Responsive Layout
* Validasi Data
* Database Integration

---

# Database

Database menggunakan **Supabase PostgreSQL** sebagai layanan cloud database yang terintegrasi dengan Laravel melalui koneksi PostgreSQL sehingga seluruh data aplikasi tersimpan secara terpusat dan dapat diakses melalui REST API backend.

---

# License

Project ini dikembangkan untuk memenuhi tugas **Ujian Akhir Semester (UAS)** mata kuliah **Pengembangan Middleware dan Backend Services** serta implementasi **Frontend Services** menggunakan Laravel 13, Inertia.js, React, dan Supabase.
