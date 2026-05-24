const Support = () => {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-green-100">
        <h2 className="text-2xl font-bold text-green-800 mb-2 text-center">Butuh Bantuan?</h2>
        <p className="text-gray-500 text-center mb-8">
          Hubungi tim pengembang EcoScan DLH jika Anda mengalami kendala teknis.
        </p>

        <div className="space-y-4">
          <a
            href="https://wa.me/62812345678"
            className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-all border border-green-200"
          >
            <span className="text-2xl">💬</span>
            <div>
              <p className="font-bold text-green-900">WhatsApp Support</p>
              <p className="text-sm text-green-700">Respons cepat: 08:00 - 16:00</p>
            </div>
          </a>

          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <span className="text-2xl">📧</span>
            <div>
              <p className="font-bold text-blue-900">Email Developer</p>
              <p className="text-sm text-blue-700">support.ecoscan@dlh.go.id</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Aplikasi Versi 1.0.0 (PWA)
          </p>
          <p className="text-xs text-gray-400 mt-1">Dibuat dengan ❤️ untuk DLH yang lebih baik</p>
        </div>
      </div>
    </div>
  );
};

export default Support;
