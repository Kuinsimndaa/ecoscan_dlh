import { useState, useEffect } from 'react';
import axios from '../../config/axiosInstance';
import { LayoutDashboard, QrCode, Clock, Truck, User, Zap } from 'lucide-react';
import API_BASE_URL from '../../config/api';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const Dashboard = () => {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [stats, setStats] = useState({
    totalScan: 0,
    armadaUnik: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Ambil data hari ini
      const tanggalHariIni = new Date().toISOString().split('T')[0];
      const res = await axios.get(`/api/scan/laporan?tanggal=${tanggalHariIni}`);

      // Hitung statistik berdasarkan data hari ini
      const uniqueArmada = [...new Set(res.data.map((item) => item.namaPengendara))].length;

      setStats({
        totalScan: res.data.length,
        armadaUnik: uniqueArmada,
        recentActivity: res.data.slice(0, 15), // Ambil 15 terbaru
      });
    } catch {
      console.error('Gagal sinkronisasi dashboard mandor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 bg-gradient-to-b from-slate-50 via-amber-50/20 to-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-10 md:mb-12 gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-3 sm:p-3.5 md:p-4 bg-gradient-to-br from-green-600 to-green-700 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-green-300/50">
            <LayoutDashboard size={24} className="sm:hidden" />
            <LayoutDashboard size={28} className="hidden sm:block md:hidden" />
            <LayoutDashboard size={32} className="hidden md:block" />
          </div>
          <div>
            <h2 className="font-black italic uppercase text-2xl sm:text-3xl md:text-4xl text-slate-900 tracking-tighter leading-none">
              DASHBOARD{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                PETUGAS
              </span>
            </h2>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-1">
              Monitoring Scan Lapangan Real-Time
            </p>
          </div>
        </div>
      </div>

      {/* STATS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7 md:gap-8 mb-8 sm:mb-10 md:mb-12">
        {/* Total Scan */}
        <div className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-400/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-gradient-to-br from-white via-amber-50 to-slate-100 p-12 rounded-[3rem] shadow-xl border border-slate-200/50 text-center hover:shadow-2xl transition-all">
            <div className="absolute top-6 right-6 p-4 opacity-10 text-amber-600 group-hover:scale-125 transition-transform duration-500">
              <QrCode size={80} />
            </div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-3">
              Total Scan Masuk
            </p>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap size={26} className="text-amber-500" />
              <h2 className="text-8xl font-black text-slate-900 tabular-nums leading-none">
                {stats.totalScan}
              </h2>
            </div>
            <p className="text-[11px] font-bold text-slate-500 mt-3">
              Jumlah Objek Retribusi yang masuk
            </p>
          </div>
        </div>

        {/* Armada Unik */}
        <div className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-emerald-400/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-gradient-to-br from-green-600 via-green-600 to-emerald-700 p-12 rounded-[3rem] shadow-xl text-white text-center hover:shadow-2xl transition-all border border-green-500/30">
            <div className="absolute top-6 right-6 p-4 opacity-20 group-hover:scale-125 transition-transform duration-500">
              <Truck size={80} />
            </div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 group-hover:opacity-100 transition-all"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-green-100 mb-3">
              Objek Retribusi Beroperasi
            </p>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Truck size={26} className="text-green-100" />
              <h2 className="text-8xl font-black tabular-nums leading-none">{stats.armadaUnik}</h2>
            </div>
            <div className="inline-block mt-3 px-4 py-1.5 bg-white/20 rounded-full text-[11px] font-bold text-green-50 border border-white/30">
              Armada Unik
            </div>
          </div>
        </div>
      </div>

      {/* TABEL AKTIVITAS */}
      <div className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200/50 hover:shadow-3xl transition-all">
        <div className="p-5 sm:p-7 md:p-10 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-green-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-green-600 to-green-700 rounded-xl text-white">
              <Clock size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="font-black italic uppercase text-xl sm:text-2xl md:text-3xl text-slate-900 tracking-tighter leading-none">
                Riwayat <span className="text-green-600">Aktivitas</span>
              </h3>
              <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-0.5">
                15 aktivitas terbaru
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-green-600 font-black text-[9px] sm:text-[10px] tracking-widest border border-green-200/50 shadow-md">
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full animate-pulse shadow-lg shadow-green-600/50"></div>{' '}
            MONITOR AKTIF
          </div>
        </div>

        {isMobile ? (
          // Mobile Card Layout
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="py-16 text-center">
                <div className="inline-block p-6 bg-slate-100 rounded-full mb-4 animate-pulse">
                  <QrCode size={40} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-300 uppercase mb-2 tracking-wider">
                  MEMUAT DATA...
                </h3>
              </div>
            ) : stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((log, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-4 shadow-md border border-slate-200/50 hover:shadow-lg hover:border-green-200 transition-all"
                  >
                    {/* Time + Badge Row */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <Clock size={12} className="inline mr-1" />
                        {log.waktu}
                      </span>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200/50">
                        KE-{log.kedatanganKe}
                      </span>
                    </div>

                    {/* Primary Info */}
                    <h4 className="font-black text-slate-900 text-base uppercase mb-1 leading-tight">
                      {log.namaPengendara}
                    </h4>

                    {/* Secondary Info */}
                    <div className="text-xs text-slate-600 mb-3">
                      {log.jenisKendaraan} • {log.wilayah}
                    </div>

                    {/* Footer: Mandor + Tarif */}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500">
                        <User size={12} className="inline mr-1" />
                        <span className="font-bold text-slate-700 uppercase">{log.mandor}</span>
                      </span>
                      <span className="font-black text-slate-900 text-lg">
                        <span className="text-green-600 text-xs mr-1 font-bold italic">Rp</span>
                        {Number(log.tarif).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Mobile Empty State
              <div className="py-16 text-center">
                <div className="inline-block p-6 bg-slate-100 rounded-full mb-4">
                  <QrCode size={40} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-300 uppercase mb-2 tracking-wider">
                  Tidak Ada Aktivitas
                </h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto px-4">
                  Mulai melakukan scan untuk melihat data
                </p>
              </div>
            )}
          </div>
        ) : (
          // Desktop Table Layout
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-slate-900 to-slate-800 sticky top-0">
                <tr className="text-[13px] font-black text-slate-300 uppercase tracking-[0.15em]">
                  <th className="px-10 py-7">
                    <div className="flex items-center gap-2">
                      <Clock size={18} /> WAKTU
                    </div>
                  </th>
                  <th className="px-10 py-7">OBJEK RETRIBUSI</th>
                  <th className="px-10 py-7">MANDOR</th>
                  <th className="px-10 py-7 text-center">TOTAL MASUK</th>
                  <th className="px-10 py-7 text-right">TARIF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-10 py-20 text-center font-bold text-slate-300 animate-pulse"
                    >
                      MEMUAT DATA...
                    </td>
                  </tr>
                ) : stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((log, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-gradient-to-r hover:from-green-50/50 hover:to-blue-50/50 transition-all group border-l-4 ${idx % 2 === 0 ? 'border-l-transparent' : 'border-l-green-200/30'}`}
                    >
                      <td className="px-10 py-8 text-slate-500 font-bold tabular-nums text-base">
                        <span className="px-3 py-1.5 bg-slate-100 group-hover:bg-green-100 rounded-lg transition-colors">
                          {log.waktu}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="font-black text-slate-900 uppercase text-lg group-hover:text-green-700 transition-colors leading-tight">
                          {log.namaPengendara}
                        </div>
                        <div className="text-xs font-bold text-green-600 uppercase tracking-tighter mt-1">
                          {log.jenisKendaraan} —{' '}
                          <span className="text-slate-400 italic font-medium">{log.wilayah}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2 text-sm font-black text-slate-600 uppercase">
                          <User size={16} className="text-slate-400" /> {log.mandor}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <span className="inline-block px-6 py-2.5 bg-gradient-to-r from-blue-100 to-blue-50 group-hover:from-slate-900 group-hover:to-slate-800 group-hover:text-white transition-all rounded-xl font-black text-sm border border-blue-200/50 group-hover:border-slate-700">
                          KE-{log.kedatanganKe}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right font-black text-slate-900 text-xl tracking-tighter">
                        <span className="text-green-600 text-sm mr-1 font-bold italic">Rp</span>
                        {Number(log.tarif).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-10 py-32 text-center">
                      <div className="inline-block">
                        <QrCode size={48} className="text-slate-200 mx-auto mb-4" />
                        <div className="font-black text-slate-300 uppercase text-2xl tracking-[0.4em]">
                          Tidak Ada Aktivitas
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          Mulai melakukan scan untuk melihat data
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
