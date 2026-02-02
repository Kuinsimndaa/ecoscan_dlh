const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Mengambil Daftar Armada
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM armada ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('❌ GET /api/armada Error:', error);
    res.status(500).json({ message: 'Gagal mengambil data dari database' });
  }
});

// Registrasi Armada Baru
router.post('/', async (req, res) => {
  try {
    const { namaPetugas, mandor, jenisArmada, wilayah, tarif } = req.body;

    // Validasi input
    if (!namaPetugas || !mandor || !jenisArmada || !wilayah || !tarif) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi!',
      });
    }

    // Generate QR Code unik
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const qrcodeValue = `ECO-${timestamp}-${randomNum}`;

    // Insert ke database
    const sql = `INSERT INTO armada (namaPetugas, mandor, jenisArmada, wilayah, tarif, qrcode) 
                     VALUES (?, ?, ?, ?, ?, ?)`;

    const [result] = await db.execute(sql, [
      namaPetugas,
      mandor,
      jenisArmada,
      wilayah,
      tarif,
      qrcodeValue,
    ]);

    console.info('POST /api/armada Success - New Armada ID:', result.insertId);

    return res.status(201).json({
      success: true,
      message: 'Data armada dan QR Code berhasil disimpan!',
      data: {
        id: result.insertId,
        qrcode: qrcodeValue,
      },
    });
  } catch (error) {
    console.error('❌ POST /api/armada Error:', error);
    return res.status(500).json({
      success: false,
      message: `Gagal menyimpan data: ${error.message}`,
    });
  }
});

// Hapus Armada
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute('DELETE FROM armada WHERE id = ?', [id]);
    console.info('DELETE /api/armada/:id Success - Deleted ID:', id);

    res.status(200).json({
      success: true,
      message: 'Data armada berhasil dihapus',
    });
  } catch (error) {
    console.error('❌ DELETE /api/armada/:id Error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus data' });
  }
});

module.exports = router;
