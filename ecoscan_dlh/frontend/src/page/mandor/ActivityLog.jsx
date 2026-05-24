const ActivityLog = ({ history }) => {
  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
      <h2 className="font-black uppercase tracking-widest text-sm mb-6 border-b pb-4 text-slate-900">
        Aktivitas Anda Hari Ini
      </h2>
      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
        {history.length > 0 ? (
          history.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-green-300 transition-all"
            >
              <div>
                <p className="text-xs font-black text-slate-900 uppercase">
                  {item.nama_pengendara}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">
                  {item.jenis_armada} • {item.wilayah}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-green-600 italic tracking-tighter">
                  MASUK KE-{item.kedatangan_ke}
                </p>
                <p className="text-[8px] font-bold text-slate-400">
                  {new Date(item.tanggal).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase italic">
              Belum ada aktivitas
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
