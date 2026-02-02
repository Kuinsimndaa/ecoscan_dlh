import { useState, useEffect, useCallback } from 'react';
import axios from '../../config/axiosInstance';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Calendar,
  Download,
  Clock,
  Trash2,
  BarChart3,
  User,
  Truck,
  MapPin,
} from 'lucide-react';
import Notification from '../../components/Notification';
import ConfirmationModal from '../../components/ConfirmationModal';
import API_BASE_URL from '../../config/api';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const MonthlyReport = () => {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [laporan, setLaporan] = useState([]);
  const [filterTanggal, setFilterTanggal] = useState(''); // Untuk Filter Harian
  const [filterBulan, setFilterBulan] = useState(new Date().toISOString().slice(0, 7)); // Default Bulan Sekarang
  const [modeFilter, setModeFilter] = useState('bulan'); // "hari" atau "bulan"
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  });

  // Fungsi format tanggal ke format Indonesia
  const formatTanggalIndonesia = (tanggalStr) => {
    const bulanIndo = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];
    const [tahun, bulan, hari] = tanggalStr.split('-');
    const bulanIndex = parseInt(bulan) - 1;
    return `${hari} ${bulanIndo[bulanIndex]} ${tahun}`;
  };

  const fetchLaporan = useCallback(async () => {
    setLoading(true);
    try {
      // Menentukan query berdasarkan mode yang dipilih
      const query = modeFilter === 'hari' ? `tanggal=${filterTanggal}` : `bulan=${filterBulan}`;

      const res = await axios.get(`/api/scan/laporan?${query}`);
      setLaporan(res.data);
    } catch {
      console.error('Error load data laporan');
    } finally {
      setLoading(false);
    }
  }, [filterBulan, filterTanggal, modeFilter]);

  useEffect(() => {
    if (modeFilter === 'hari' && !filterTanggal) return;
    fetchLaporan();
  }, [fetchLaporan, filterBulan, filterTanggal, modeFilter]);

  const handleExportExcel = () => {
    if (laporan.length === 0) {
      setNotification({
        type: 'error',
        title: '✗ DATA KOSONG',
        message: 'Tidak ada data laporan untuk diekspor. Silahkan filter data terlebih dahulu.',
        playSound: false,
      });
      return;
    }

    const dataExcel = laporan.map((item, index) => ({
      No: index + 1,
      Tanggal: formatTanggalIndonesia(item.tanggalLengkap),
      Jam: item.waktu,
      'Objek Retribusi': item.namaPengendara,
      'Jenis Armada': item.jenisKendaraan,
      Wilayah: item.wilayah,
      Mandor: item.mandor,
      'Total Masuk': item.kedatanganKe,
      'Tarif (Rp)': Number(item.tarif),
    }));

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan EcoScan');
    const fileName =
      modeFilter === 'hari' ? `Laporan_Harian_${filterTanggal}` : `Laporan_Bulanan_${filterBulan}`;
    XLSX.writeFile(wb, `${fileName}.xlsx`);

    setNotification({
      type: 'success',
      title: '✓ BERHASIL DIEKSPOR',
      message: `File "${fileName}.xlsx" berhasil diunduh.`,
      playSound: true,
    });
  };

  const handleDelete = async (id) => {
    setConfirmationModal({
      isOpen: true,
      type: 'error',
      title: '✗ HAPUS LAPORAN',
      message: 'Apakah Anda yakin ingin menghapus data laporan ini? Data tidak dapat dikembalikan.',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/scan/laporan/${id}`);
          fetchLaporan();

          setNotification({
            type: 'success',
            title: '✓ BERHASIL DIHAPUS',
            message: 'Data laporan berhasil dihapus dari sistem.',
            playSound: true,
          });
        } catch (err) {
          console.error('Error hapus:', err);
          setNotification({
            type: 'error',
            title: '✗ GAGAL DIHAPUS',
            message: err.response?.data?.message || 'Terjadi kesalahan saat menghapus data.',
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

  const totalTarif = laporan.reduce((sum, item) => sum + Number(item.tarif || 0), 0);

  return (
    <div className="p-8 bg-gradient-to-b from-slate-50 via-purple-50/20 to-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex items-center gap-5">
          <div className="p-5 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl text-white shadow-xl shadow-green-300/50">
            <BarChart3 size={36} />
          </div>
          <div>
            <h2 className="font-black italic uppercase text-4xl text-slate-900 tracking-tighter leading-none">
              REKAPAN{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                LAPORAN
              </span>
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
              Filter Harian & Bulanan dengan Export Data
            </p>
          </div>
        </div>

        {/* Multi-Filter System */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl shadow-xl border border-slate-200/50">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setModeFilter('hari')}
              className={`px-4 py-2 rounded-md font-black text-[10px] transition-all ${modeFilter === 'hari' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}
            >
              HARIAN
            </button>
            <button
              onClick={() => setModeFilter('bulan')}
              className={`px-4 py-2 rounded-md font-black text-[10px] transition-all ${modeFilter === 'bulan' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}
            >
              BULANAN
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 border-l border-slate-200">
            <Calendar size={16} className="text-green-600" />
            {modeFilter === 'hari' ? (
              <input
                type="date"
                value={filterTanggal}
                onChange={(e) => setFilterTanggal(e.target.value)}
                className="outline-none font-black text-slate-700 bg-transparent cursor-pointer text-xs"
              />
            ) : (
              <input
                type="month"
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
                className="outline-none font-black text-slate-700 bg-transparent cursor-pointer text-xs"
              />
            )}
          </div>

          <button
            onClick={handleExportExcel}
            className="bg-gradient-to-br from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white px-6 py-3 rounded-lg font-black text-xs tracking-widest flex items-center gap-2 transition-all active:scale-95 hover:shadow-lg"
          >
            <Download size={16} /> EKSPOR
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {laporan.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 p-4 rounded-xl shadow-md border border-slate-200/50 backdrop-blur-sm">
            <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Total Data</p>
            <p className="text-3xl font-black text-slate-900">{laporan.length}</p>
          </div>
          <div className="bg-gradient-to-br from-white via-green-50/30 to-slate-50/50 p-4 rounded-xl shadow-md border border-slate-200/50 backdrop-blur-sm">
            <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Total Tarif</p>
            <p className="text-xl font-black text-green-600">
              Rp {totalTarif.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-gradient-to-br from-white via-amber-50/30 to-slate-50/50 p-4 rounded-xl shadow-md border border-slate-200/50 backdrop-blur-sm">
            <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Rata-rata</p>
            <p className="text-xl font-black text-slate-900">
              Rp {Math.round(totalTarif / laporan.length).toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-gradient-to-br from-white via-purple-50/30 to-slate-50/50 p-4 rounded-xl shadow-md border border-slate-200/50 backdrop-blur-sm">
            <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Objek Retribusi</p>
            <p className="text-3xl font-black text-blue-600">
              {new Set(laporan.map((x) => x.namaPengendara)).size}
            </p>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 rounded-2xl shadow-xl overflow-hidden border border-slate-200/50 hover:shadow-2xl transition-all backdrop-blur-sm">
        {isMobile ? (
          // Mobile Card Layout
          laporan.length > 0 ? (
            <div className="p-4 sm:p-6 space-y-4">
              {laporan.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-4 shadow-md border border-slate-200/50 hover:shadow-lg hover:border-green-200 transition-all"
                >
                  {/* Header: Date + Time Badge */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-black text-slate-900 text-sm italic">
                        {formatTanggalIndonesia(item.tanggalLengkap)}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 px-2 py-1 bg-slate-100 rounded w-fit">
                        <Clock size={12} className="text-green-600" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase">
                          {item.waktu} WIB
                        </span>
                      </div>
                    </div>
                    <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg font-black text-xs italic border border-blue-200/50">
                      KE-{item.kedatanganKe}
                    </span>
                  </div>

                  {/* Primary Info: Objek Retribusi */}
                  <h4 className="font-black text-slate-900 text-base uppercase mb-1 leading-tight">
                    {item.namaPengendara}
                  </h4>

                  {/* Secondary Info: Vehicle + Location */}
                  <div className="flex items-center gap-3 text-xs mb-3">
                    <div className="flex items-center gap-1 text-green-600 font-bold">
                      <Truck size={12} />
                      <span>{item.jenisKendaraan}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1 text-slate-500 italic">
                      <MapPin size={12} />
                      <span>{item.wilayah}</span>
                    </div>
                  </div>

                  {/* Footer: Mandor + Tarif + Action */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-600 uppercase">
                        <User size={14} className="text-slate-400" />
                        {item.mandor}
                      </div>
                      <div className="text-lg font-black text-slate-900 mt-1">
                        <span className="text-green-600 text-xs mr-1 font-bold italic">Rp</span>
                        {Number(item.tarif).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all hover:shadow-md active:scale-95"
                      title="Hapus Data"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Mobile Empty State
            <div className="py-16 text-center">
              <FileSpreadsheet size={48} className="text-slate-200 mx-auto mb-4" />
              <div className="font-black text-slate-300 uppercase text-xl tracking-wider mb-2">
                Data Tidak Ditemukan
              </div>
              <p className="text-xs text-slate-400 px-4">Coba ubah filter untuk melihat data</p>
            </div>
          )
        ) : (
          // Desktop Table Layout
          <div className="overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0">
                <tr className="bg-gradient-to-r from-slate-900 to-slate-800">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.15em]">
                    <div className="flex items-center gap-2">
                      <Clock size={14} /> TANGGAL / WAKTU
                    </div>
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.15em]">
                    OBJEK RETRIBUSI
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.15em]">
                    MANDOR
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] text-center">
                    TOTAL MASUK
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] text-right">
                    TARIF
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] text-center">
                    AKSI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-32 text-center animate-pulse font-black text-slate-300"
                    >
                      MEMUAT DATA...
                    </td>
                  </tr>
                ) : laporan.length > 0 ? (
                  laporan.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-gradient-to-r hover:from-green-50/50 hover:to-blue-50/50 transition-all group border-l-4 ${idx % 2 === 0 ? 'border-l-transparent' : 'border-l-green-200/30'}`}
                    >
                      <td className="px-6 py-5">
                        <div className="font-black text-slate-900 text-sm italic">
                          {formatTanggalIndonesia(item.tanggalLengkap)}
                        </div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase mt-0.5 px-2 py-1 bg-slate-100 group-hover:bg-green-100 rounded transition-colors w-fit">
                          {item.waktu} WIB
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-black text-slate-900 uppercase text-sm group-hover:text-green-700 transition-colors">
                          {item.namaPengendara}
                        </div>
                        <div className="text-[9px] font-bold text-green-600 uppercase mt-1">
                          {item.jenisKendaraan} —{' '}
                          <span className="text-slate-400 italic font-medium">{item.wilayah}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-black text-slate-600 uppercase text-xs">
                          {item.mandor}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 group-hover:from-slate-900 group-hover:to-slate-800 group-hover:text-white transition-all rounded-lg font-black text-xs italic border border-blue-200/50 group-hover:border-slate-700">
                          KE-{item.kedatanganKe}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-slate-900 text-sm">
                        <span className="text-green-600 text-xs mr-1 font-bold italic">Rp</span>
                        {Number(item.tarif).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all hover:shadow-md active:scale-95"
                          title="Hapus Data"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-40 text-center">
                      <div className="inline-block">
                        <FileSpreadsheet size={48} className="text-slate-200 mx-auto mb-4" />
                        <div className="font-black text-slate-300 uppercase text-2xl tracking-[0.4em]">
                          Data Tidak Ditemukan
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          Coba ubah filter untuk melihat data
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

export default MonthlyReport;
