import { useState, useEffect } from 'react';
import axios from '../../config/axiosInstance';
import API_BASE_URL from '../../config/api';

const HistoryPetugas = () => {
  const [history, setHistory] = useState([]);
  const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});

  useEffect(() => {
    const fetchMyHistory = async () => {
      try {
        const res = await axios.get('/api/admin/scans-today');
        if (res.data.success) {
          const myData = res.data.data.filter((item) => item.id_user === user.id);
          setHistory(myData);
        }
      } catch {
        console.error('Gagal ambil history');
      }
    };
    fetchMyHistory();
  }, [user.id]);

  return (
    <div className="space-y-10">
      <header>
        <div className="pl-4 border-l-8 border-green-500">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Riwayat <span className="text-green-600 italic">Scan Saya</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-4">
            Rekap Kerja Anda Hari Ini
          </p>
        </div>
      </header>

      <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-10 bg-slate-900 text-white flex justify-between items-center text-sm font-black tracking-widest uppercase">
          <h2>Daftar Armada Terproses</h2>
          <span className="bg-green-500 text-slate-900 px-6 py-2 rounded-full text-[10px]">
            {history.length} Scan
          </span>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="p-6">Waktu</th>
                <th className="p-6">Pengendara</th>
                <th className="p-6">Jenis Armada</th>
                <th className="p-6 text-center">Kedatangan Ke-</th>
              </tr>
            </thead>
            <tbody className="text-xs font-bold text-slate-600 italic">
              {history.length > 0 ? (
                history.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-all group"
                  >
                    <td className="p-6 text-slate-400 font-medium">
                      {new Date(item.tanggal).toLocaleTimeString()}
                    </td>
                    <td className="p-6 uppercase text-slate-900 font-black not-italic tracking-tight">
                      {item.nama_pengendara}
                    </td>
                    <td className="p-6 uppercase">{item.jenis_armada}</td>
                    <td className="p-6 text-center">
                      <span className="bg-slate-100 text-slate-900 px-5 py-2 rounded-full font-black group-hover:bg-green-600 group-hover:text-white transition-all">
                        {item.kedatangan_ke}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-slate-300 uppercase italic">
                    Belum ada data scan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryPetugas;
