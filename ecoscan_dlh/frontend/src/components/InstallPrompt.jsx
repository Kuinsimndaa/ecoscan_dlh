import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);

  useEffect(() => {
    // Handle install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setSwRegistration(registration);

        // Check for updates periodically (reduced frequency)
        setInterval(() => {
          registration.update();
        }, 300000); // Check every 5 minutes

        // Listen for controller change (update applied)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          setUpdateAvailable(true);
        });

        // Listen for new service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              setUpdateAvailable(true);
            }
          });
        });
      });
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install prompt error:', error);
    }
  };

  const handleUpdateClick = () => {
    if (swRegistration?.waiting) {
      // Tell the service worker to skip waiting
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Reload the page when controller changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  };

  if (!showInstallPrompt && !updateAvailable) {
    return null;
  }

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="bg-white shadow-xl rounded-lg p-4 border-l-4 border-green-500 max-w-xs">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Pasang Aplikasi</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Pasang EcoScan DLH di perangkat Anda untuk akses lebih cepat
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleInstallClick}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                  >
                    Pasang
                  </button>
                  <button
                    onClick={() => setShowInstallPrompt(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded hover:bg-gray-300 transition-colors"
                  >
                    Nanti
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Available Prompt */}
      {updateAvailable && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="bg-white shadow-xl rounded-lg p-4 border-l-4 border-blue-500 max-w-xs">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Update Tersedia</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Versi terbaru EcoScan DLH siap diinstall
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleUpdateClick}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                  >
                    Update Sekarang
                  </button>
                  <button
                    onClick={() => setUpdateAvailable(false)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
