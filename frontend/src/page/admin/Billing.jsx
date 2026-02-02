import { useState, useEffect, useCallback } from 'react';
import axios from '../../config/axiosInstance';
import * as XLSX from 'xlsx';
import { CreditCard, Calendar, Download, Save, TrendingUp } from 'lucide-react';
import Notification from '../../components/Notification';

const IdBilling = () => {
  const [billingData, setBillingData] = useState([]);
  const [filterTanggal, setFilterTanggal] = useState('');
  const [filterBulan, setFilterBulan] = useState(new Date().toISOString().slice(0, 7));
  const [modeFilter, setModeFilter] = useState('bulan');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchBillingData = useCallback(async () => {
    setLoading(true);
    try {
      const query = modeFilter === 'hari' ? `tanggal=${filterTanggal}` : `bulan=${filterBulan}`;

      // Menggunakan endpoint laporan yang sudah ada karena datanya serupa
      const res = await axios.get(`/api/scan/laporan?${query}`);

      // Pastikan data response adalah array
      const rows = Array.isArray(res.data) ? res.data : res.data?.data ?? [];

      // Grouping data berdasarkan Objek Retribusi untuk menghitung akumulasi
      const grouped = rows.reduce((acc, curr) => {
        const key = curr.namaPengendara || 'Unknown';
        if (!acc[key]) {
          acc[key] = {
            nama: curr.namaPengendara || '-',
            armada: curr.jenisKendaraan || '-',
            wilayah: curr.wilayah || '-',
            mandor: curr.mandor || '-',
            tarif: Number(curr.tarif) || 0,
            jumlahKedatangan: 0,
            total: 0,
          };
        }
        acc[key].jumlahKedatangan += 1;
        acc[key].total += Number(curr.tarif) || 0;
        return acc;
      }, {});

      setBillingData(Object.values(grouped));
    } catch (err) {
      console.error('Error load billing data', err);
      setNotification({
        type: 'error',
        title: '✗ GAGAL MUAT DATA',
        message: err?.response?.data?.message || err.message || 'Gagal mengambil data billing dari backend',
        playSound: false,
      });
    } finally {
      setLoading(false);
    }
  }, [filterBulan, filterTanggal, modeFilter]);

  useEffect(() => {
    if (modeFilter === 'hari' && !filterTanggal) return;
    fetchBillingData();
  }, [fetchBillingData, filterBulan, filterTanggal, modeFilter]);

  const handleExportExcel = () => {
    if (billingData.length === 0) {
      setNotification({
        type: 'error',
        title: '✗ DATA KOSONG',
        message: 'Tidak ada data untuk diekspor. Silahkan filter data terlebih dahulu.',
        playSound: false,
      });
      return;
    }

    const dataExcel = billingData.map((item, index) => ({
      No: index + 1,
      'Objek Retribusi': item.nama,
      Jenis: item.armada,
      Wilayah: item.wilayah,
      Mandor: item.mandor,
      'Tarif Satuan': item.tarif,
      'Jumlah Kedatangan': item.jumlahKedatangan,
      'Total Tagihan': item.total,
    }));

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ID Billing');
    const fileName =
      modeFilter === 'hari' ? `Billing_Harian_${filterTanggal}` : `Billing_Bulanan_${filterBulan}`;
    XLSX.writeFile(wb, `${fileName}.xlsx`);

    setNotification({
      type: 'success',
      title: '✓ BERHASIL DIEKSPOR',
      message: `File "${fileName}.xlsx" berhasil diunduh.`,
      playSound: true,
    });
  };

  const handleGenerateBilling = async () => {
    if (billingData.length === 0) {
      setNotification({
        type: 'error',
        title: '✗ DATA KOSONG',
        message: 'Tidak ada data untuk di-generate ke database.',
        playSound: false,
      });
      return;
    }

    try {
      const query = modeFilter === 'hari' ? `tanggal=${filterTanggal}` : `bulan=${filterBulan}`;

      const res = await axios.post(`/api/scan/generate-billing?${query}`);

      if (res.data.success) {
        setNotification({
          type: 'success',
          title: '✓ BILLING BERHASIL DI-GENERATE',
          message: `Periode: ${res.data.data.periode} | Petugas: ${res.data.data.jumlahPetugas} | Total: Rp ${res.data.data.totalBilling.toLocaleString('id-ID')}`,
          playSound: true,
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        title: '✗ GAGAL GENERATE BILLING',
        message: err.response?.data?.message || err.message,
        playSound: false,
      });
    }
  };

  const filteredBillingData = billingData;

  const totalTagihan = filteredBillingData.reduce((sum, item) => sum + item.total, 0);
  const totalKedatangan = filteredBillingData.reduce((sum, item) => sum + item.jumlahKedatangan, 0);

  return (
    <div className="p-8 bg-gradient-to-b from-slate-50 via-green-50/20 to-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex items-center gap-5">
          <div className="p-5 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl text-white shadow-xl shadow-green-300/50">
            <TrendingUp size={36} />
          </div>
          <div>
            <h2 className="font-black italic uppercase text-4xl text-slate-900 tracking-tighter leading-none">
              ID{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                BILLING
              </span>
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
              Akumulasi Tagihan & Export Retribusi
            </p>
          </div>
        </div>

        {/* Filter Controls */}
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
            className="bg-gradient-to-br from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white px-6 py-2.5 rounded-lg font-black text-xs tracking-widest flex items-center gap-2 transition-all active:scale-95 hover:shadow-lg"
          >
            <Download size={16} /> EKSPOR
          </button>

          <button
            onClick={handleGenerateBilling}
            className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2.5 rounded-lg font-black text-xs tracking-widest flex items-center gap-2 transition-all active:scale-95 hover:shadow-lg"
          >
            <Save size={16} /> SIMPAN
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {billingData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 p-4 rounded-xl shadow-md border border-slate-200/50 backdrop-blur-sm">
            <p className="text-[9px] font-black uppercase text-slate-500 mb-1">
              Total Objek Retribusi
            </p>
            <p className="text-3xl font-black text-slate-900">{filteredBillingData.length}</p>
          </div>
          <div className="bg-gradient-to-br from-white via-green-50/30 to-slate-50/50 p-4 rounded-xl shadow-md border border-slate-200/50 backdrop-blur-sm">
            <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Total Tagihan</p>
            <p className="text-lg font-black text-green-600">
              Rp {totalTagihan.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-gradient-to-br from-white via-amber-50/30 to-slate-50/50 p-4 rounded-xl shadow-md border border-slate-200/50 backdrop-blur-sm">
            <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Total Kedatangan</p>
            <p className="text-3xl font-black text-slate-900">{totalKedatangan}</p>
          </div>
          <div className="bg-gradient-to-br from-white via-purple-50/30 to-slate-50/50 p-4 rounded-xl shadow-md border border-slate-200/50 backdrop-blur-sm">
            <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Rata-rata</p>
            <p className="text-lg font-black text-slate-900">
              Rp {Math.round(totalTagihan / filteredBillingData.length).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="bg-gradient-to-br from-white via-slate-50/50 to-green-50/30 rounded-2xl shadow-xl overflow-hidden border border-slate-200/50 hover:shadow-2xl transition-all backdrop-blur-sm">
        <div className="overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0">
              <tr className="bg-gradient-to-r from-slate-900 to-slate-800">
                <th className="px-6 py-5 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.15em]">
                  NO
                </th>
                <th className="px-8 py-5 min-w-[200px] text-[10px] font-black text-slate-300 uppercase tracking-[0.15em]">
                  OBJEK RETRIBUSI
                </th>
                <th className="px-6 py-5 min-w-[130px] text-[10px] font-black text-slate-300 uppercase tracking-[0.15em]">
                  MANDOR
                </th>
                <th className="px-6 py-5 text-right min-w-[120px] text-[10px] font-black text-slate-300 uppercase tracking-[0.15em]">
                  TARIF
                </th>
                <th className="px-6 py-5 text-center min-w-[160px] text-[10px] font-black text-slate-300 uppercase tracking-[0.15em]">
                  JUMLAH
                </th>
                <th className="px-6 py-5 text-right min-w-[150px] text-[10px] font-black text-slate-300 uppercase tracking-[0.15em]">
                  TOTAL TAGIHAN
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
                    MENGHITUNG BILLING...
                  </td>
                </tr>
              ) : filteredBillingData.length > 0 ? (
                filteredBillingData.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-green-300"
                  >
                    <td className="px-6 py-5 text-center font-black text-slate-400 text-sm">
                      {index + 1}
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-black text-slate-900 uppercase text-sm group-hover:text-green-700 transition-colors leading-tight">
                        {item.nama}
                      </div>
                      <div className="text-[9px] font-bold text-green-600 uppercase tracking-tighter mt-0.5">
                        {item.armada} —{' '}
                        <span className="text-slate-400 italic font-medium">{item.wilayah}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-black text-slate-600 uppercase text-xs">
                        {item.mandor}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-slate-600 text-sm">
                      Rp {item.tarif.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-green-100 to-emerald-50 group-hover:from-slate-900 group-hover:to-slate-800 group-hover:text-white transition-all rounded-lg font-black text-xs border border-green-200/50 group-hover:border-slate-700">
                        {item.jumlahKedatangan}x
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="font-black text-slate-900 text-lg">
                        <span className="text-green-600 text-xs mr-1 font-bold italic">Rp</span>
                        {item.total.toLocaleString('id-ID')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-40 text-center">
                    <div className="inline-block">
                      <CreditCard size={48} className="text-slate-200 mx-auto mb-4" />
                      <div className="font-black text-slate-300 uppercase text-2xl tracking-[0.4em]">
                        Tidak Ada Data
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Coba ubah filter untuk melihat data billing
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
    </div>
  );
};

export default IdBilling;
