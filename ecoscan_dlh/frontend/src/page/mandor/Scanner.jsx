import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from '../../config/axiosInstance';
import {
  QrCode, ArrowLeft, Camera, CheckCircle, Cpu,
  Clock, Truck, MapPin, Banknote, User, Wifi, RefreshCw
} from 'lucide-react';
import Notification from '../../components/Notification';

const Scanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState('qr');
  const html5QrCodeRef = useRef(null);
  const [notification, setNotification] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const pollingRef = useRef(null);

  // Format rupiah
  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  // Fetch histori hari ini
  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const res = await axios.get('/api/scan/today-history');
      if (res.data.success) {
        setScanHistory(res.data.data);
        setLastUpdate(new Date().toLocaleTimeString('id-ID'));
      }
    } catch (err) {
      console.error('Gagal fetch history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Inisialisasi scanner & polling
  useEffect(() => {
    const scanner = new Html5Qrcode('reader');
    html5QrCodeRef.current = scanner;

    fetchHistory();
    // Poll setiap 2 detik agar terasa instan saat kartu di-tap
    pollingRef.current = setInterval(fetchHistory, 2000);

    return () => {
      if (scanner.isScanning) {
        scanner.stop().catch((err) => console.error('Gagal stop scanner:', err));
      }
      clearInterval(pollingRef.current);
    };
  }, []);

  const startScanner = async () => {
    try {
      setIsScanning(true);
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          html5QrCodeRef.current.stop();
          setIsScanning(false);
          sendDataToBackend(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error('Gagal membuka kamera:', err);
      alert('Izin kamera ditolak atau kamera tidak ditemukan.');
      setIsScanning(false);
    }
  };

  const sendDataToBackend = async (decodedText) => {
    try {
      const response = await axios.post('/api/scan/save', {
        qrcode: decodedText,
        mandor: localStorage.getItem('nama') || 'Petugas Lapangan',
      });
      if (response.data.success) {
        setNotification({
          type: 'success',
          title: '✓ SCAN BERHASIL',
          message: `Armada ${response.data.petugas || ''} tercatat. Kedatangan ke-${response.data.kedatanganKe || 1}`,
          duration: 3000,
          playSound: true,
        });
        fetchHistory();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Terjadi kesalahan pada server';
      setNotification({
        type: 'error',
        title: '✗ SCAN GAGAL',
        message: errorMsg,
        playSound: false,
      });
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  // Badge metode scan
  const MethodBadge = ({ metode }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
      metode === 'RFID'
        ? 'bg-blue-100 text-blue-700 border border-blue-200'
        : 'bg-green-100 text-green-700 border border-green-200'
    }`}>
      {metode === 'RFID' ? <Cpu size={9} /> : <QrCode size={9} />}
      {metode}
    </span>
  );

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-b from-slate-50 via-green-50/20 to-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ===== SCANNER CARD ===== */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200/50 text-center">
          {/* Header */}
          <div className="inline-block p-4 bg-gradient-to-br from-green-600 to-green-700 rounded-xl text-white mb-4 shadow-lg shadow-green-300/50">
            <QrCode size={32} />
          </div>
          <h2 className="font-black italic uppercase text-2xl text-slate-900 tracking-tighter mb-1">
            MULAI <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">SCANNING</span>
          </h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5">
            Pilih metode scanning armada
          </p>

          {/* Mode Tabs */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setScanMode('qr')}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm uppercase tracking-widest transition-all ${
                scanMode === 'qr' ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <QrCode size={16} className="inline mr-2" />QR Code
            </button>
            <button
              onClick={() => setScanMode('rfid')}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm uppercase tracking-widest transition-all ${
                scanMode === 'rfid' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Cpu size={16} className="inline mr-2" />RFID
            </button>
          </div>

          {/* Scanner Area */}
          {scanMode === 'qr' ? (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 aspect-square mb-6 shadow-2xl border-4 border-slate-700/50">
              <div id="reader" className="w-full h-full" />
              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80 backdrop-blur-sm">
                  <button onClick={startScanner} className="group flex flex-col items-center gap-4">
                    <div className="p-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full text-white shadow-2xl shadow-green-500/50 group-hover:scale-125 transition-all duration-300">
                      <Camera size={48} />
                    </div>
                    <span className="font-black italic text-white text-2xl uppercase tracking-tighter group-hover:text-green-300 transition-colors">
                      Buka Kamera
                    </span>
                    <p className="text-xs text-slate-300">Tap untuk mulai scanning QR</p>
                  </button>
                </div>
              )}
            </div>
          ) : (
            // RFID Mode — Monitor ESP32
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 to-blue-800 aspect-video mb-6 shadow-2xl border-4 border-blue-700/50 flex flex-col items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full text-white shadow-2xl shadow-blue-500/50 animate-pulse">
                    <Cpu size={44} />
                  </div>
                  {/* Ping rings */}
                  <div className="absolute inset-0 rounded-full border-4 border-blue-400/40 animate-ping" />
                  <div className="absolute -inset-2 rounded-full border-2 border-blue-400/20 animate-ping" style={{animationDelay:'0.5s'}} />
                </div>
                <div>
                  <p className="font-black italic text-white text-xl uppercase tracking-tighter">
                    Menunggu Tap Kartu RFID
                  </p>
                  <p className="text-xs text-blue-300 text-center mt-1">
                    Dekatkan kartu ke ESP32 reader
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400/40 rounded-full">
                  <Wifi size={12} className="text-green-400" />
                  <span className="text-[10px] font-bold text-green-300 uppercase tracking-wider">ESP32 Online — Auto Detect</span>
                </div>
              </div>
            </div>
          )}

          {/* Back Button */}
          <button
            onClick={() => (window.location.href = '/mandor/dashboard')}
            className="flex items-center justify-center gap-2 mx-auto py-3 px-6 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
          >
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </button>
        </div>

        {/* ===== HISTORI SCAN HARI INI ===== */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
          {/* Header Histori */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Clock size={18} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest text-slate-800">Histori Scan Hari Ini</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {scanHistory.length} transaksi tercatat
                  {lastUpdate && ` · update ${lastUpdate}`}
                </p>
              </div>
            </div>
            <button
              onClick={fetchHistory}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              title="Refresh"
            >
              <RefreshCw size={15} className={`text-slate-500 ${isLoadingHistory ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* List Histori */}
          <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
            {scanHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Truck size={36} className="mb-3 opacity-30" />
                <p className="text-sm font-bold">Belum ada scan hari ini</p>
                <p className="text-xs mt-1">Tap kartu RFID atau scan QR untuk mulai</p>
              </div>
            ) : (
              scanHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`px-6 py-4 hover:bg-slate-50/80 transition-colors ${idx === 0 ? 'bg-green-50/50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${idx === 0 ? 'bg-green-100' : 'bg-slate-100'}`}>
                        <Truck size={16} className={idx === 0 ? 'text-green-600' : 'text-slate-500'} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-slate-900">{item.namaPetugas}</span>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-black uppercase rounded-full tracking-wider">
                              Terbaru
                            </span>
                          )}
                          <MethodBadge metode={item.metode_scan} />
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <MapPin size={10} />{item.wilayah}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Truck size={10} />{item.jenisArmada}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <User size={10} />{item.mandor}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Info */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end mb-1">
                        <Clock size={10} className="text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-600">{item.waktu}</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end mb-1">
                        <Banknote size={10} className="text-green-600" />
                        <span className="text-xs font-black text-green-700">{formatRupiah(item.tarif)}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Kedatangan ke-{item.kedatanganKe}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {scanHistory.length > 0 && (
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Total: {scanHistory.length} scan hari ini
              </span>
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Live Update
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          duration={notification.duration || 4000}
          playSound={notification.playSound}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default Scanner;
