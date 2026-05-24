const express = require('express');
const router = express.Router();
const {
  saveScan,
  saveRFIDScan,
  getTodayHistory,
  getPendingUID,
  getLaporan,
  getDashboardStats,
  generateBilling,
  deleteLaporan,
} = require('../controllers/TransactionController');

/**
 * Jalur Lengkap: POST http://localhost:5000/api/scan/rfid-save
 * Digunakan untuk memproses hasil scan RFID dari RFID Reader
 */
router.post('/rfid-save', saveRFIDScan);

/**
 * Jalur Lengkap: POST http://localhost:5000/api/scan/rfid-device
 * Digunakan oleh device ESP32 untuk mengirim data UID RFID
 */
router.post('/rfid-device', require('../controllers/TransactionController').saveDeviceRFIDScan);

/**
 * Jalur Lengkap: POST http://localhost:5000/api/scan/save
 * Digunakan untuk memproses hasil scan dari Scanner.jsx
 */
router.post('/save', saveScan);

/**
 * Jalur Lengkap: DELETE http://localhost:5000/api/scan/laporan/:id
 * HARUS SEBELUM GET /laporan karena route parameter spesifik harus didahulukan
 * Digunakan untuk menghapus satu record laporan
 * Param: id (ID dari tabel laporan)
 */
router.delete('/laporan/:id', deleteLaporan);

/**
 * Jalur Lengkap: GET http://localhost:5000/api/scan/laporan
 * Digunakan untuk Dashboard dan Rekapan Laporan
 * Query: ?tanggal=YYYY-MM-DD atau ?bulan=YYYY-MM
 */
router.get('/laporan', getLaporan);

/**
 * Jalur Lengkap: GET http://localhost:5000/api/scan/dashboard-stats
 * Digunakan untuk Dashboard Admin (data hari ini)
 */
router.get('/dashboard-stats', getDashboardStats);

/**
 * Jalur Lengkap: GET http://localhost:5000/api/scan/today-history
 * Digunakan oleh Scanner.jsx untuk polling histori scan hari ini
 */
router.get('/today-history', getTodayHistory);

/**
 * Jalur Lengkap: GET http://localhost:5000/api/scan/pending-uid
 * Digunakan oleh AddArmada form untuk polling UID kartu tidak terdaftar
 * (auto-fill RFID field saat tap kartu ke ESP32)
 */
router.get('/pending-uid', getPendingUID);

/**
 * Jalur Lengkap: POST http://localhost:5000/api/scan/generate-billing
 */
router.post('/generate-billing', generateBilling);

module.exports = router;
