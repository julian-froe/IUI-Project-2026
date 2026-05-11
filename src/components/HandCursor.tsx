import { useEffect, useRef, useState } from "react";
import { Hands, Results } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { motion, AnimatePresence } from "motion/react";

const STICKY_THRESHOLD = 150; // pixels
const PINCH_THRESHOLD = 0.05; // normalized distance

export default function HandCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isPinching, setIsPinching] = useState(false);
  const [stickyTarget, setStickyTarget] = useState<HTMLElement | null>(null);
  const [isActive, setIsActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const pinchStartPos = useRef<{ x: number, y: number } | null>(null);
  const scrollStartTop = useRef<number>(0);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!videoRef.current) return;

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results: Results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        setIsActive(true);
        const landmarks = results.multiHandLandmarks[0];
        
        // Thumb tip (4) and Index tip (8)
        const thumb = landmarks[4];
        const index = landmarks[8];
        
        // Midpoint for cursor
        const midX = (thumb.x + index.x) / 2;
        const midY = (thumb.y + index.y) / 2;
        
        // Smooth positioning (Lerp)
        const targetX = (1 - midX) * window.innerWidth;
        const targetY = midY * window.innerHeight;
        
        const smoothX = lastPos.current.x + (targetX - lastPos.current.x) * 0.3;
        const smoothY = lastPos.current.y + (targetY - lastPos.current.y) * 0.3;
        
        lastPos.current = { x: smoothX, y: smoothY };
        
        // Find sticky target
        findStickyTarget(smoothX, smoothY);

        // Distance for pinch detection
        const dx = thumb.x - index.x;
        const dy = thumb.y - index.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < PINCH_THRESHOLD) {
          if (!isPinching) {
            handlePinchStart(smoothX, smoothY);
          } else {
            handlePinchMove(smoothY);
          }
          setIsPinching(true);
        } else {
          if (isPinching) {
            handlePinchEnd(smoothX, smoothY);
          }
          setIsPinching(false);
        }

        setPosition({ x: smoothX, y: smoothY });
      } else {
        setIsActive(false);
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current! });
      },
      width: 640,
      height: 480,
    });
    camera.start();

    return () => {
      camera.stop();
      hands.close();
    };
  }, [isPinching]);

  const findStickyTarget = (x: number, y: number) => {
    const elements = document.querySelectorAll('button, a, [role="button"]');
    let closest: HTMLElement | null = null;
    let minDeviceInfo = Infinity;

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const d = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

      if (d < STICKY_THRESHOLD && d < minDeviceInfo) {
        minDeviceInfo = d;
        closest = el as HTMLElement;
      }
    });

    setStickyTarget(closest);
  };

  const handlePinchStart = (x: number, y: number) => {
    pinchStartPos.current = { x, y };
    scrollStartTop.current = window.scrollY;
  };

  const handlePinchMove = (y: number) => {
    if (pinchStartPos.current && !stickyTarget) {
      const deltaY = (pinchStartPos.current.y - y) * 2;
      window.scrollTo(0, scrollStartTop.current + deltaY);
    }
  };

  const handlePinchEnd = (x: number, y: number) => {
    if (stickyTarget) {
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      stickyTarget.dispatchEvent(clickEvent);
      
      // Also handle link navigation if it's an 'A' tag
      if (stickyTarget.tagName === 'A') {
        (stickyTarget as HTMLAnchorElement).click();
      }
    }
    pinchStartPos.current = null;
  };

  // Calculate final visual position (stick to target if exists)
  let visualX = position.x;
  let visualY = position.y;

  if (stickyTarget) {
    const rect = stickyTarget.getBoundingClientRect();
    visualX = rect.left + rect.width / 2;
    visualY = rect.top + rect.height / 2;
  }

  return (
    <>
      <video ref={videoRef} className="hidden" playsInline muted />
      
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                x: visualX - (isPinching ? 10 : 20), 
                y: visualY - (isPinching ? 10 : 20),
                scale: isPinching ? 0.8 : 1,
                opacity: 1
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.5 }}
              className={`fixed w-10 h-10 rounded-full border-2 border-black flex items-center justify-center transition-colors duration-300 ${
                isPinching ? "bg-black" : "bg-white/30 backdrop-blur-sm"
              }`}
            >
              {isPinching && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-white rounded-full" 
                />
              )}
              
              {stickyTarget && !isPinching && (
                <div className="absolute inset-0 rounded-full border-4 border-black animate-ping opacity-20" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Calibration/Status hint */}
      <div className="fixed bottom-6 right-6 z-[9999] font-mono text-[10px] tracking-widest uppercase flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
        {isActive ? "Hand Ready" : "Initializing Hand Tracking..."}
      </div>
    </>
  );
}
