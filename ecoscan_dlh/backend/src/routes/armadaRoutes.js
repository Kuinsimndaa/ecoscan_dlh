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
    const { namaPetugas, mandor, jenisArmada, wilayah, tarif, rfid } = req.body;

    if (!namaPetugas || !mandor || !jenisArmada || !wilayah || !tarif) {
      return res.status(400).json({ success: false, message: 'Semua field harus diisi!' });
    }

    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const qrcodeValue = `ECO-${timestamp}-${randomNum}`;
    const rfidClean = rfid ? rfid.trim().toUpperCase() : null;

    const sql = `INSERT INTO armada (namaPetugas, mandor, jenisArmada, wilayah, tarif, qrcode, rfid)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await db.execute(sql, [
      namaPetugas, mandor, jenisArmada, wilayah, tarif, qrcodeValue, rfidClean,
    ]);

    console.info('POST /api/armada Success - ID:', result.insertId, '| RFID:', rfidClean || 'none');

    return res.status(201).json({
      success: true,
      message: 'Data armada dan QR Code berhasil disimpan!',
      data: { id: result.insertId, qrcode: qrcodeValue, rfid: rfidClean },
    });
  } catch (error) {
    console.error('❌ POST /api/armada Error:', error);
    return res.status(500).json({ success: false, message: `Gagal menyimpan data: ${error.message}` });
  }
});

// Update RFID Armada
router.put('/:id/rfid', async (req, res) => {
  try {
    const { id } = req.params;
    const { rfid } = req.body;

    if (!rfid || rfid.trim() === '') {
      return res.status(400).json({ success: false, message: 'RFID tidak boleh kosong!' });
    }

    const rfidClean = rfid.trim().toUpperCase();

    // Cek duplikat
    const [existing] = await db.execute(
      'SELECT id, namaPetugas FROM armada WHERE rfid = ? AND id != ?',
      [rfidClean, id]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: `UID ${rfidClean} sudah dipakai oleh armada ${existing[0].namaPetugas}!`,
      });
    }

    await db.execute('UPDATE armada SET rfid = ? WHERE id = ?', [rfidClean, id]);
    console.info(`PUT /api/armada/${id}/rfid → ${rfidClean}`);

    return res.status(200).json({ success: true, message: 'RFID berhasil diperbarui!', rfid: rfidClean });
  } catch (error) {
    console.error('❌ PUT /api/armada/:id/rfid Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Hapus Armada
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[BACKEND] Menghapus armada ID: ${id}`);
    
    const [result] = await db.execute('DELETE FROM armada WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      console.warn(`[BACKEND] Tidak ada armada dengan ID: ${id}`);
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }

    console.info(`[BACKEND] Berhasil menghapus ID: ${id}`);
    res.status(200).json({ success: true, message: 'Data armada berhasil dihapus' });
  } catch (error) {
    console.error('❌ [BACKEND] DELETE Error:', error.message);
    res.status(500).json({ success: false, message: `Gagal menghapus: ${error.message}` });
  }
});

module.exports = router;
