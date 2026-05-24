import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Notification = ({
  type = 'success',
  title,
  message,
  duration = 4000,
  onClose,
  playSound = false,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Play sound jika diperlukan
    if (playSound && type === 'success') {
      playSuccessSound();
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, playSound, type]);

  const playSuccessSound = () => {
    // Buat suara success dengan Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Frekuensi nada (Hz)
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (Do Mi Sol)
    let currentNoteIndex = 0;

    const playNote = (freq, duration) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    // Main melody (ding dong sound)
    playNote(frequencies[0], 0.15);
    setTimeout(() => playNote(frequencies[1], 0.15), 150);
    setTimeout(() => playNote(frequencies[2], 0.3), 300);
  };

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const titleColor = type === 'success' ? 'text-green-900' : 'text-red-900';
  const messageColor = type === 'success' ? 'text-green-700' : 'text-red-700';
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';

  return (
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top fade-in duration-300">
      <div
        className={`${bgColor} border-2 rounded-[1.5rem] p-5 shadow-2xl max-w-md min-w-[350px] backdrop-blur-sm`}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`${iconColor} flex-shrink-0 mt-1`}>
            {type === 'success' ? (
              <CheckCircle size={28} className="stroke-[2.5]" />
            ) : (
              <AlertCircle size={28} className="stroke-[2.5]" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className={`font-black uppercase text-lg ${titleColor} tracking-tight`}>{title}</h3>
            <p className={`text-sm font-medium mt-1 ${messageColor}`}>{message}</p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose?.(), 300);
            }}
            className={`${iconColor} hover:opacity-70 transition-opacity flex-shrink-0 mt-1`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div
          className={`mt-4 h-1 rounded-full overflow-hidden ${type === 'success' ? 'bg-green-200' : 'bg-red-200'}`}
        >
          <div
            className={`h-full ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} rounded-full animate-shrink`}
            style={{
              animation: `shrink ${duration}ms linear forwards`,
              '@keyframes shrink': {
                from: { width: '100%' },
                to: { width: '0%' },
              },
            }}
          />
        </div>
      </div>

      <style>{`
                @keyframes shrink {
                    from {
                        width: 100%;
                    }
                    to {
                        width: 0%;
                    }
                }
                
                @keyframes slide-in-from-top {
                    from {
                        opacity: 0;
                        transform: translateY(-1rem);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-in {
                    animation: slide-in-from-top 0.3s ease-out;
                }
                
                .slide-in-from-top {
                    animation: slide-in-from-top 0.3s ease-out;
                }
                
                .fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
            `}</style>
    </div>
  );
};

export default Notification;
