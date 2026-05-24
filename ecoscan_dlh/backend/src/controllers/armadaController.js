const db = require('../config/database');

// 1. FUNGSI SIMPAN DATA (INSERT)
const saveArmada = async (req, res) => {
  try {
    const { namaPetugas, mandor, jenisArmada, wilayah, tarif, rfid } = req.body;

    // Membuat string QR Code unik (Variabel qrcodeValue)
    // Format: ECO - [Timestamp] - [Angka Random]
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const qrcodeValue = `ECO-${timestamp}-${randomNum}`;

    // Perintah SQL INSERT dengan 7 kolom (termasuk qrcode dan rfid)
    const sql = `INSERT INTO armada (namaPetugas, mandor, jenisArmada, wilayah, tarif, qrcode, rfid) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await db.execute(sql, [
      namaPetugas,
      mandor,
      jenisArmada,
      wilayah,
      tarif,
      qrcodeValue, // Memasukkan variabel ke kolom ke-6
      rfid || null, // RFID opsional
    ]);

    // Mengirim respon balik ke Frontend agar QR langsung muncul
    return res.status(201).json({
      success: true,
      message: 'Data armada dan QR Code berhasil disimpan!',
      data: {
        id: result.insertId,
        qrcode: qrcodeValue,
        rfid,
      },
    });
  } catch (error) {
    console.error('Kesalahan Database:', error);
    return res.status(500).json({
      success: false,
      message: `Gagal menyimpan ke database: ${error.message}`,
    });
  }
};

// 2. FUNGSI AMBIL DATA (SELECT)
const getArmada = async (req, res) => {
  try {
    // Mengambil semua data diurutkan dari yang terbaru
    const [rows] = await db.execute('SELECT * FROM armada ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Gagal mengambil data:', error);
    res.status(500).json({ message: 'Gagal mengambil data dari database' });
  }
};

// 3. FUNGSI HAPUS DATA (DELETE)
const deleteArmada = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM armada WHERE id = ?', [id]);
    res.status(200).json({
      success: true,
      message: 'Data armada berhasil dihapus',
    });
  } catch (error) {
    console.error('Gagal menghapus:', error);
    res.status(500).json({ message: 'Gagal menghapus data' });
  }
};

// 4. FUNGSI UPDATE RFID
const updateArmadaRFID = async (req, res) => {
  try {
    const { id } = req.params;
    const { rfid } = req.body;

    if (!rfid || rfid.trim() === '') {
      return res.status(400).json({ success: false, message: 'RFID tidak boleh kosong!' });
    }

    const rfidClean = rfid.trim().toUpperCase();

    // Cek apakah RFID sudah dipakai armada lain
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

    return res.status(200).json({
      success: true,
      message: `RFID berhasil diperbarui!`,
      data: { id, rfid: rfidClean },
    });
  } catch (error) {
    console.error('❌ updateArmadaRFID Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getArmada,
  saveArmada,
  deleteArmada,
  updateArmadaRFID,
};
