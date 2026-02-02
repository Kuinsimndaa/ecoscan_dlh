const express = require('express');
const router = express.Router();
const {
  saveScan,
  getLaporan,
  getDashboardStats,
  generateBilling,
  deleteLaporan,
} = require('../controllers/TransactionController');

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
 * Jalur Lengkap: POST http://localhost:5000/api/scan/generate-billing
 * Digunakan untuk generate dan save billing ke tabel id_billing
 * Query: ?bulan=YYYY-MM atau ?tanggal=YYYY-MM-DD
 */
router.post('/generate-billing', generateBilling);

module.exports = router;
