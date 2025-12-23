# Struktura - Sistem Manajemen Organisasi Terpadu 🏢

**Struktura** adalah aplikasi berbasis web yang mengadopsi arsitektur **Single Page Application (SPA)** untuk mendigitalisasi seluruh proses administrasi organisasi. Dikembangkan untuk mengatasi masalah transparansi program kerja, pengelolaan basis data anggota, dan birokrasi internal yang lambat.

---

## 🌟 Latar Belakang & Filosofi
Aplikasi ini lahir dari kebutuhan akan sistem informasi organisasi yang tidak hanya berfungsi sebagai basis data statis, tetapi juga sebagai alat monitoring aktif. Nama "Struktura" mencerminkan tujuan aplikasi: memberikan struktur yang jelas bagi organisasi dalam menjalankan tata kelola kepengurusan.

---

## 🚀 Fitur Unggulan Secara Detail

### 1. Arsitektur Single Page Application (SPA)
- **Hash-Based Routing**: Navigasi antar modul menggunakan URL Hash (`#`). Hal ini memungkinkan transisi halaman instan tanpa perlu memuat ulang (reload) aset CSS/JS dari server.
- **Dynamic DOM Injection**: Konten dirender secara dinamis ke dalam elemen `.container` berdasarkan status autentikasi dan peran pengguna.

### 2. Dashboard Publik & Guest Access
- **Transparency Mode**: Tamu (Guest) memiliki akses ke daftar organisasi publik untuk melihat profil, visi-misi, dan daftar anggota aktif tanpa harus mendaftar akun terlebih dahulu.
- **Lead Generation**: Memberikan kemudahan bagi calon anggota untuk mengeksplorasi organisasi sebelum memutuskan untuk melakukan registrasi.

### 3. Manajemen Program Kerja (Lifecycle Management)
Aplikasi ini mengelola program kerja melalui 5 tahapan status yang ketat:
- **PENDING**: Pengajuan baru oleh anggota/PIC yang menunggu verifikasi Pimpinan.
- **PLANNED**: Proker telah disetujui dan siap dijalankan.
- **ON GOING**: Proker dalam masa pelaksanaan.
- **COMPLETED**: Proker telah selesai dengan laporan hasil dan lampiran link dokumentasi yang valid.
- **REJECTED**: Proker ditolak oleh pimpinan dengan alasan penolakan yang tercatat dalam sistem.

### 4. Sistem Keanggotaan Cerdas
- **Identity Tracking**: Penomoran anggota secara otomatis dan pengelolaan jabatan yang dinamis.
- **Status Lifecycle**: Mengelola status user mulai dari `NON_MEMBER`, `PENDING`, `ACTIVE`, hingga `REVOKED`.
- **Handover Module**: Fitur keamanan untuk melakukan delegasi pimpinan utama kepada anggota lain secara permanen, mengalihkan seluruh hak akses administratif secara otomatis.

---

## 🏗️ Struktur Teknis & Arsitektur Folder

### Frontend Logic
- `struktura.js`: Pusat logika aplikasi yang menangani routing, fetching API, manipulasi DOM, dan state management global.
- `auth-init.js`: Guard system yang memproteksi rute internal dari akses ilegal pengguna yang tidak terautentikasi.

### Styling System
- `main-layout.css`: Menggunakan sistem **CSS Grid** untuk tata letak dashboard 2-kolom dan **Flexbox** untuk komponen responsif.
- `reset-base.css`: Standarisasi elemen UI, variabel warna tema (Navy & Gold), dan efek visual transisi.



---

## 🛠️ Panduan Instalasi & Deployment

### Prasyarat
- Java Development Kit (JDK) 17 atau versi terbaru.
- Maven untuk manajemen dependensi.
- Database (MySQL/PostgreSQL).

### Langkah-langkah
1. Clone repositori ini: `git clone https://github.com/username/struktura.git`
2. Konfigurasi `application.properties` sesuai dengan database lokal Anda.
3. Jalankan aplikasi menggunakan Maven: `mvn spring-boot:run`
4. Akses melalui browser di: `http://localhost:8080`

---

## 🔒 Keamanan Data
- **Client-Side Guard**: Mengecek keberadaan `CURRENT_USER_ID` di Local Storage pada setiap perpindahan rute.
- **Role-Based Access Control (RBAC)**: Memastikan pengguna dengan role `USER` tidak dapat melihat atau memanipulasi fitur milik `PIMPINAN` atau `ADMIN`.

---

## 📈 Roadmap Pengembangan ke Depan
- Integrasi dengan sistem manajemen file untuk unggahan dokumen PDF laporan.
- Penambahan fitur ekspor data anggota ke format Excel/CSV.
- Dashboard analitik untuk statistik performa program kerja per bidang.

---

## 👨‍💻 Author & Developer

<p align="center">
  <img src="https://img.shields.io/badge/Status-Mahasiswa-blue?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Role-Programmer-gold?style=for-the-badge" alt="Role">
</p>

Halo! Saya **Pangeran Valerensco Rivaldi Hutabarat**, pengembang dibalik aplikasi **Struktura**. Saya adalah mahasiswa **Teknik Informatika** di **Universitas Nasional PASIM Bandung**. Sebagai penerima **Program Beasiswa Bandung**, saya berkomitmen untuk menciptakan solusi digital yang bermanfaat bagi masyarakat dan komunitas organisasi.

### 🏫 Akademik & Fokus
- **Institusi**: Universitas Nasional PASIM Bandung
- **Program**: Program Beasiswa Pemberdayaan Umat Berkelanjutan (PUB)
- **Fokus Keahlian**: Full-stack Development, Software Architecture, & UI/UX Design.

### 🌐 Media Sosial & Kontak
Mari terhubung dan berdiskusi lebih lanjut mengenai teknologi atau kolaborasi proyek:

- **Github**: [pangeranvalerensco-maker](https://github.com/pangeranvalerensco-maker)
- **Instagram**: [@pangeranvalerensco](https://www.instagram.com/varelrivaldi_hutabarat/)
- **Facebook**: [Pangeran Valerensco](https://www.facebook.com/varel.rival.9)
- **YouTube**: [Pangeran Valerensco](https://www.youtube.com/@pangeranvalerensco9928)
- **Email**: [pangeranvalerensco@gmail.com](mailto:pangeranvalerensco@gmail.com)
- **WhatsApp**: [+62 821-8129-6229](https://wa.me/6282181296229)

---