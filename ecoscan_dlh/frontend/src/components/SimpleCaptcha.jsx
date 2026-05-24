import React, { useState, useEffect } from 'react';
import { RotateCcw, ShieldCheck, Lock } from 'lucide-react';

const SimpleCaptcha = ({ onVerify }) => {
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const generateCaptcha = () => {
    // Generate 6 karakter kombinasi angka dan huruf (huruf besar saja untuk mudah dibaca)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setCaptchaCode(code);
    setUserInput('');
    setIsVerified(false);
    setErrorMessage('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleVerify = () => {
    if (userInput.toUpperCase() === captchaCode) {
      setIsVerified(true);
      setErrorMessage('');
      onVerify(true);
    } else {
      setErrorMessage('Kode CAPTCHA salah, silahkan coba lagi');
      setUserInput('');
      setIsVerified(false);
      onVerify(false);
    }
  };

  const handleRefresh = () => {
    generateCaptcha();
    onVerify(false);
  };

  return (
    <div className="w-full space-y-3">
      {/* CAPTCHA Title */}
      <div className="flex items-center gap-2 px-2">
        <div className="p-1.5 bg-gradient-to-br from-green-600 to-green-700 rounded-lg text-white shadow-lg">
          <Lock size={14} />
        </div>
        <label className="text-[9px] font-black uppercase text-slate-900 tracking-[0.25em]">
          Verifikasi
        </label>
      </div>

      {/* CAPTCHA Display Box - Compact */}
      <div className="flex items-center gap-2">
        <div
          className="flex-1 relative h-12 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 border-2 border-slate-200 rounded-lg px-3 py-1 font-mono font-black text-sm text-slate-800 tracking-[0.2em] text-center select-none shadow-inner overflow-hidden group flex items-center justify-center"
          style={{
            letterSpacing: '2px',
            fontFamily: 'monospace',
            fontSize: '14px',
          }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-5 text-slate-400 font-black text-3xl flex items-center justify-center pointer-events-none group-hover:opacity-10 transition-all">
            ●
          </div>
          <span className="relative">{captchaCode}</span>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 rounded-lg hover:from-slate-200 hover:to-slate-300 transition-all hover:shadow-md active:scale-95 border border-slate-200"
          title="Refresh CAPTCHA"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Input Field */}
      <div>
        <label className="text-[8px] font-black uppercase text-slate-500 ml-1 mb-1 block tracking-[0.2em]">
          Kode
        </label>
        <div className="flex gap-1.5 items-center">
          <input
            type="text"
            className="flex-1 p-2.5 bg-gradient-to-b from-white to-slate-50 rounded-lg outline-none font-bold text-slate-700 border-2 border-slate-200 focus:border-green-500 focus:from-white focus:to-green-50 focus:shadow-md transition-all shadow-sm uppercase text-xs"
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value.toUpperCase());
              setErrorMessage('');
            }}
            placeholder="6 chr"
            maxLength="6"
            required
          />
          <button
            type="button"
            onClick={handleVerify}
            className="px-3 py-2.5 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg font-black uppercase text-[8px] hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <ShieldCheck size={16} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="px-3 py-1.5 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-lg shadow-sm">
          <p className="text-[8px] font-bold text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Success Message */}
      {isVerified && (
        <div className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg shadow-sm flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
          <p className="text-[8px] font-black text-green-700 uppercase tracking-wide">
            ✓ Verifikasi Berhasil
          </p>
        </div>
      )}
    </div>
  );
};

export default SimpleCaptcha;
