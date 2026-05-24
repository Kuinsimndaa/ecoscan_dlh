import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

const ConfirmationModal = ({
  type = 'warning',
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'BATAL',
  isOpen = false,
}) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleConfirm = () => {
    setIsVisible(false);
    setTimeout(() => {
      onConfirm?.();
    }, 200);
  };

  const handleCancel = () => {
    setIsVisible(false);
    setTimeout(() => {
      onCancel?.();
    }, 200);
  };

  if (!isVisible) return null;

  const bgColor =
    type === 'warning'
      ? 'bg-yellow-50 border-yellow-200'
      : type === 'error'
        ? 'bg-red-50 border-red-200'
        : 'bg-blue-50 border-blue-200';
  const titleColor =
    type === 'warning' ? 'text-yellow-900' : type === 'error' ? 'text-red-900' : 'text-blue-900';
  const messageColor =
    type === 'warning' ? 'text-yellow-700' : type === 'error' ? 'text-red-700' : 'text-blue-700';
  const iconColor =
    type === 'warning' ? 'text-yellow-500' : type === 'error' ? 'text-red-500' : 'text-blue-500';
  const buttonPrimaryBg =
    type === 'warning'
      ? 'bg-yellow-500 hover:bg-yellow-600'
      : type === 'error'
        ? 'bg-red-500 hover:bg-red-600'
        : 'bg-blue-500 hover:bg-blue-600';

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div
        className={`${bgColor} border-2 rounded-[2rem] p-8 shadow-2xl max-w-md w-[90vw] animate-in scale-in duration-300`}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`${iconColor} p-4 bg-white rounded-full`}>
            {type === 'error' ? (
              <AlertCircle size={40} className="stroke-[2]" />
            ) : type === 'warning' ? (
              <AlertCircle size={40} className="stroke-[2]" />
            ) : (
              <CheckCircle size={40} className="stroke-[2]" />
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          className={`font-black uppercase text-center text-xl ${titleColor} tracking-tight mb-3`}
        >
          {title}
        </h3>

        {/* Message */}
        <p className={`text-center text-sm font-medium ${messageColor} mb-8`}>{message}</p>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-black uppercase text-xs tracking-wide hover:bg-slate-50 transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 py-4 ${buttonPrimaryBg} text-white rounded-xl font-black uppercase text-xs tracking-wide transition-all active:scale-95 shadow-lg`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
