-- =====================================================
-- MIGRATION: Tambah kolom metode_scan di tabel laporan
-- Jalankan file ini via salah satu cara di bawah:
--   1. Docker: docker exec -i ecoscan-mysql mariadb -u root -p[PASSWORD] dlh_ecoscan < migration_add_metode_scan.sql
--   2. TablePlus / DBeaver: Import dan Run file ini
--   3. phpMyAdmin: Paste ke SQL tab
-- =====================================================

ALTER TABLE laporan 
  ADD COLUMN IF NOT EXISTS metode_scan ENUM('QR','RFID') DEFAULT 'QR' AFTER qrcode;

-- Verifikasi berhasil:
SHOW COLUMNS FROM laporan LIKE 'metode_scan';
