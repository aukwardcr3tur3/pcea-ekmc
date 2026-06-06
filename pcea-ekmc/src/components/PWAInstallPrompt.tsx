import React, { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallVisible, setIsInstallVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallVisible(false);
  };

  return (
    <>
      <AnimatePresence>
        {isInstallVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-[60] bg-primary text-white p-6 rounded-[2rem] shadow-2xl border border-white/20 backdrop-blur-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Smartphone size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-lg">Install Church App</h4>
                  <p className="text-white/80 text-sm leading-tight">
                    Add this app to your home screen for quick access and offline use.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsInstallVisible(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-6">
              <button
                onClick={handleInstallClick}
                className="w-full py-3 bg-white text-primary rounded-full font-bold flex items-center justify-center space-x-2 hover:bg-white/90 transition-all shadow-md"
              >
                <Download size={18} />
                <span>Install Now</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
