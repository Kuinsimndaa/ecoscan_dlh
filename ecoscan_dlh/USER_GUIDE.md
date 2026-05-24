# 📖 USER GUIDE - EcoScan-DLH

## Daftar Isi
1. [Pendahuluan](#pendahuluan)
2. [Fitur Login Dengan CAPTCHA](#fitur-login-dengan-captcha)
3. [Halaman Admin Dashboard](#halaman-admin-dashboard)
4. [Halaman Tambah Armada](#halaman-tambah-armada)
5. [Halaman Rekapan Laporan](#halaman-rekapan-laporan)
6. [Halaman Mandor Dashboard](#halaman-mandor-dashboard)
7. [FAQ](#faq)

---

## 👋 Pendahuluan

**EcoScan-DLH** adalah aplikasi web untuk manajemen armada dan pencatatan scan kendaraan lingkungan. Aplikasi ini memiliki dua role:
- **Admin**: Mengelola armada, melihat laporan
- **Mandor**: Mencatat scan kendaraan, melihat riwayat

---

## 🔐 Fitur Login Dengan CAPTCHA

### Langkah Login Baru
1. **Buka halaman login** di `http://localhost:5050/`
2. **Pilih role**: Admin atau Petugas
3. **Masukkan email dan password**

### ✅ CAPTCHA Verification (BARU!)
4. **Lihat kode CAPTCHA** di bagian bawah form
   - Menampilkan kode 6 karakter random (huruf A-Z dan angka 0-9)
   - Contoh: `A3B9KX`

5. **Ketik kode CAPTCHA** di input field
   - Input case-insensitive (besar/kecil sama)
   - Jika benar → ✓ (centang hijau)
   - Jika salah → ✗ (silang merah)

6. **Setelah CAPTCHA verified**, tombol "Login" akan aktif (tidak lagi disabled)

7. **Klik tombol Login** untuk masuk

### Tips CAPTCHA
- Jika kesalahan, kosongkan field dan coba lagi
- Klik tombol refresh 🔄 di samping CAPTCHA untuk kode baru
- CAPTCHA otomatis di-reset setelah 3 attempt

**Benefit:** Melindungi akun dari akses tidak sah / bot otomatis

---

## 📊 Halaman Admin Dashboard

### Tampilan Halaman
- **Navbar atas**: Logo, nama aplikasi, profil user, logout
- **Sidebar kiri**: Menu navigasi (Dashboard, Tambah Armada, Rekapan Laporan)
- **Konten utama**: Dashboard chart dan statistik

### Menu di Sidebar
1. 🏠 **Dashboard** - Lihat statistik & overview
2. ➕ **Tambah Armada** - Kelola data armada
3. 📋 **Rekapan Laporan** - Lihat & export laporan

### Logout
- Klik nama/email di navbar atas
- Klik "Logout"
- Akan di-redirect ke halaman login

---

## ➕ Halaman Tambah Armada

### Fitur Utama

#### 1️⃣ Daftar Armada (Table)
Menampilkan semua armada yang sudah terdaftar

**Kolom:**
- **No** - Nomor urut
- **Nama Petugas** - Nama pemilik armada
  - *Sub-text: Jenis Armada • Wilayah (hijau kecil)*
- **Mandor** - Nama mandor pengawas
- **Tarif** - Biaya per transaksi (Rp)
- **Aksi** - Tombol aksi

**Tombol di Aksi:**
- 👁️ **View** - Lihat detail armada
- 🎯 **QR Code** - Lihat/download QR code armada
- 🗑️ **Delete** - Hapus armada (dengan konfirmasi)

#### 2️⃣ Fitur Pencarian (BARU!)
- **Search box** di kanan atas tabel
- Ketik nama petugas untuk filter
- Filter real-time (langsung saat ketik)
- Case-insensitive (besar/kecil sama)

**Contoh:**
- Cari "Budi" → tampil semua armada dengan petugas "Budi"
- Cari "budI" → hasil sama (case-insensitive)

#### 3️⃣ Form Daftarkan Armada
Di atas tabel ada form untuk tambah armada baru

**Field yang diisi:**
- **Nama Petugas** - Nama driver/petugas
- **Jenis Armada** - Pilih tipe (Dump Truck, Tanki, dll)
- **Wilayah** - Pilih wilayah operasi
- **Mandor** - Nama mandor pengawas
- **Tarif** - Biaya per trip

**Tombol:**
- ✅ **Submit** - Simpan armada baru
- 🎯 **Generate QR** - Buat QR code (otomatis setelah submit)

### Fitur Delete (DIPERBAIKI!)
**Masalah sebelumnya:** Tombol delete hanya bisa diklik sekali

**Solusi:** Sekarang bisa diklik berkali-kali
- Klik 🗑️ → Modal konfirmasi muncul
- Pilih "Hapus" untuk confirm → data hilang
- Atau "Batal" untuk cancel

**Proses:**
1. Klik tombol 🗑️ di kolom Aksi
2. Modal pop-up muncul: "Apakah Anda yakin ingin menghapus armada ini?"
3. Pilih:
   - **Hapus** (merah) → Armada terhapus dari database
   - **Batal** (abu-abu) → Batalkan, kembali ke tabel
4. Setelah delete, bisa delete armada lain lagi (sudah diperbaiki!)

### Layout Tabel (DIPERBAIKI!)
**Sebelumnya:** Tabel terlalu lebar, perlu scroll ke kanan

**Sekarang:** Lebih compact & fit screen
- Kolom dikurangi (8 → 5 kolom)
- Jenis Armada & Wilayah dijadikan sub-text di bawah Nama Petugas
- Semua info tetap terlihat
- Mobile-friendly

---

## 📋 Halaman Rekapan Laporan

### Fitur Utama

#### 1️⃣ Filter Laporan
Di atas tabel ada filter tanggal:
- **Pilih bulan & tahun** (dropdown)
- Tabel otomatis update menampilkan data periode tersebut

#### 2️⃣ Tabel Laporan
Menampilkan semua scan/transaksi

**Kolom:**
- **Tanggal/Waktu** - Kapan scan dilakukan
  - Format: DD-MM-YYYY HH:MM
- **Nama Petugas** - Siapa yang scan
  - *Sub-text: Jenis Armada • Wilayah (hijau kecil)*
- **Mandor** - Nama mandor pengawas
- **Total Masuk** - Berapa banyak item yang di-scan
- **Tarif** - Biaya per transaksi
- **Aksi** - Tombol aksi

#### 3️⃣ Tombol Aksi
- 🗑️ **Delete** - Hapus laporan transaksi (dengan konfirmasi)

**Delete Laporan:**
1. Klik 🗑️ di kolom Aksi
2. Modal konfirmasi muncul
3. Pilih "Hapus" atau "Batal"
4. Bisa delete laporan lain setelah itu (sudah diperbaiki!)

#### 4️⃣ Export Excel (BARU!)
- Tombol **Export** di atas tabel
- Klik → Download file Excel (.xlsx)
- Berisi semua data laporan periode yang dipilih

**Fitur Export:**
- ✅ Otomatis filter sesuai bulan/tahun
- ✅ Format Excel profesional
- ✅ Filename: `Laporan_MM-YYYY.xlsx`
- ✅ Jika data kosong → error message

### Layout Tabel (DIPERBAIKI!)
Sama seperti AddArmada:
- Lebih compact (6 kolom)
- Jenis Armada & Wilayah sebagai sub-text
- Fit screen, no horizontal scroll
- Mobile-friendly

---

## 👷 Halaman Mandor Dashboard

### Tampilan
- **Sidebar kiri**: Menu untuk Mandor (Dashboard, Scanner, History, Activity Log)
- **Konten**: Dashboard chart & statistik

### Menu Mandor
1. 🏠 **Dashboard** - Statistik & overview
2. 📱 **Scanner** - Scan QR code armada
3. 📜 **History** - Riwayat scan yang sudah dilakukan
4. 📊 **Activity Log** - Log aktivitas detail

### Fitur Scanner
- Buka kamera device
- Scan QR code armada
- Otomatis input data scan
- Simpan ke database
- Bisa download laporan scan

### Fitur History
- Lihat semua scan yang sudah dilakukan
- Filter berdasarkan tanggal
- Lihat detail scan (petugas, armada, waktu, total)

---

## ❓ FAQ

### Keamanan
**Q: Kenapa ada CAPTCHA saat login?**
A: Untuk melindungi akun dari akses tidak sah dan bot otomatis. CAPTCHA harus diverifikasi sebelum bisa login.

**Q: Bagaimana jika lupa password?**
A: Hubungi admin untuk reset password. Belum ada fitur self-service reset.

**Q: Apakah data aman?**
A: Data disimpan di server MySQL terenkripsi. Password di-hash sebelum disimpan.

### Fitur
**Q: Bagaimana cara mencari armada?**
A: Di halaman Tambah Armada, ada search box di kanan atas tabel. Ketik nama petugas untuk filter.

**Q: Bisa delete armada berkali-kali?**
A: Ya! Sebelumnya ada bug tapi sudah diperbaiki. Sekarang bisa klik tombol delete lagi setelah delete yang pertama.

**Q: Bagaimana export laporan?**
A: Di halaman Rekapan Laporan, ada tombol "Export" di atas tabel. Klik untuk download Excel.

**Q: Data apa saja di tabel?**
A: Menampilkan: Tanggal, Nama Petugas, Mandor, Total Masuk, dan Tarif per transaksi.

### Troubleshooting
**Q: Tidak bisa login padahal password benar?**
A: 
1. Pastikan CAPTCHA sudah diverifikasi (centang ✓ muncul)
2. Pastikan email & password sesuai
3. Refresh halaman dan coba lagi
4. Clear browser cache (Ctrl+Shift+Delete)

**Q: Tombol Delete tidak bisa diklik?**
A: Sebelumnya ada bug, tapi sudah diperbaiki di versi terbaru. Update aplikasi Anda.

**Q: Tabel tidak bisa di-scroll?**
A: Normal! Tabel sudah di-optimize untuk fit screen. Jika ada data yang tidak terlihat, lihat di sub-text (teks kecil di bawah).

**Q: Export Excel kosong atau error?**
A: Pastikan ada data di periode yang dipilih. Jika masih error, hubungi admin.

**Q: Halaman lambat/loading lama?**
A: 
1. Cek koneksi internet
2. Coba refresh halaman (F5)
3. Close tab lain yang membuka aplikasi yang sama
4. Clear browser cache

### Technical
**Q: Aplikasi berjalan di mana?**
A: 
- Frontend: `http://localhost:5050/` (atau URL deployment)
- Backend API: `http://localhost:5000/`

**Q: Bagaimana jika ada error?**
A: 
1. Buka DevTools (F12)
2. Lihat error message di Console
3. Screenshot dan report ke admin
4. Cek apakah backend berjalan

---

## 📞 Support

Jika ada pertanyaan atau menemukan bug:
1. Hubungi admin langsung
2. Atau buka issue di GitHub: https://github.com/Kuinsimndaa/EcoScan-DLH/issues

---

## 📚 Related Resources

- [README.md](./README.md) - Informasi umum aplikasi
- [CHANGELOG.md](./CHANGELOG.md) - Daftar perubahan & fitur baru
- [TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md) - Dokumentasi teknis untuk developer
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Panduan deployment

---

**Last Updated:** 2025
**Version:** 1.1.0

