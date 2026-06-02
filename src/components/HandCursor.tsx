import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useHandMode } from "../context/HandModeContext";

const STICKY_THRESHOLD = 200;
const PINCH_THRESHOLD = 0.04;
const FIST_THRESHOLD = 0.12;
const DWELL_DURATION = 1500;
const SCROLL_VELOCITY_MULTIPLIER = 1.8;

type NormalizedLandmark = { x: number; y: number };
type MappedResults = { multiHandLandmarks: NormalizedLandmark[][] };

export default function HandCursor() {
  const { isHandModeEnabled, setIsHandModeEnabled } = useHandMode();
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [gesture, setGesture] = useState<"none" | "pinch" | "fist">("none");
  const [stickyTarget, setStickyTarget] = useState<HTMLElement | null>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const pinchStartTime = useRef<number | null>(null);
  const lastHandPos = useRef<{ x: number, y: number } | null>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const audioContextIdx = useRef<AudioContext | null>(null);
  
  const stickyTargetRef = useRef<HTMLElement | null>(null);
  const resultsRef = useRef<MappedResults | null>(null);
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

  // 1. Initial Permission Check
  useEffect(() => {
    if (isHandModeEnabled && cameraStatus === 'idle') {
      setCameraStatus('requesting');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Camera API not available.");
        setCameraStatus('denied');
        setTimeout(() => { setIsHandModeEnabled(false); setCameraStatus('idle'); }, 4000);
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
          setTimeout(() => { setIsHandModeEnabled(false); setCameraStatus('idle'); }, 4000);
        });
    } else if (!isHandModeEnabled) {
      setCameraStatus('idle');
      setIsModelReady(false);
      document.body.classList.remove('hide-cursor');
    }
  }, [isHandModeEnabled, cameraStatus, setIsHandModeEnabled]);

  // 2. Camera & ml5 Pipeline
  useEffect(() => {
    if (cameraStatus !== 'granted' || !videoRef.current) {
      setIsActive(false);
      return;
    }

    let handPoseModel: any = null;
    let stream: MediaStream | null = null;
    let isComponentActive = true;
    let rafId: number;

    const initSystem = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" }
        });

        if (!videoRef.current || !isComponentActive) return;
        
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(e => console.warn("Auto-play warning:", e));

        // Wait until video explicitly has width
        await new Promise<void>((resolve) => {
          const checkReady = () => {
            if (videoRef.current && videoRef.current.videoWidth > 0) resolve();
            else requestAnimationFrame(checkReady);
          };
          checkReady();
        });

        if (!isComponentActive) return;

        // VITAL FIX: We properly `await` the model here so we get the AI object, not a Promise!
        handPoseModel = await (window as any).ml5.handPose({ maxHands: 1, flipped: false });
        console.log("✅ ml5 model loaded and unwrapped successfully!");
        
        if (!isComponentActive) return;
        setIsModelReady(true);

        // Now we can safely call detectStart on the actual model object
        handPoseModel.detectStart(videoRef.current, (results: any[]) => {
          if (!isComponentActive) return;
          
          if (results && results.length > 0) {
            const hand = results[0];
            const points = hand.keypoints || hand.landmarks;
            
            if (points && Array.isArray(points) && points.length > 8) {
              const videoW = videoRef.current?.videoWidth || 640;
              const videoH = videoRef.current?.videoHeight || 480;
              
              const mappedLandmarks = points.map((kp: any) => {
                const rawX = kp.x !== undefined ? kp.x : (kp[0] || 0);
                const rawY = kp.y !== undefined ? kp.y : (kp[1] || 0);
                
                // ml5 gives absolute pixels (e.g. 320x240). We map them to 0.0-1.0
                const finalX = rawX > 1.5 ? rawX / videoW : rawX;
                const finalY = rawY > 1.5 ? rawY / videoH : rawY;

                return { x: finalX, y: finalY };
              });
              
              resultsRef.current = { multiHandLandmarks: [mappedLandmarks] };
              return;
            }
          }
          // No hand found in this frame
          resultsRef.current = { multiHandLandmarks: [] };
        });

        rafId = requestAnimationFrame(updateLoop);

      } catch (err) {
        console.error("Camera or ml5 init failed:", err);
      }
    };

    const handleMouseMove = () => document.body.classList.remove('hide-cursor');
    window.addEventListener('mousemove', handleMouseMove);

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
        
        // Flipped mapping ensures moving hand left moves cursor left
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
          if (gesture !== "fist") { setGesture("fist"); document.body.classList.add("is-fist-scrolling"); }
          if (circleRef.current) circleRef.current.style.strokeDashoffset = String(circumference);
          pinchStartTime.current = null;
          
          if (lastHandPos.current) {
            const deltaY = (lastHandPos.current.y - smoothY) * SCROLL_VELOCITY_MULTIPLIER;
            const elementUnderCursor = document.elementFromPoint(smoothX, smoothY);
            const scrollContainer = elementUnderCursor?.closest('.overflow-y-scroll, .overflow-auto, .overflow-y-auto, [data-scrollable="true"]');
            
            if (scrollContainer) scrollContainer.scrollBy(0, deltaY); 
            else window.scrollBy(0, deltaY);
          }
          lastHandPos.current = { x: smoothX, y: smoothY };
        } 
        else if (isPinching) {
          if (gesture !== "pinch") { setGesture("pinch"); document.body.classList.remove("is-fist-scrolling"); }
          lastHandPos.current = null;
          
          if (pinchStartTime.current === null) {
            pinchStartTime.current = Date.now();
          } else {
            const elapsed = Date.now() - pinchStartTime.current;
            const progress = Math.min(elapsed / DWELL_DURATION, 1);
            if (circleRef.current) circleRef.current.style.strokeDashoffset = String(circumference - progress * circumference);
            if (progress >= 1) {
              triggerClick(smoothX, smoothY);
              pinchStartTime.current = null;
              if (circleRef.current) circleRef.current.style.strokeDashoffset = String(circumference);
            }
          }
        } 
        else {
          if (gesture !== "none") { setGesture("none"); document.body.classList.remove("is-fist-scrolling"); }
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

    initSystem();

    return () => {
      isComponentActive = false;
      cancelAnimationFrame(rafId);
      
      if (handPoseModel && typeof handPoseModel.detectStop === 'function') {
        try { handPoseModel.detectStop(); } catch (e) {}
      }

      if (stream) stream.getTracks().forEach(track => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      
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

      if (d < STICKY_THRESHOLD && d < minD) { minD = d; closest = el as HTMLElement; }
    });

    if (stickyTargetRef.current && stickyTargetRef.current !== closest) stickyTargetRef.current.removeAttribute("data-hand-hover");
    if (closest) (closest as HTMLElement).setAttribute("data-hand-hover", "true");
    
    stickyTargetRef.current = closest;
    setStickyTarget(closest);
  };

  const triggerClick = (x: number, y: number) => {
    const el = stickyTargetRef.current || document.elementFromPoint(x, y);
    if (el) {
      playClickSound();
      if (el instanceof HTMLElement) el.click(); 
      else {
        const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true, view: window });
        el.dispatchEvent(clickEvent);
      }
    }
  };

  if (!isHandModeEnabled) return null;

  let visualX = position.x;
  let visualY = position.y;

  if (stickyTarget && gesture !== "fist") {
    const rect = stickyTarget.getBoundingClientRect();
    visualX = rect.left + rect.width / 2;
    visualY = rect.top + rect.height / 2;
  }

  return (
    <>
      {/* Video Preview inside app UI */}
      <div className="fixed bottom-6 left-6 z-[9999] w-40 h-32 border border-black/10 shadow-lg bg-black/5 overflow-hidden pointer-events-none rounded-none">
        <video 
          ref={videoRef} 
          width="640" 
          height="480" 
          className="w-full h-full object-cover grayscale scale-x-[-1]" 
          playsInline 
          autoPlay 
          muted 
        />
        <div className="absolute top-0 left-0 bg-white/90 backdrop-blur-sm px-2 py-1 text-[8px] font-mono uppercase tracking-widest text-black border-b border-r border-black/10">
          Camera Input
        </div>
      </div>
      
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
          <div className={`w-2 h-2 rounded-full ${
            isActive ? "bg-blue-500" : isModelReady ? "bg-yellow-500 animate-pulse" : "bg-red-500"
          }`} />
          {isActive 
            ? "System Ready" 
            : isModelReady 
              ? "Waiting for Hand..." 
              : "Downloading Model..."}
        </div>
        {(isActive || isModelReady) && (
          <div className="text-[8px] opacity-60">
            {!isActive ? "Action: Hold hand up" : gesture === "fist" ? "Action: Scrolling" : gesture === "pinch" ? "Action: Selecting" : "Status: Tracking"}
          </div>
        )}
      </div>
    </>
  );
}