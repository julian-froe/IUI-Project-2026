import { useEffect, useRef, useState, useCallback } from "react";
import * as mpHands from "@mediapipe/hands";
import type { Results } from "@mediapipe/hands";
import * as mpCamera from "@mediapipe/camera_utils";
import { motion, AnimatePresence } from "motion/react";
import { useHandMode } from "../context/HandModeContext";

const STICKY_THRESHOLD = 200;
const PINCH_THRESHOLD = 0.04;
const FIST_THRESHOLD = 0.12;
const DWELL_DURATION = 1500;
const SCROLL_VELOCITY_MULTIPLIER = 1.8; // Safe multiplier for the Reel experience

export default function HandCursor() {
  const { isHandModeEnabled, setIsHandModeEnabled } = useHandMode();
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [gesture, setGesture] = useState<"none" | "pinch" | "fist">("none");
  const [stickyTarget, setStickyTarget] = useState<HTMLElement | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const pinchStartTime = useRef<number | null>(null);
  const lastHandPos = useRef<{ x: number, y: number } | null>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const audioContextIdx = useRef<AudioContext | null>(null);
  
  const stickyTargetRef = useRef<HTMLElement | null>(null);
  const resultsRef = useRef<Results | null>(null);
  
  const circleRef = useRef<SVGCircleElement>(null);

  const radius = 24;
  const circumference = 2 * Math.PI * radius;

  const playClickSound = useCallback(() => {
    try {
      if (!audioContextIdx.current) {
        audioContextIdx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextIdx.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn("Audio context failed", e);
    }
  },[]);

  useEffect(() => {
    if (isHandModeEnabled && cameraStatus === 'idle') {
      setCameraStatus('requesting');
      
      // FIX: Safely check if the browser allows camera API access (requires HTTPS/Localhost)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Camera API not available (requires HTTPS or localhost).");
        setCameraStatus('denied');
        setTimeout(() => {
          setIsHandModeEnabled(false);
          setCameraStatus('idle');
        }, 4000);
        return;
      }

      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          stream.getTracks().forEach(track => track.stop());
          setCameraStatus('granted');
        })
        .catch((err) => {
          console.error("Camera access denied:", err);
          setCameraStatus('denied');
          setTimeout(() => {
            setIsHandModeEnabled(false);
            setCameraStatus('idle');
          }, 4000);
        });
    } else if (!isHandModeEnabled) {
      setCameraStatus('idle');
      document.body.classList.remove('hide-cursor');
    }
  }, [isHandModeEnabled, cameraStatus, setIsHandModeEnabled]);

  useEffect(() => {
    if (cameraStatus !== 'granted' || !videoRef.current) {
      setIsActive(false);
      return;
    }

    const Hands = mpHands.Hands || (mpHands as any).default?.Hands || (window as any).Hands;
    const Camera = mpCamera.Camera || (mpCamera as any).default?.Camera || (window as any).Camera;

    const hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
    hands.onResults((results: Results) => { resultsRef.current = results; });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => { if (videoRef.current) await hands.send({ image: videoRef.current }); },
      width: 480, height: 360,
    });
    
    camera.start();

    const handleMouseMove = () => document.body.classList.remove('hide-cursor');
    window.addEventListener('mousemove', handleMouseMove);

    let rafId: number;
    const updateLoop = () => {
      const results = resultsRef.current;
      if (results && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        setIsActive(true);
        document.body.classList.add('hide-cursor');

        const landmarks = results.multiHandLandmarks[0];
        const wrist = landmarks[0];
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        
        const midX = (thumbTip.x + indexTip.x) / 2;
        const midY = (thumbTip.y + indexTip.y) / 2;
        
        const targetX = (1 - midX) * window.innerWidth;
        const targetY = midY * window.innerHeight;
        
        const smoothX = lastPos.current.x + (targetX - lastPos.current.x) * 0.45;
        const smoothY = lastPos.current.y + (targetY - lastPos.current.y) * 0.45;
        lastPos.current = { x: smoothX, y: smoothY };
        
        const pinchDist = Math.sqrt(Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2));
        const isPinching = pinchDist < PINCH_THRESHOLD;

        const fingerTips = [indexTip, landmarks[12], landmarks[16], landmarks[20]];
        const avgTipDist = fingerTips.reduce((acc, tip) => acc + Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2)), 0) / 4;
        const isFist = avgTipDist < FIST_THRESHOLD && !isPinching;

        if (isFist) {
          if (gesture !== "fist") {
            setGesture("fist");
            document.body.classList.add("is-fist-scrolling"); // Disables snapping!
          }
          if (circleRef.current) circleRef.current.style.strokeDashoffset = String(circumference);
          pinchStartTime.current = null;
          
          if (lastHandPos.current) {
            const deltaY = (lastHandPos.current.y - smoothY) * SCROLL_VELOCITY_MULTIPLIER;
            
            const elementUnderCursor = document.elementFromPoint(smoothX, smoothY);
            
            // Re-added specific tags to accurately catch all Tailwind overflow varieties
            const scrollContainer = elementUnderCursor?.closest('.overflow-y-scroll, .overflow-auto, .overflow-y-auto, [data-scrollable="true"]');
            
            if (scrollContainer) {
               scrollContainer.scrollBy(0, deltaY); 
            } else {
               window.scrollBy(0, deltaY);
            }
          }
          lastHandPos.current = { x: smoothX, y: smoothY };
        } 
        else if (isPinching) {
          if (gesture !== "pinch") {
            setGesture("pinch");
            document.body.classList.remove("is-fist-scrolling");
          }
          lastHandPos.current = null;
          
          if (pinchStartTime.current === null) {
            pinchStartTime.current = Date.now();
          } else {
            const elapsed = Date.now() - pinchStartTime.current;
            const progress = Math.min(elapsed / DWELL_DURATION, 1);
            
            if (circleRef.current) {
              circleRef.current.style.strokeDashoffset = String(circumference - progress * circumference);
            }
            
            if (progress >= 1) {
              triggerClick(smoothX, smoothY);
              pinchStartTime.current = null;
              if (circleRef.current) circleRef.current.style.strokeDashoffset = String(circumference);
            }
          }
        } 
        else {
          if (gesture !== "none") {
            setGesture("none");
            document.body.classList.remove("is-fist-scrolling");
          }
          if (circleRef.current) circleRef.current.style.strokeDashoffset = String(circumference);
          pinchStartTime.current = null;
          lastHandPos.current = null;
          findStickyTarget(smoothX, smoothY);
        }

        setPosition({ x: smoothX, y: smoothY });
      } else {
        setIsActive(false);
        document.body.classList.remove("is-fist-scrolling");
        
        if (stickyTargetRef.current) {
          stickyTargetRef.current.removeAttribute("data-hand-hover");
          stickyTargetRef.current = null;
          setStickyTarget(null);
        }
      }
      rafId = requestAnimationFrame(updateLoop);
    };

    rafId = requestAnimationFrame(updateLoop);

    return () => {
      camera.stop();
      hands.close();
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.classList.remove('hide-cursor');
      document.body.classList.remove('is-fist-scrolling');
      if (stickyTargetRef.current) stickyTargetRef.current.removeAttribute("data-hand-hover");
    };
  }, [cameraStatus, playClickSound]);

  const findStickyTarget = (x: number, y: number) => {
    if (gesture === "fist") {
      if (stickyTargetRef.current) {
        stickyTargetRef.current.removeAttribute("data-hand-hover");
        stickyTargetRef.current = null;
        setStickyTarget(null);
      }
      return;
    }

    const elements = document.querySelectorAll('button, a, [role="button"], .group');
    let closest: HTMLElement | null = null;
    let minD = Infinity;

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const d = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

      if (d < STICKY_THRESHOLD && d < minD) {
        minD = d;
        closest = el as HTMLElement;
      }
    });

    if (stickyTargetRef.current && stickyTargetRef.current !== closest) {
      stickyTargetRef.current.removeAttribute("data-hand-hover");
    }
    if (closest) (closest as HTMLElement).setAttribute("data-hand-hover", "true");
    
    stickyTargetRef.current = closest;
    setStickyTarget(closest);
  };

  const triggerClick = (x: number, y: number) => {
    const el = stickyTargetRef.current || document.elementFromPoint(x, y);
    if (el) {
      playClickSound();
      if (el instanceof HTMLElement) {
        el.click(); 
      } else {
        const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true, view: window });
        el.dispatchEvent(clickEvent);
      }
    }
  };

  if (!isHandModeEnabled) return null;

  if (cameraStatus === 'requesting' || cameraStatus === 'denied') {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-sm">
        <div className="bg-white border border-black p-8 max-w-md text-center shadow-2xl">
          <h2 className="font-sans font-black text-2xl uppercase tracking-tighter mb-4">Camera Access Required</h2>
          <p className="font-sans text-sm text-neutral-600 mb-8 leading-relaxed">
            {cameraStatus === 'requesting' 
              ? "We cannot bypass your browser's security. Please allow camera access in the native prompt to enable Hand Tracking Mode."
              : "Camera access was denied. Hand mode disabled. Please reset your browser permissions to try again."}
          </p>
          {cameraStatus === 'requesting' && <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />}
        </div>
      </div>
    );
  }

  let visualX = position.x;
  let visualY = position.y;

  if (stickyTarget && gesture !== "fist") {
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
              animate={{ x: visualX - 40, y: visualY - 40, scale: gesture === "fist" ? 0.8 : 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="fixed w-20 h-20 flex items-center justify-center"
            >
              <div className={`absolute inset-0 rounded-full border-2 border-blue-500/30 backdrop-blur-[2px] transition-all duration-300 ${
                gesture !== "none" ? "scale-110 bg-blue-500/10" : "scale-100 bg-white/5"
              }`} />
              
              <svg className="absolute inset-0 w-20 h-20 -rotate-90">
                <circle
                  ref={circleRef}
                  cx="40"
                  cy="40"
                  r={radius}
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  style={{ strokeDashoffset: circumference, transition: "none" }}
                  strokeLinecap="round"
                />
              </svg>

              <div className={`transition-transform duration-300 ${gesture === "fist" ? "scale-125" : "scale-100"}`}>
                {gesture === "fist" ? (
                  <div className="w-4 h-4 bg-blue-600 rounded-sm rotate-45" />
                ) : (
                  <div className={`w-3 h-3 rounded-full transition-colors ${gesture === "pinch" ? "bg-blue-600 scale-150" : "bg-blue-500"}`} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-6 right-6 z-[9999] bg-white/90 backdrop-blur-md border border-blue-100 px-4 py-2 rounded-none font-mono text-[9px] tracking-widest uppercase flex flex-col items-start gap-1 shadow-lg">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isActive ? "bg-blue-500" : "bg-red-500 animate-pulse"}`} />
          {isActive ? "System Ready" : "Initializing..."}
        </div>
        {isActive && (
          <div className="text-[8px] opacity-60">
            {gesture === "fist" ? "Action: Scrolling" : gesture === "pinch" ? "Action: Selecting" : "Status: Tracking"}
          </div>
        )}
      </div>
    </>
  );
}