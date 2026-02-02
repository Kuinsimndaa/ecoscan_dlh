# 🌿 EcoScan-DLH

**EcoScan-DLH** adalah sistem manajemen operasional armada kebersihan untuk Dinas Lingkungan Hidup (DLH). Aplikasi ini dirancang untuk mendigitalisasi proses pemantauan armada, pencatatan transaksi sampah, dan pelaporan harian secara real-time.

---

## 🚀 Fitur Utama

* **PWA Ready:** Dapat diinstal di Android/iOS layaknya aplikasi native.
* **Scanner QR Code:** Memudahkan Mandor dalam melakukan scan armada di lapangan.
* **Dashboard Admin:** Visualisasi data statistik operasional armada dan total volume sampah.
* **Manajemen Armada:** Pengelolaan data truk dan petugas (sopir/kenek).
* **Laporan Otomatis:** Export laporan bulanan dan harian untuk keperluan administratif.

## 🛠️ Teknologi yang Digunakan

### Frontend
* **React.js** (Vite)
* **Tailwind CSS** (Styling)
* **Framer Motion** (Animasi)

### Backend
* **Node.js & Express**
* **MySQL** (Database)
* **JSON Web Token (JWT)** (Autentikasi)

---

## 📦 Struktur Folder

```text
EcoScan-DLH/
├── backend/     # Express API & Konfigurasi Database
└── frontend/    # React (Vite) & UI Components

## 🛠️ Panduan Admin & Maintenance

Bagian ini ditujukan untuk Tim IT DLH dalam melakukan konfigurasi ulang:
1. Pastikan Node.js dan MySQL sudah terinstal di server.
2. Clone repository dan lakukan instalasi library (`npm install`).
3. Konfigurasi file `.env` sesuai dengan database server DLH.
4. Build frontend menggunakan `npm run build` untuk mendapatkan performa terbaik.