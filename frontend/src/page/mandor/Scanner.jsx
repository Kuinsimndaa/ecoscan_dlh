import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from '../../config/axiosInstance';
import { QrCode, ArrowLeft, Camera, CheckCircle } from 'lucide-react';
import Notification from '../../components/Notification';
import API_BASE_URL from '../../config/api';

const Scanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = React.useRef(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Inisialisasi instance scanner saat komponen dimuat
    const scanner = new Html5Qrcode('reader');
    html5QrCodeRef.current = scanner;

    // Cleanup: Hentikan kamera saat berpindah halaman
    return () => {
      if (scanner.isScanning) {
        scanner.stop().catch((err) => console.error('Gagal stop scanner:', err));
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setIsScanning(true);
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' }, // Gunakan kamera belakang
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Jika Scan Berhasil
          html5QrCodeRef.current.stop();
          setIsScanning(false);
          sendDataToBackend(decodedText);
        },
        () => {
          // Abaikan error pencarian frame agar console tidak penuh
        }
      );
    } catch (err) {
      console.error('Gagal membuka kamera:', err);
      alert('Izin kamera ditolak atau kamera tidak ditemukan.');
      setIsScanning(false);
    }
  };

  const sendDataToBackend = async (decodedText) => {
    try {
      // URL diarahkan ke endpoint backend yang sudah kita perbaiki
      const response = await axios.post('/api/scan/save', {
        qrcode: decodedText,
        mandor: localStorage.getItem('nama') || 'Petugas Lapangan',
      });

      if (response.data.success) {
        // Tampilkan notifikasi sukses dengan suara
        setNotification({
          type: 'success',
          title: '✓ SCAN BERHASIL',
          message: 'Data armada telah tercatat di sistem',
          duration: 3000,
          playSound: true,
        });

        // Redirect ke dashboard setelah notifikasi
        setTimeout(() => {
          window.location.href = '/mandor/dashboard';
        }, 2500);
      }
    } catch (error) {
      // Mengambil pesan error spesifik dari backend (misal: "QR tidak terdaftar")
      const errorMsg = error.response?.data?.message || 'Terjadi kesalahan pada server';

      setNotification({
        type: 'error',
        title: '✗ SCAN GAGAL',
        message: errorMsg,
        playSound: false,
      });

      console.error('Detail Error:', error.response?.data);
      // Reload agar scanner siap digunakan kembali jika gagal
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  return (
    <div
      className="p-4 sm:p-6 md:p-8 bg-gradient-to-b from-slat

e-50 via-green-50/20 to-slate-50 min-h-screen flex flex-col items-center justify-center"
    >
      <div className="w-full max-w-xs sm:max-w-md md:max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-slate-200/50 text-center">
        {/* Header Icon */}
        <div className="inline-block p-4 sm:p-5 bg-gradient-to-br from-green-600 to-green-700 rounded-xl sm:rounded-2xl text-white mb-4 sm:mb-6 shadow-xl shadow-green-300/50 animate pulse">
          <QrCode size={36} className="sm:w-11 sm:h-11" />
        </div>

        <h2 className="font-black italic uppercase text-2xl sm:text-3xl md:text-4xl text-slate-900 tracking-tighter leading-none mb-2">
          MULAI{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
            SCANNING
          </span>
        </h2>
        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 sm:mb-10">
          Arahkan kamera ke QR Code armada
        </p>

        {/* Area Scanner - Enhanced Design */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 aspect-square mb-8 shadow-2xl border-4 border-slate-700/50 flex items-center justify-center">
          <div id="reader" className="w-full h-full object-cover"></div>

          {/* Tombol Buka Kamera */}
          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80 backdrop-blur-sm">
              <button onClick={startScanner} className="group flex flex-col items-center gap-4">
                <div className="p-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full text-white shadow-2xl shadow-green-500/50 group-hover:scale-125 transition-all duration-300 group-active:scale-95">
                  <Camera size={52} />
                </div>
                <div>
                  <span className="font-black italic text-white text-2xl uppercase tracking-tighter group-hover:text-green-300 transition-colors">
                    Buka Kamera
                  </span>
                  <p className="text-xs text-slate-300 mt-1">Tap untuk mulai scanning</p>
                </div>
              </button>
            </div>
          )}

          {/* Overlay Bingkai Scan (Muncul saat scanning) */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Border Scanner dengan animasi */}
              <div className="relative w-64 h-64 border-4 border-green-500 rounded-2xl shadow-2xl shadow-green-500/50">
                {/* Corner animations */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 -mt-2 -ml-2 animate-pulse"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 -mt-2 -mr-2 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 -mb-2 -ml-2 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 -mb-2 -mr-2 animate-pulse"></div>

                {/* Scanning line animation */}
                <div
                  className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"
                  style={{ animation: 'slideScan 2s infinite' }}
                ></div>
              </div>

              {/* Scanning status */}
              <div className="absolute bottom-12 left-0 right-0 text-center">
                <div className="inline-block px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-full">
                  <p className="text-sm font-black text-green-300 uppercase tracking-widest">
                    Scanning...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Scanning style */}
          <style>{`
                        @keyframes slideScan {
                            0% { top: 0%; }
                            50% { top: 100%; }
                            100% { top: 0%; }
                        }
                    `}</style>
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl py-5 px-6 mb-8 border border-green-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white rounded-lg shadow-sm text-green-600">
                <CheckCircle size={18} />
              </div>
              <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">
                Metode Scan
              </span>
            </div>
            <span className="text-[9px] font-black uppercase text-green-700">QR ARMADA</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-green-100">
            <p className="text-xs font-bold text-slate-600">
              Pastikan QR Code terlihat jelas dalam bingkai
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <QrCode size={24} className="mx-auto mb-1 text-green-600" />
            <p className="text-[8px] font-bold text-slate-600 uppercase">QR Scan</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <Camera size={24} className="mx-auto mb-1 text-blue-600" />
            <p className="text-[8px] font-bold text-slate-600 uppercase">Real-Time</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <CheckCircle size={24} className="mx-auto mb-1 text-green-600" />
            <p className="text-[8px] font-bold text-slate-600 uppercase">Instant</p>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => (window.location.href = '/mandor/dashboard')}
          className="flex items-center justify-center gap-2 mx-auto py-3 px-6 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </button>

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
    </div>
  );
};

export default Scanner;
