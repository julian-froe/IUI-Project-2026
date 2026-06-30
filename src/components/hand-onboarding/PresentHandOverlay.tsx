import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { HandTrackingState } from "../../context/HandModeContext";
import { PRESENT_HAND_DELAY } from "./constants";
import { ShakaIcon } from "./components/GestureIcons";

export function PresentHandOverlay({
  tracking,
  onReady,
  onCancel,
}: {
  tracking: HandTrackingState;
  onReady: () => void;
  onCancel: () => void;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (tracking.cameraStatus !== "granted" || !tracking.isShaka) {
      setProgress(0);
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const nextProgress = Math.min((Date.now() - startedAt) / PRESENT_HAND_DELAY, 1);
      setProgress(nextProgress);

      if (nextProgress >= 1) {
        window.clearInterval(timer);
        onReady();
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [tracking.cameraStatus, tracking.isShaka, onReady]);

  if (tracking.cameraStatus !== "granted") {
    return null;
  }

  return (
    <div
      data-hand-onboarding
      className="fixed inset-0 z-[9998] bg-black/65 backdrop-blur-md flex items-center justify-center px-6 text-white"
    >
      <button
        type="button"
        onClick={onCancel}
        className="absolute top-6 right-6 w-11 h-11 border border-white/50 bg-black/20 text-white font-black text-sm hover:bg-white hover:text-black transition-colors"
        aria-label="Close onboarding"
      >
        X
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center"
      >
        <div className="w-36 h-36 mb-8">
          <ShakaIcon />
        </div>
        <h1 className="font-sans font-black text-4xl md:text-5xl uppercase tracking-tighter">
          {tracking.isShaka ? "Hold it there" : "Show the shaka sign"}
        </h1>
        <p className="mt-6 max-w-lg text-white/80 font-sans text-lg leading-relaxed">
          {tracking.isShaka
            ? "Hand tracking starts in 2 seconds."
            : "Hold for 2 seconds to start hand tracking."}
        </p>
        <p className="mt-4 max-w-lg text-white/70 font-sans text-lg leading-relaxed">
          Hold for 2 seconds again anytime to pause or resume.
        </p>
        <div className="mt-8 w-72 h-2 bg-white/20 overflow-hidden">
          <motion.div
            className="h-full bg-white"
            animate={{ width: `${Math.round(progress * 100)}%` }}
            transition={{ duration: 0.08 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
