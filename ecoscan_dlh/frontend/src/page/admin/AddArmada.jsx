import { useState, useEffect, useRef } from 'react';
import axios from '../../config/axiosInstance';
import { QRCodeCanvas } from 'qrcode.react';
import { toJpeg } from 'html-to-image';
import {
  Truck,
  BadgeCheck,
  Download,
  Trash2,
  Plus,
  QrCode,
  Eye,
  Search,
  RefreshCw,
  Cpu,
  Pencil,
  X,
  Wifi,
} from 'lucide-react';
import Notification from '../../components/Notification';
import ConfirmationModal from '../../components/ConfirmationModal';
import API_BASE_URL from '../../config/api';

const AddArmada = () => {
  const qrRef = useRef(null);
  const [formData, setFormData] = useState({
    namaPetugas: '',
    mandor: '',
    jenisArmada: 'TOSSA',
    wilayah: '',
    tarif: '40000',
    rfid: '',
  });
  const [daftarArmada, setDaftarArmada] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [selectedPetugas, setSelectedPetugas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false, type: 'warning', title: '', message: '', onConfirm: null, onCancel: null,
  });

  // === State untuk Edit RFID Modal ===
  const [rfidModal, setRfidModal] = useState({ isOpen: false, armadaId: null, armadaNama: '', rfidInput: '' });
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const scanPollRef = useRef(null);
  const [isFormScanning, setIsFormScanning] = useState(false);
  const formScanPollRef = useRef(null);

  // Ambil data dari database
  const fetchArmada = async () => {
    try {
      const res = await axios.get('/api/armada');
      // Pastikan kita selalu menyimpan array ke state
      const data = res.data;
      setDaftarArmada(Array.isArray(data) ? data : data?.data ?? []);
    } catch (err) {
      console.error('Gagal load data:', err);
      setDaftarArmada([]);
    }
  };

  useEffect(() => {
    fetchArmada();
  }, []);

  // === Handler Edit RFID ===
  const openRfidModal = (item) => {
    setRfidModal({ isOpen: true, armadaId: item.id, armadaNama: item.namaPetugas, rfidInput: item.rfid || '' });
    setIsScanning(false);
    setScanStatus('');
  };

  const closeRfidModal = () => {
    setRfidModal({ isOpen: false, armadaId: null, armadaNama: '', rfidInput: '' });
    stopModalScan();
  };

  const stopModalScan = () => {
    setIsScanning(false);
    setScanStatus('');
    if (scanPollRef.current) clearInterval(scanPollRef.current);
  };

  const startModalScan = () => {
    setIsScanning(true);
    setScanStatus('Menunggu tap kartu ke ESP32...');
    scanPollRef.current = setInterval(async () => {
      try {
        const res = await axios.get('/api/scan/pending-uid');
        if (res.data.success && res.data.uid) {
          setRfidModal(prev => ({ ...prev, rfidInput: res.data.uid }));
          setScanStatus(`✅ UID Terdeteksi: ${res.data.uid}`);
          stopModalScan();
        }
      } catch (e) { /* ignore */ }
    }, 2000);
  };

  const saveRFID = async () => {
    if (!rfidModal.rfidInput.trim()) return;
    try {
      await axios.put(`/api/armada/${rfidModal.armadaId}/rfid`, { rfid: rfidModal.rfidInput.trim() });
      setNotification({ type: 'success', title: '✓ RFID TERSIMPAN', message: `RFID armada ${rfidModal.armadaNama} berhasil diperbarui!`, playSound: true });
      fetchArmada();
      closeRfidModal();
    } catch (err) {
      setNotification({ type: 'error', title: '✗ GAGAL', message: err.response?.data?.message || 'Gagal menyimpan RFID', playSound: false });
    }
  };

  // === Handler Scan RFID di Form Tambah ===
  const startFormScan = () => {
    setIsFormScanning(true);
    formScanPollRef.current = setInterval(async () => {
      try {
        const res = await axios.get('/api/scan/pending-uid');
        if (res.data.success && res.data.uid) {
          setFormData(prev => ({ ...prev, rfid: res.data.uid }));
          setIsFormScanning(false);
          clearInterval(formScanPollRef.current);
          setNotification({ type: 'success', title: '✅ UID Terdeteksi', message: `RFID ${res.data.uid} auto-fill ke form!`, duration: 3000, playSound: false });
        }
      } catch (e) { /* ignore */ }
    }, 2000);
  };

  const stopFormScan = () => {
    setIsFormScanning(false);
    if (formScanPollRef.current) clearInterval(formScanPollRef.current);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/armada', formData);

      // Pastikan mengecek respon data qrcode dari backend
      if (res.data.success && res.data.data.qrcode) {
        // 1. Set nilai QR agar QRCodeCanvas merender gambar
        setQrValue(res.data.data.qrcode);

        // 2. Set info petugas untuk tampilan kartu
        setSelectedPetugas({
          nama: formData.namaPetugas,
          jenis: formData.jenisArmada,
          wilayah: formData.wilayah,
        });

        // Tampilkan notifikasi sukses dengan custom notification
        setNotification({
          type: 'success',
          title: '✓ BERHASIL TERSIMPAN',
          message: `Armada "${formData.namaPetugas}" berhasil didaftarkan! QR Code otomatis dibuat.`,
          playSound: true,
        });

        fetchArmada(); // Refresh tabel di bawah

        // 3. Reset input form setelah beberapa saat
        setTimeout(() => {
          setFormData({
            namaPetugas: '',
            mandor: '',
            jenisArmada: 'TOSSA',
            wilayah: '',
            tarif: '40000',
            rfid: '',
          });
        }, 1500);
      }
    } catch (err) {
      console.error('Error simpan:', err);
      setNotification({
        type: 'error',
        title: '✗ GAGAL TERSIMPAN',
        message: err.response?.data?.message || "Pastikan Backend mengirimkan string 'qrcode'.",
        playSound: false,
      });
    } finally {
      setLoading(false);
    }
  };

  // Menampilkan kembali QR dari data yang sudah ada di tabel
  const handleViewQR = (item) => {
    if (item.qrcode) {
      setQrValue(item.qrcode);
      setSelectedPetugas({
        nama: item.namaPetugas,
        jenis: item.jenisArmada,
        wilayah: item.wilayah,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert('Data ini tidak punya string QR di database!');
    }
  };

  const handleDelete = async (id) => {
    setConfirmationModal({
      isOpen: true,
      type: 'error',
      title: '✗ HAPUS ARMADA',
      message: 'Apakah Anda yakin ingin menghapus data armada ini? Data tidak dapat dikembalikan.',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/armada/${id}`);
          fetchArmada();
          setQrValue('');
          setSelectedPetugas(null);

          setNotification({
            type: 'success',
            title: '✓ BERHASIL DIHAPUS',
            message: 'Data armada berhasil dihapus dari sistem.',
            playSound: true,
          });
        } catch (err) {
          console.error('Error hapus:', err);
          setNotification({
            type: 'error',
            title: '✗ GAGAL DIHAPUS',
            message: 'Terjadi kesalahan saat menghapus data.',
            playSound: false,
          });
        } finally {
          // PENTING: Reset modal state dan deleteId untuk siap delete berikutnya
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
      onCancel: () => {
        setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const downloadJPG = () => {
    if (!qrRef.current) return;
    toJpeg(qrRef.current, { quality: 1.0, backgroundColor: '#ffffff' }).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = `QR-${selectedPetugas?.nama || 'ARMADA'}.jpg`;
      link.href = dataUrl;
      link.click();
    });
  };

  // Filter data berdasarkan search term (defensive)
  const filteredArmada = Array.isArray(daftarArmada)
    ? daftarArmada.filter((item) => (item.namaPetugas || '').toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-50 min-h-screen font-sans">
      <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
        <div className="p-3 sm:p-4 bg-gradient-to-br from-green-600 to-green-700 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-green-300/50">
          <BadgeCheck size={28} className="sm:w-8 sm:h-8" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black italic text-slate-900 uppercase leading-tight">
            REGISTRASI{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              OBJEK RETRIBUSI
            </span>
          </h1>
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-1">
            Daftarkan dan Generate QR Code untuk Kartu Objek Retribusi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
        {/* FORM */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-xl border border-slate-200/50 hover:shadow-2xl transition-all backdrop-blur-sm">
          <h3 className="font-black text-lg sm:text-xl text-slate-900 uppercase mb-5 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <Plus size={20} className="sm:w-6 sm:h-6 text-green-600" />
            Form Pendaftaran Objek Retribusi
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Row 1: Objek Retribusi + Mandor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] sm:text-xs font-black uppercase text-slate-500 ml-3 mb-2 block tracking-[0.1em]">
                  Objek Retribusi
                </label>
                <input
                  placeholder="Masukkan nama..."
                  value={formData.namaPetugas}
                  onChange={(e) => setFormData({ ...formData, namaPetugas: e.target.value })}
                  className="w-full p-3.5 sm:p-4 bg-gradient-to-b from-white to-slate-50 rounded-xl font-bold text-sm sm:text-base outline-none border-2 border-slate-200 focus:border-green-500 focus:from-white focus:to-green-50 transition-all shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] sm:text-xs font-black uppercase text-slate-500 ml-3 mb-2 block tracking-[0.1em]">
                  Mandor Lapangan
                </label>
                <input
                  placeholder="Nama mandor..."
                  value={formData.mandor}
                  onChange={(e) => setFormData({ ...formData, mandor: e.target.value })}
                  className="w-full p-3.5 sm:p-4 bg-gradient-to-b from-white to-slate-50 rounded-xl font-bold text-sm sm:text-base outline-none border-2 border-slate-200 focus:border-green-500 focus:from-white focus:to-green-50 transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Row 2: Jenis Armada + Wilayah */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] sm:text-xs font-black uppercase text-slate-500 ml-3 mb-2 block tracking-[0.1em]">
                  Jenis Armada
                </label>
                <select
                  value={formData.jenisArmada}
                  onChange={(e) => setFormData({ ...formData, jenisArmada: e.target.value })}
                  className="w-full p-3.5 sm:p-4 bg-gradient-to-b from-white to-slate-50 rounded-xl font-bold text-sm sm:text-base outline-none border-2 border-slate-200 focus:border-green-500 transition-all shadow-sm"
                >
                  <option value="TOSSA">🚚 TOSSA</option>
                  <option value="GEROBAK">🛵 GEROBAK</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] sm:text-xs font-black uppercase text-slate-500 ml-3 mb-2 block tracking-[0.1em]">
                  Wilayah Kerja
                </label>
                <input
                  placeholder="Wilayah..."
                  value={formData.wilayah}
                  onChange={(e) => setFormData({ ...formData, wilayah: e.target.value })}
                  className="w-full p-3.5 sm:p-4 bg-gradient-to-b from-white to-slate-50 rounded-xl font-bold text-sm sm:text-base outline-none border-2 border-slate-200 focus:border-green-500 focus:from-white focus:to-green-50 transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Row 3: Tarif */}
            <div>
              <label className="text-[10px] sm:text-xs font-black uppercase text-slate-500 ml-3 mb-2 block tracking-[0.1em]">
                Tarif Retribusi (RP)
              </label>
              <input
                type="number"
                placeholder="40000"
                value={formData.tarif}
                onChange={(e) => setFormData({ ...formData, tarif: e.target.value })}
                className="w-full p-3.5 sm:p-4 bg-gradient-to-b from-white to-slate-50 rounded-xl font-bold text-sm sm:text-base outline-none border-2 border-slate-200 focus:border-green-500 focus:from-white focus:to-green-50 transition-all shadow-sm"
                required
              />
            </div>

            {/* Row 4: RFID Tag */}
            <div>
              <label className="text-[10px] sm:text-xs font-black uppercase text-slate-500 ml-3 mb-2 block tracking-[0.1em]">
                RFID Tag (Opsional)
              </label>
              <div className="flex gap-2">
                <input
                  placeholder="Ketik UID atau klik Scan..."
                  value={formData.rfid}
                  onChange={(e) => setFormData({ ...formData, rfid: e.target.value.toUpperCase() })}
                  className="flex-1 p-3.5 sm:p-4 bg-gradient-to-b from-white to-slate-50 rounded-xl font-bold text-sm outline-none border-2 border-slate-200 focus:border-blue-500 focus:from-white focus:to-blue-50 transition-all shadow-sm font-mono"
                />
                <button
                  type="button"
                  onClick={isFormScanning ? stopFormScan : startFormScan}
                  className={`px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                    isFormScanning
                      ? 'bg-red-100 text-red-600 border-2 border-red-300 animate-pulse'
                      : 'bg-blue-100 text-blue-700 border-2 border-blue-200 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  <Cpu size={14} />
                  {isFormScanning ? 'Stop' : 'Scan'}
                </button>
              </div>
              {isFormScanning && (
                <p className="text-[10px] text-blue-600 font-bold mt-1 ml-3 animate-pulse">
                  📡 Menunggu tap kartu ke ESP32...
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full p-4 sm:p-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-sm sm:text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
              disabled={loading}
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {loading ? (
                  <RefreshCw size={18} className="sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Plus size={18} className="sm:w-5 sm:h-5" />
                )}
                <span>{loading ? 'Menyimpan...' : 'Daftarkan & Generate QR'}</span>
              </div>
            </button>
          </form>
        </div>

        {/* PREVIEW QR - Professional Card Design */}
        <div className="bg-gradient-to-br from-white via-slate-50/50 to-green-50/30 p-6 rounded-[2.5rem] shadow-xl border border-slate-200/50 flex flex-col items-center sticky top-8 backdrop-blur-sm">
          <div
            ref={qrRef}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 rounded-2xl flex flex-col items-center w-full text-white"
            style={{ width: '280px' }}
          >
            {/* Header */}
            <div className="text-center mb-6 pb-4 border-b border-slate-700/50 w-full">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-green-400 mb-1">
                EcoScan DLH
              </p>
              <p className="text-[9px] font-bold text-slate-300">Kabupaten Tegal</p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-3 rounded-xl mb-5">
              {qrValue ? (
                <QRCodeCanvas value={qrValue} size={150} level={'H'} includeMargin={true} />
              ) : (
                <div className="w-36 h-36 bg-slate-700 rounded-lg flex items-center justify-center">
                  <QrCode size={48} className="text-slate-600" />
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="text-center w-full px-2">
              <p className="font-black text-sm uppercase leading-tight mb-2 text-white">
                {selectedPetugas?.nama || 'OBJEK RETRIBUSI'}
              </p>
              <div className="bg-white/10 p-2 rounded-lg mb-3 border border-slate-700/50">
                <p className="text-[9px] font-bold text-green-300 uppercase tracking-tight">
                  {selectedPetugas?.jenis || 'JENIS'}
                </p>
                <p className="text-[8px] font-medium text-slate-300 mt-0.5">
                  Wilayah: {selectedPetugas?.wilayah || '—'}
                </p>
              </div>
              <div className="bg-green-600/20 p-2 rounded-lg border border-green-500/50">
                <p className="text-[8px] font-bold text-green-300 uppercase">Terverifikasi</p>
                <p className="text-[8px] font-medium text-slate-200 mt-0.5">Armada Resmi DLH</p>
              </div>
            </div>
          </div>

          <button
            onClick={downloadJPG}
            disabled={!qrValue}
            className="mt-6 w-full py-4 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl font-black uppercase text-sm flex items-center justify-center gap-3 disabled:bg-slate-300 hover:from-green-700 hover:to-green-800 transition-all hover:shadow-lg active:scale-95"
          >
            <Download size={18} /> DOWNLOAD KARTU
          </button>

          <div className="mt-4 text-[10px] text-slate-500 text-center">
            <p className="font-bold">Ukuran: 280x400px</p>
            <p>Siap untuk dicetak ke kartu</p>
          </div>
        </div>
      </div>

      {/* TABEL */}
      <div className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-200/50 hover:shadow-2xl transition-all backdrop-blur-sm">
        <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/30 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl">
              <Truck size={24} />
            </div>
            <h2 className="font-black uppercase italic text-slate-900 text-xl">
              Objek Retribusi Terdaftar
            </h2>
          </div>
          <div className="flex items-center gap-3 bg-slate-100 px-5 py-3 rounded-xl border-2 border-slate-200">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama objek retribusi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-100 outline-none font-medium text-slate-700 placeholder-slate-400 text-sm"
            />
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gradient-to-r from-slate-900 to-slate-800 sticky top-0">
              <tr className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em]">
                <th className="px-8 py-6">No</th>
                <th className="px-8 py-6">Objek Retribusi</th>
                <th className="px-8 py-6">Mandor</th>
                <th className="px-8 py-6">Tarif (Rp)</th>
                <th className="px-8 py-6">RFID Tag</th>
                <th className="px-8 py-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredArmada.length > 0 ? (
                filteredArmada.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gradient-to-r hover:from-green-50/50 hover:to-blue-50/50 transition-all group"
                  >
                    <td className="px-8 py-6 font-black text-slate-500">{idx + 1}</td>
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-900 uppercase group-hover:text-green-700 transition-colors">
                        {item.namaPetugas}
                      </div>
                      <div className="text-[9px] font-bold text-green-600 uppercase mt-1">
                        {item.jenisArmada} — {item.wilayah}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-medium text-slate-700">{item.mandor || '-'}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-900">
                        Rp {Number(item.tarif || 0).toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {item.rfid ? (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black tracking-wider uppercase border border-blue-200">
                            {item.rfid}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 uppercase italic">
                          Belum Ada
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewQR(item)}
                          className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all hover:shadow-md active:scale-95"
                          title="Lihat QR Code"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openRfidModal(item)}
                          className="p-2.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all hover:shadow-md active:scale-95"
                          title="Atur RFID"
                        >
                          <Cpu size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all hover:shadow-md active:scale-95"
                          title="Hapus Data"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="inline-block">
                      <Truck size={40} className="text-slate-200 mx-auto mb-3" />
                      <p className="font-black text-slate-300 uppercase text-lg tracking-[0.3em]">
                        Belum Ada Data Armada
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        Daftarkan armada baru melalui form di atas
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* === RFID EDIT MODAL === */}
      {rfidModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-black text-lg text-slate-900 uppercase">Atur RFID</h3>
                <p className="text-xs text-slate-500 font-medium">{rfidModal.armadaNama}</p>
              </div>
              <button onClick={closeRfidModal} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>

            {/* Input Manual */}
            <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block tracking-wider">UID RFID</label>
            <input
              value={rfidModal.rfidInput}
              onChange={(e) => setRfidModal(prev => ({ ...prev, rfidInput: e.target.value.toUpperCase() }))}
              placeholder="Ketik UID atau Scan kartu..."
              className="w-full p-3.5 border-2 border-slate-200 rounded-xl font-mono font-bold text-sm outline-none focus:border-blue-500 mb-1"
            />

            {/* Status Scan */}
            {scanStatus && (
              <p className={`text-[11px] font-bold mb-3 ${
                scanStatus.includes('✅') ? 'text-green-600' : 'text-blue-600 animate-pulse'
              }`}>{scanStatus}</p>
            )}

            {/* Tombol Scan via ESP32 */}
            <button
              onClick={isScanning ? stopModalScan : startModalScan}
              className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider mb-4 flex items-center justify-center gap-2 transition-all ${
                isScanning
                  ? 'bg-red-100 text-red-600 border-2 border-red-300'
                  : 'bg-blue-50 text-blue-700 border-2 border-blue-200 hover:bg-blue-600 hover:text-white'
              }`}
            >
              <Wifi size={16} />
              {isScanning ? '⏹ Stop Scanning' : '📡 Scan via ESP32 (Tap Kartu)'}
            </button>

            {isScanning && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                <p className="text-xs text-blue-700 font-bold">Dekatkan kartu RFID ke alat ESP32...</p>
              </div>
            )}

            {/* Tombol Aksi */}
            <div className="flex gap-3">
              <button onClick={closeRfidModal} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm uppercase hover:bg-slate-200 transition-all">Batal</button>
              <button
                onClick={saveRFID}
                disabled={!rfidModal.rfidInput.trim()}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-black text-sm uppercase hover:bg-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          playSound={notification.playSound}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        type={confirmationModal.type}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText="HAPUS"
        cancelText="BATAL"
        onConfirm={confirmationModal.onConfirm}
        onCancel={confirmationModal.onCancel}
      />
    </div>
  );
};

export default AddArmada;
