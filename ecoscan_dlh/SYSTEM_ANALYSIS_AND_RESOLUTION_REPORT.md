# 📋 EcoScan-DLH - Laporan Analisis Sistem & Dokumentasi Resolusi Menyeluruh

Dokumen ini menyajikan analisis teknis menyeluruh, investigasi akar masalah (*Root Cause Analysis*), arsitektur sistem, dan resolusi perbaikan pada aplikasi **EcoScan-DLH** (Dinas Lingkungan Hidup Kabupaten Tegal).

---

## 📑 Daftar Isi
1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Arsitektur Sistem & Aliran Data](#2-arsitektur-sistem--aliran-data)
3. [Analisis Masalah & Resolusi Teknis](#3-analisis-masalah--resolusi-teknis)
   - [Masalah 1: Notifikasi Looping Tanpa Henti pada Scanner](#31-masalah-1-notifikasi-looping-tanpa-henti-pada-scanner)
   - [Masalah 2: Network Error 1270015000 di Production](#32-masalah-2-network-error-1270015000-di-production)
   - [Masalah 3: Autentikasi 401 & Sinkronisasi Database](#33-masalah-3-autentikasi-401--sinkronisasi-database)
   - [Masalah 4: CloudLinux cagefs_enter Unable to fork 4040](#34-masalah-4-cloudlinux-cagefs_enter-unable-to-fork-4040)
4. [Tindakan Keamanan & Tata Kelola Git](#4-tindakan-keamanan--tata-kelola-git)
5. [Standar Operasional Prosedur (SOP) Deployment](#5-standar-operasional-prosedur-sop-deployment)
6. [Matriks Verifikasi & Definition of Done](#6-matriks-verifikasi--definition-of-done)

---

## 1. Ringkasan Eksekutif

Aplikasi **EcoScan-DLH** adalah platform digital terintegrasi untuk pencatatan retribusi sampah, monitoring armada truk/gerobak sampah, dan otomasi pencatatan scan berbasis **QR Code** dan **RFID IoT (ESP32)**.

Dalam proses deployment dan pengujian di server produksi cPanel (`https://ecoscan-web.dev-myproject.my.id`), teridentifikasi beberapa kendala krusial:
1. Notifikasi scan di halaman petugas muncul berulang kali tanpa henti (*infinite notification loop*).
2. Kegagalan koneksi login akibat API mengarah ke *localhost* (`127.0.0.1:5000`).
3. Penolakan kredensial autentikasi (HTTP 401) akibat salah konfigurasi database dan perbedaan hash Bcrypt.
4. Server hosting macet dengan galat `cagefs_enter: Unable to fork` akibat kuota proses (*NPROC*) mencapai 100%.

Seluruh kendala tersebut telah diinvestigasi secara mendalam hingga ke tingkat kernel sistem operasi, basis data, dan siklus hidup komponen React. Kode telah diperbaiki, diuji, dan dinyatakan **berjalan normal 100%**.

---

## 2. Arsitektur Sistem & Aliran Data

```text
┌────────────────────────┐      ┌───────────────────────────┐
│     ESP32 Hardware     │      │   Browser / Mobile Client │
│  (MFRC522 RFID Reader) │      │      (React 18 + PWA)     │
└───────────┬────────────┘      └─────────────┬─────────────┘
            │ HTTPS POST                      │ HTTPS Requests
            │ (/api/scan/rfid-device)         │ (UI + Real-time Polling)
            ▼                                 ▼
┌───────────────────────────────────────────────────────────┐
│                cPanel / Phusion Passenger                 │
│              Express.js Monolith Backend                  │
│       (https://ecoscan-web.dev-myproject.my.id)           │
│                                                           │
│   ├── /api/auth   : Autentikasi, JWT & Auto-Migration    │
│   ├── /api/scan   : Transaksi Scan QR & RFID             │
│   ├── /api/armada : Manajemen Data Objek Retribusi       │
│   └── public/     : Static SPA Distribution (Vite Dist)   │
└───────────────────────────┬───────────────────────────────┘
                            │ MySQL Pool Connection
                            ▼
┌───────────────────────────────────────────────────────────┐
│                 MySQL Database (cPanel)                   │
│                [devk9924_ecoscan_db]                      │
│                                                           │
│   ├── users   : Akun Admin & Petugas (Bcrypt Password)   │
│   ├── armada  : Master Objek Retribusi & Pemetaan RFID   │
│   └── laporan : Transaksi scan harian & ritase kedatangan │
└───────────────────────────────────────────────────────────┘
```

---

## 3. Analisis Masalah & Resolusi Teknis

### 3.1. Masalah 1: Notifikasi Looping Tanpa Henti pada Scanner

#### Gejala
Saat membuka halaman Scanner Petugas (`/mandor/scanner`), notifikasi *“✓ SCAN BERHASIL”* terus-menerus muncul, bunyi *beep* berulang setiap beberapa detik, dan notifikasi tidak pernah menutup dengan bersih.

#### Akar Penyebab (Root Cause)
1. **Polling vs Durasi Notifikasi:** Polling data histori harian diatur setiap **2.000 ms** (2 detik). Durasi penutupan notifikasi adalah **3.000 ms** (3 detik). Polling baru selalu tiba sebelum timer notifikasi lama sempat menutup.
2. **Ketiadaan Idempotency Key:** Pengecekan hanya mengandalkan `latestScanId > latestScanIdRef.current`. Jika terjadi re-render atau sorting data dari backend berubah, transaksi lama dapat memicu notifikasi berulang.
3. **Timer Reset pada Component Lifecycle:** Fungsi `onClose={() => setNotification(null)}` dideklarasikan secara *inline*. Setiap render ulang membuat *function reference* baru, yang membatalkan `clearTimeout` dan me-restart timer dari detik ke-0.
4. **Ketiadaan Prop `key` di React:** Komponen `<Notification />` tidak diberi `key` unik, sehingga React mendaur ulang (*reusing*) instance lama tanpa mereset transisi animasi `isVisible`.

#### Resolusi Teknis
- **Implementasi `Set` Idempotency Tracking:** Pada file `Scanner.jsx`:
  ```javascript
  const notifiedScanIdsRef = useRef(new Set());
  // Whitelist seluruh scan histori yang ada saat pertama kali buka
  if (latestScanIdRef.current === null) {
    history.forEach((item) => {
      const idNum = Number(item.id);
      if (idNum) notifiedScanIdsRef.current.add(idNum);
    });
    latestScanIdRef.current = currentMaxId;
  }
  ```
  Setiap ID transaksi yang sudah pernah dinotifikasi disimpan dalam `Set`. Transaksi yang sama dijamin **hanya memicu notifikasi tepat 1 kali**.
- **Stabilisasi Timer & Lifecycle:** Pada `Notification.jsx`, callback `onClose` diisolasi menggunakan `useRef(onClose)`, Web Audio API dilindungi blok `try-catch`, dan ditambahkan *cleanup* ganda `closeTimer`.
- **Penambahan Unik `key`:** Seluruh pemanggilan `<Notification />` di `Scanner.jsx`, `Login.jsx`, `AddArmada.jsx`, `Billing.jsx`, dan `MonthlyReport.jsx` kini menyertakan `key={notification.id || Date.now()}`.

---

### 3.2. Masalah 2: Network Error `127.0.0.1:5000` di Production

#### Gejala
Saat membuka web di domain produksi `https://ecoscan-web.dev-myproject.my.id` dan mencoba login, muncul error pada console:
```text
POST http://127.0.0.1:5000/api/auth/login net::ERR_CONNECTION_REFUSED
API Error: undefined Network Error
```

#### Akar Penyebab (Root Cause)
Pada file `frontend/src/config/api.js`, nilai default *fallback* tertulis:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';
```
Ketika perintah `npm run build` dijalankan tanpa adanya file `.env` lokal, Vite mengompilasi string `'http://127.0.0.1:5000'` secara permanen ke dalam *bundle* produksi JavaScript (`dist/assets/index-*.js`). Browser klien pengguna kemudian mencoba menghubungi port 5000 di laptop/HP mereka sendiri, bukan ke server cPanel.

#### Resolusi Teknis
Mengubah konfigurasi API agar otomatis menggunakan **jalur relatif (`""`)** di lingkungan produksi:
```javascript
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL !== undefined && import.meta.env.VITE_API_BASE_URL !== ''
    ? import.meta.env.VITE_API_BASE_URL
    : (import.meta.env.PROD ? '' : 'http://localhost:3030');
```
Dengan arsitektur monolit Express di cPanel, seluruh request `/api/...` otomatis dialihkan ke host aktif saat ini (`https://ecoscan-web.dev-myproject.my.id`), sepenuhnya menghilangkan masalah CORS dan salah port.

---

### 3.3. Masalah 3: Autentikasi 401 & Sinkronisasi Database

#### Gejala
Permintaan login berhasil mencapai server cPanel, tetapi server mengembalikan status:
```text
POST .../api/auth/login 401 (Unauthorized)
Response: "Email atau Password salah!"
```

#### Akar Penyebab (Root Cause)
1. **Hash Bcrypt Satu Arah (*One-Way Hash*):** Kolom password pada tabel `users` di database `devk9924_ecoscan_db` berisi hash Bcrypt 10 rounds (`$2a$10$Rc9EA8Ez...`). Password yang dimasukkan di form login tidak cocok dengan teks asli yang menghasilkan hash tersebut.
2. **Ketergantungan `.env` Server:** Ketiadaan file `.env` yang valid sempat menyebabkan backend mencoba login sebagai user default MySQL `root` tanpa password, yang ditolak oleh sistem keamanan cPanel.

#### Resolusi Teknis
- Verifikasi keberadaan dan integritas file `.env` cPanel dengan konfigurasi database `devk9924_ecoscan_db` dan user `devk9924_ecoscan_user`.
- Mengonfirmasi fungsionalitas algoritma verifikasi password di `authRoutes.js`:
  ```javascript
  // Jika password di DB berupa teks biasa, lakukan verifikasi dan langsung migrasi ke Bcrypt
  if (user.password === plainPassword) {
    const hashed = await bcrypt.hash(plainPassword, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);
    return true;
  }
  ```
- Disediakan hash Bcrypt resmi yang valid untuk kata sandi default `admin123` dan `petugas123`.

---

### 3.4. Masalah 4: CloudLinux `cagefs_enter: Unable to fork` (40/40)

#### Gejala
Saat mengelola aplikasi di cPanel atau membuka phpMyAdmin, muncul galat fatal:
```text
cagefs_enter: Unable to fork. User has reached resource limits (PMEM, number of processes).
```
Dashboard cPanel menunjukkan metrik:
```text
Number Of Processes: 40 / 40 (100%) [Warna Merah]
```

#### Akar Penyebab (Root Cause)
Hosting cPanel (Rumahweb) beroperasi di atas OS CloudLinux dengan pembatasan LVE (kuota maksimal 40 proses Linux simultan per akun). Proses **`Installing NPM...`** yang dipicu dari antarmuka web cPanel men-spawn puluhan sub-proses kompilasi dan download di latar belakang. Karena kuota 40 proses terpenuhi 100%, kernel Linux menolak memanggil panggilan sistem `fork()`, melumpuhkan eksekusi terminal dan phpMyAdmin.

#### Resolusi Teknis
- Menghentikan sementara proses Node.js aplikasi untuk me-release seluruh *child process* yang menggantung.
- Kuota proses turun kembali ke batas aman (~3 proses).
- **Rekomendasi Arsitektural:** Membangun aturan baku bahwa instalasi dependensi berat dan *build* produksi wajib dilakukan di mesin lokal developer, bukan di terminal shared hosting.

---

## 4. Tindakan Keamanan & Tata Kelola Git

Sesuai instruksi pengguna: **File arsip kompresi (`.tar.gz`) tidak boleh di-push ke repository Git.**

### Pembaruan `.gitignore`
Aturan pengabaian telah diperbarui pada file root `.gitignore` dan `ecoscan_dlh/.gitignore`:
```gitignore
# Build & Deployment artifacts & archives
*.tar.gz
*.tgz
*.tar
*.zip
public-dashboard-fix.tar.gz
ecoscan_deploy.tar.gz
ecoscan_deploy_frontend.zip
dist/
build/
```

### Hasil Verifikasi Git Status
Menjalankan `git status` memastikan bahwa file `public-dashboard-fix.tar.gz` (berukuran ~1.47 MB) **tidak lagi terdeteksi** dalam daftar berkas *Untracked*, sehingga aman dari `git add .` dan `git push`.

---

## 5. Standar Operasional Prosedur (SOP) Deployment

Untuk pembaruan frontend berikutnya ke server cPanel:

1. **Build di Lokal:**
   ```bash
   cd ecoscan_dlh/frontend
   npm run build
   ```
2. **Sinkronkan ke Direktori Backend:**
   ```powershell
   Remove-Item -Recurse -Force ..\backend\public\*
   Copy-Item -Recurse -Force dist\* ..\backend\public\
   ```
3. **Kemas File Distribusi:**
   ```powershell
   Push-Location ..\backend
   tar -czvf "..\..\public-dashboard-fix.tar.gz" public
   Pop-Location
   ```
4. **Deploy ke cPanel:**
   - Unggah `public-dashboard-fix.tar.gz` ke direktori `public_html/ecoscan-web` di File Manager cPanel.
   - Hapus atau kosongkan folder `public` lama.
   - Ekstrak arsip `public-dashboard-fix.tar.gz`.
   - Lakukan *Hard Reload* browser (`Ctrl + F5` atau `Ctrl + Shift + R`).

---

## 6. Matriks Verifikasi & Definition of Done

| Komponen / Skenario | Kondisi Sebelum | Kondisi Sesudah | Status |
|---|---|---|---|
| **Notifikasi Scanner** | Berkedip dan bunyi terus setiap 2 detik | Muncul 1x selama 3 detik, menutup mulus | ✅ Selesai |
| **PWA Service Worker** | Cache v5, URL fetch hardcode port 3030 | Cache v6, URL fetch relatif `/api/scan/save` | ✅ Selesai |
| **API Target URL** | Hardcoded `http://127.0.0.1:5000` | Dinamis relatif (`""` di production) | ✅ Selesai |
| **Autentikasi Login** | Error 401 Unauthorized | Validasi password cocok, login sukses 200 OK | ✅ Selesai |
| **Stabilitas Server** | Limit proses 40/40 (Unable to fork) | Normal kembali (~3 proses aktif) | ✅ Selesai |
| **Git Hygiene** | Arsip `.tar.gz` berisiko ter-commit | Di-ignore sepenuhnya oleh `.gitignore` | ✅ Selesai |

---

*Laporan ini disusun sebagai dokumentasi resmi dan referensi pemeliharaan sistem EcoScan-DLH.*
