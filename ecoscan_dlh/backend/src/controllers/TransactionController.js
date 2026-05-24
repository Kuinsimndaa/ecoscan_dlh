const db = require('../config/database'); // Sesuaikan nama file

const rfidService = require('../services/rfidService');

/**
 * Helper function untuk mendapatkan tanggal hari ini dengan timezone lokal (Indonesia UTC+7)
 * Mengembalikan format YYYY-MM-DD
 * Method: Menggunakan locale string untuk Indonesia
 */
const getTodayLocalDate = () => {
  // Gunakan toLocaleString dengan timezone Asia/Jakarta
  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(new Date());
  const year = parts.find((p) => p.type === 'year').value;
  const month = parts.find((p) => p.type === 'month').value;
  const day = parts.find((p) => p.type === 'day').value;

  return `${year}-${month}-${day}`;
};

const saveScan = async (req, res) => {
  try {
    const { qrcode } = req.body;
    const qrcodeClean = qrcode.trim();
    const hariIni = getTodayLocalDate();

    console.info(`TODAY DATE (JAKARTA TZ): ${hariIni}`);

    // 1. Cari armada
    const [armadaRows] = await db.execute('SELECT * FROM armada WHERE qrcode = ?', [qrcodeClean]);

    if (armadaRows.length === 0) {
      return res.status(404).json({ success: false, message: 'QR Code tidak terdaftar!' });
    }

    const data = armadaRows[0];

    // 2. Cek Ritase
    const [ritaseRows] = await db.execute(
      'SELECT COUNT(*) as total FROM laporan WHERE qrcode = ? AND tanggal = ?',
      [qrcodeClean, hariIni]
    );
    const kedatanganKe = ritaseRows[0].total + 1;

    // 3. Simpan Transaksi
    const sqlInsert = `
            INSERT INTO laporan (qrcode, metode_scan, namaPetugas, jenisArmada, wilayah, tarif, mandor, tanggal, waktu, kedatanganKe) 
            VALUES (?, 'QR', ?, ?, ?, ?, ?, ?, CURTIME(), ?)
        `;

    await db.execute(sqlInsert, [
      qrcodeClean,
      data.namaPetugas,
      data.jenisArmada,
      data.wilayah,
      data.tarif,
      data.mandor,
      hariIni,
      kedatanganKe,
    ]);

    console.info(`SCAN SAVED: QRCode: ${qrcodeClean}, Petugas: ${data.namaPetugas}`);
    return res.status(200).json({ success: true, message: 'Scan berhasil dicatat!' });
  } catch (error) {
    console.error('❌ Scan Error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memproses data' });
  }
};

const getLaporan = async (req, res) => {
  try {
    const { tanggal, bulan } = req.query;
    let query = 'SELECT * FROM laporan WHERE 1=1';
    const params = [];

    // Filter berdasarkan tanggal
    if (tanggal) {
      query += ' AND tanggal = ?';
      params.push(tanggal);
    }

    // Filter berdasarkan bulan (format: YYYY-MM)
    if (bulan) {
      query += ' AND DATE_FORMAT(tanggal, "%Y-%m") = ?';
      params.push(bulan);
    }

    query += ' ORDER BY id DESC';

    const [rows] = await db.execute(query, params);
    console.info(
      `LAPORAN FETCHED: ${rows.length} records (tanggal: ${tanggal}, bulan: ${bulan})`
    );

    // Mapping field agar sesuai dengan frontend expectation
    const mappedRows = rows.map((row) => {
      // Format tanggal: YYYY-MM-DD (gunakan string langsung dari database, jangan convert lagi)
      // Database sudah menyimpan dalam format YYYY-MM-DD, tidak perlu ubah lagi
      let tanggalStr = row.tanggal;
      if (row.tanggal instanceof Date) {
        // Jika masih Date object, format dengan Intl untuk timezone lokal
        const formatter = new Intl.DateTimeFormat('id-ID', {
          timeZone: 'Asia/Jakarta',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        const parts = formatter.formatToParts(row.tanggal);
        const year = parts.find((p) => p.type === 'year').value;
        const month = parts.find((p) => p.type === 'month').value;
        const day = parts.find((p) => p.type === 'day').value;
        tanggalStr = `${year}-${month}-${day}`;
      }

      return {
        id: row.id,
        qrcode: row.qrcode,
        namaPengendara: row.namaPetugas,
        jenisKendaraan: row.jenisArmada,
        wilayah: row.wilayah,
        tarif: row.tarif,
        mandor: row.mandor,
        tanggalLengkap: tanggalStr,
        waktu: row.waktu,
        metodeScan: row.metode_scan || 'QR',
        kedatanganKe: row.kedatanganKe,
      };
    });

    res.status(200).json(mappedRows);
  } catch (error) {
    console.error('❌ Laporan Error:', error);
    res.status(500).json({ message: 'Gagal ambil laporan' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const hariIni = getTodayLocalDate();

    // 1. Total Kedatangan Hari Ini
    const [totalRows] = await db.execute(
      'SELECT COUNT(*) as total FROM laporan WHERE tanggal = ?',
      [hariIni]
    );
    const totalKedatangan = totalRows[0]?.total || 0;

    // 2. Armada Beroperasi Hari Ini (Unik)
    const [armadaRows] = await db.execute(
      'SELECT COUNT(DISTINCT qrcode) as total FROM laporan WHERE tanggal = ?',
      [hariIni]
    );
    const armadaBeroperasi = armadaRows[0]?.total || 0;

    // 3. Recent Activity (15 terbaru)
    const [recentRows] = await db.execute(
      'SELECT id, namaPetugas, jenisArmada, wilayah, tarif, mandor, waktu, kedatanganKe, metode_scan FROM laporan WHERE tanggal = ? ORDER BY id DESC LIMIT 15',
      [hariIni]
    );

    // Map recent activity for frontend expectation
    const recentActivity = recentRows.map((row) => ({
      id: row.id,
      namaPengendara: row.namaPetugas,
      jenisKendaraan: row.jenisArmada,
      wilayah: row.wilayah,
      tarif: row.tarif,
      mandor: row.mandor,
      waktu: row.waktu,
      metodeScan: row.metode_scan || 'QR',
      kedatanganKe: row.kedatanganKe,
    }));

    // Hitung total tarif hari ini
    const [totalTarifRows] = await db.execute(
      'SELECT SUM(tarif) as total FROM laporan WHERE tanggal = ?',
      [hariIni]
    );
    const totalTarif = totalTarifRows[0]?.total || 0;

    console.info(`DASHBOARD STATS LOADED: ${totalKedatangan} scans, ${armadaBeroperasi} armada`);

    return res.status(200).json({
      success: true,
      totalKedatangan,
      armadaBeroperasi,
      recentActivity,
      totalTarif,
    });
  } catch (error) {
    console.error('❌ Dashboard Stats Error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memuat statistik' });
  }
};

const getExportData = async (req, res) => {
  try {
    const { bulan, tanggal } = req.query;

    let query =
      'SELECT l.tanggal, l.qrcode, l.namaPetugas as mandor, l.tarif FROM laporan l WHERE 1=1';
    const params = [];

    if (tanggal) {
      query += ' AND l.tanggal = ?';
      params.push(tanggal);
    } else if (bulan) {
      query += ' AND DATE_FORMAT(l.tanggal, "%Y-%m") = ?';
      params.push(bulan);
    }

    query += ' ORDER BY l.tanggal DESC, l.waktu DESC';

    const [data] = await db.execute(query, params);
    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Export Error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memuat data export' });
  }
};

const generateBilling = async (req, res) => {
  try {
    const { bulan, tanggal } = req.query;
    let filterQuery = 'WHERE 1=1';
    const params = [];

    // Tentukan periode
    let periodeStr = '';
    if (bulan) {
      filterQuery += ' AND DATE_FORMAT(tanggal, "%Y-%m") = ?';
      params.push(bulan);
      periodeStr = bulan;
    } else if (tanggal) {
      filterQuery += ' AND tanggal = ?';
      params.push(tanggal);
      periodeStr = tanggal;
    } else {
      return res
        .status(400)
        .json({ success: false, message: 'Parameter bulan atau tanggal harus ada' });
    }

    // 1. Ambil data laporan untuk periode tersebut
    const [laporanData] = await db.execute(
      `SELECT namaPetugas, jenisArmada, wilayah, mandor, tarif FROM laporan ${filterQuery}`,
      params
    );

    if (laporanData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Tidak ada data laporan untuk periode ini' });
    }

    // 2. Group data berdasarkan namaPetugas
    const grouped = laporanData.reduce((acc, curr) => {
      const key = curr.namaPetugas;
      if (!acc[key]) {
        acc[key] = {
          namaPetugas: curr.namaPetugas,
          jenisArmada: curr.jenisArmada,
          wilayah: curr.wilayah,
          mandor: curr.mandor,
          tarifSatuan: curr.tarif,
          jumlahKedatangan: 0,
          totalTagihan: 0,
        };
      }
      acc[key].jumlahKedatangan += 1;
      acc[key].totalTagihan += Number(curr.tarif);
      return acc;
    }, {});

    // 3. Hapus billing lama untuk periode yang sama
    await db.execute('DELETE FROM id_billing WHERE periode_bulan = ? OR periode_tanggal = ?', [
      bulan || null,
      tanggal || null,
    ]);
    console.info(`DELETED OLD BILLING DATA FOR PERIODE: ${periodeStr}`);

    // 4. Insert data billing ke database
    const promises = Object.values(grouped).map(async (data) => {
      const sqlInsert = `
                INSERT INTO id_billing 
                (periode_bulan, periode_tanggal, nama_petugas, jenis_armada, wilayah, mandor, tarif_satuan, jumlah_kedatangan, total_tagihan, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
            `;

      return db.execute(sqlInsert, [
        bulan || null,
        tanggal || null,
        data.namaPetugas,
        data.jenisArmada,
        data.wilayah,
        data.mandor,
        data.tarifSatuan,
        data.jumlahKedatangan,
        data.totalTagihan,
      ]);
    });

    await Promise.all(promises);
    const insertedCount = promises.length;

    console.info(`BILLING GENERATED: ${insertedCount} records for periode ${periodeStr}`);
    return res.status(200).json({
      success: true,
      message: `Billing berhasil di-generate untuk ${insertedCount} petugas`,
      data: {
        periode: periodeStr,
        jumlahPetugas: insertedCount,
        totalBilling: Object.values(grouped).reduce((sum, item) => sum + item.totalTagihan, 0),
      },
    });
  } catch (error) {
    console.error('❌ Generate Billing Error:', error);
    res.status(500).json({ success: false, message: `Gagal generate billing: ${error.message}` });
  }
};

/**
 * DELETE /api/scan/laporan/:id
 * Hapus satu record laporan berdasarkan ID
 */
const deleteLaporan = async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi ID
    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID laporan tidak valid',
      });
    }

    // Cek apakah record ada
    const [checkRows] = await db.execute('SELECT id FROM laporan WHERE id = ?', [id]);
    if (checkRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data laporan tidak ditemukan',
      });
    }

    // Hapus record
    const [result] = await db.execute('DELETE FROM laporan WHERE id = ?', [id]);

    if (result.affectedRows > 0) {
      console.info(`LAPORAN DELETED: ID ${id}`);
      return res.status(200).json({
        success: true,
        message: 'Data laporan berhasil dihapus',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus data laporan',
    });
  } catch (error) {
    console.error('❌ Delete Laporan Error:', error);
    return res.status(500).json({
      success: false,
      message: `Terjadi kesalahan saat menghapus: ${error.message}`,
    });
  }
};

const saveRFIDScan = async (req, res) => {
  try {
    // Baca RFID tag dari reader
    const rfidTag = await rfidService.readRFIDTag();
    const rfidClean = rfidTag.trim();
    const hariIni = getTodayLocalDate();

    console.info(`RFID TAG READ: ${rfidClean}`);

    // 1. Cari armada berdasarkan RFID (asumsi kolom rfid ditambahkan ke tabel armada)
    const [armadaRows] = await db.execute('SELECT * FROM armada WHERE rfid = ?', [rfidClean]);

    if (armadaRows.length === 0) {
      return res.status(404).json({ success: false, message: 'RFID Tag tidak terdaftar!' });
    }

    const data = armadaRows[0];

    // 2. Cek Ritase
    const [ritaseRows] = await db.execute(
      'SELECT COUNT(*) as total FROM laporan WHERE rfid = ? AND tanggal = ?',
      [rfidClean, hariIni]
    );
    const kedatanganKe = ritaseRows[0].total + 1;

    // 3. Simpan Transaksi
    const sqlInsert = `
            INSERT INTO laporan (rfid, qrcode, namaPetugas, jenisArmada, wilayah, tarif, mandor, tanggal, waktu, kedatanganKe) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURTIME(), ?)
        `;

    await db.execute(sqlInsert, [
      rfidClean,
      data.qrcode, // Tetap simpan qrcode untuk kompatibilitas
      data.namaPetugas,
      data.jenisArmada,
      data.wilayah,
      data.tarif,
      data.mandor,
      hariIni,
      kedatanganKe,
    ]);

    console.info(`RFID SCAN SAVED: RFID: ${rfidClean}, Petugas: ${data.namaPetugas}`);
    return res.status(200).json({ success: true, message: 'RFID Scan berhasil dicatat!' });
  } catch (error) {
    console.error('❌ RFID Scan Error:', error);
    return res.status(500).json({ success: false, message: `Gagal memproses RFID: ${error.message}` });
  }
};

const fs = require('fs');
const path = require('path');
const PENDING_UID_FILE = path.join(__dirname, '../../pending_uid.json');

/**
 * POST /api/scan/rfid-device
 * Fungsi khusus untuk menerima data dari device ESP32
 */
const saveDeviceRFIDScan = async (req, res) => {
  try {
    const { rfid } = req.body;
    
    if (!rfid) {
      return res.status(400).json({ success: false, message: 'RFID UID tidak ditemukan!' });
    }

    const rfidClean = rfid.trim().toUpperCase();
    const hariIni = getTodayLocalDate();

    console.info(`[DEVICE] RFID RECEIVED: ${rfidClean}`);

    // 1. Cari armada berdasarkan RFID
    const [armadaRows] = await db.execute('SELECT * FROM armada WHERE rfid = ?', [rfidClean]);

    if (armadaRows.length === 0) {
      console.warn(`[DEVICE] RFID NOT REGISTERED: ${rfidClean}`);
      // Simpan UID ke file untuk fitur auto-fill lintas-proses di cPanel
      const pendingData = { uid: rfidClean, timestamp: Date.now() };
      fs.writeFileSync(PENDING_UID_FILE, JSON.stringify(pendingData));
      return res.status(404).json({ success: false, message: 'Kartu tidak terdaftar!' });
    }

    const data = armadaRows[0];

    // 2. Cek Cooldown 15 Detik
    const [cooldownRows] = await db.execute(
      `SELECT id FROM laporan WHERE rfid = ? AND tanggal = ?
       AND TIMESTAMPDIFF(SECOND, CONCAT(tanggal,' ',waktu), NOW()) < 15`,
      [rfidClean, hariIni]
    );
    if (cooldownRows.length > 0) {
      console.warn(`[DEVICE] COOLDOWN ACTIVE: ${rfidClean}`);
      return res.status(429).json({ success: false, message: 'Cooldown aktif. Tunggu 15 detik.' });
    }

    // 3. Cek Ritase
    const [ritaseRows] = await db.execute(
      'SELECT COUNT(*) as total FROM laporan WHERE rfid = ? AND tanggal = ?',
      [rfidClean, hariIni]
    );
    const kedatanganKe = ritaseRows[0].total + 1;

    // 3. Simpan Transaksi
    const sqlInsert = `
            INSERT INTO laporan (rfid, qrcode, metode_scan, namaPetugas, jenisArmada, wilayah, tarif, mandor, tanggal, waktu, kedatanganKe) 
            VALUES (?, ?, 'RFID', ?, ?, ?, ?, ?, ?, CURTIME(), ?)
        `;

    await db.execute(sqlInsert, [
      rfidClean,
      data.qrcode,
      data.namaPetugas,
      data.jenisArmada,
      data.wilayah,
      data.tarif,
      data.mandor,
      hariIni,
      kedatanganKe,
    ]);

    console.info(`[DEVICE] SUCCESS: RFID ${rfidClean} logged for ${data.namaPetugas}`);
    return res.status(200).json({ 
      success: true, 
      message: 'Berhasil!',
      petugas: data.namaPetugas,
      ritase: kedatanganKe
    });
  } catch (error) {
    console.error('❌ Device RFID Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * GET /api/scan/today-history
 * Ambil histori scan hari ini untuk halaman Scanner (real-time polling)
 */
const getTodayHistory = async (req, res) => {
  try {
    const hariIni = getTodayLocalDate();
    const [rows] = await db.execute(
      `SELECT namaPetugas, jenisArmada, wilayah, tarif, mandor,
              TIME_FORMAT(waktu, '%H:%i:%s') as waktu,
              kedatanganKe, metode_scan, rfid
       FROM laporan
       WHERE tanggal = ?
       ORDER BY id DESC
       LIMIT 20`,
      [hariIni]
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error('❌ getTodayHistory Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * GET /api/scan/pending-uid
 * Mengembalikan UID kartu tidak terdaftar terakhir (untuk auto-fill form registrasi)
 * UID dihapus dari file setelah diambil (consume once)
 */
const getPendingUID = (req, res) => {
  try {
    if (!fs.existsSync(PENDING_UID_FILE)) {
      return res.json({ success: false, uid: null });
    }

    const fileData = fs.readFileSync(PENDING_UID_FILE, 'utf8');
    const data = JSON.parse(fileData);

    // UID kadaluarsa setelah 5 menit
    const isExpired = (Date.now() - data.timestamp) > 5 * 60 * 1000;
    if (isExpired) {
      fs.unlinkSync(PENDING_UID_FILE);
      return res.json({ success: false, uid: null, message: 'UID kadaluarsa' });
    }

    const uid = data.uid;
    fs.unlinkSync(PENDING_UID_FILE); // Consume once
    return res.json({ success: true, uid });
  } catch (error) {
    console.error('Error reading pending UID file:', error);
    return res.json({ success: false, uid: null });
  }
};

module.exports = {
  saveScan,
  saveRFIDScan,
  saveDeviceRFIDScan,
  getTodayHistory,
  getPendingUID,
  getLaporan,
  getDashboardStats,
  generateBilling,
  deleteLaporan,
  getExportData,
};
