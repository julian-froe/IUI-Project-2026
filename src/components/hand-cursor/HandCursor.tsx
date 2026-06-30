import { useEffect, useRef, useState, useCallback } from "react";
import { useHandMode } from "../../context/HandModeContext";
import type { HandCameraStatus, HandGesture } from "../../context/HandModeContext";

import { CURSOR_OFFSET, SNAP_LERP } from "./constants";

import { useAudioFeedback } from "./hooks/useAudioFeedback";
import { useMouseIdle } from "./hooks/useMouseIdle";
import { useStickyTargeting } from "./hooks/useStickyTargeting";
import { useMediaPipeTracking } from "./hooks/useMediaPipeTracking";

import { CameraAccessOverlay } from "./components/CameraAccessOverlay";
import { CursorVisual } from "./components/CursorVisual";
import { StatusBar } from "./components/StatusBar";

export default function HandCursor() {
  const {
    isHandModeEnabled,
    setIsHandModeEnabled,
    isTrackingPaused,
    setTrackingPaused,
    setHandTracking,
    tracking,
    trackingRef,
    isHandOnboardingActive,
  } = useHandMode();

  const [gesture, setGesture] = useState<HandGesture>("none");
  const [isActive, setIsActive] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<HandCameraStatus>("idle");

  const videoRef = useRef<HTMLVideoElement>(null);
  
  const gestureRef = useRef<HandGesture>("none");
  const onboardingActiveRef = useRef(isHandOnboardingActive);
  const isActiveRef = useRef(false);
  const isShakaRef = useRef(false);
  const isTrackingPausedRef = useRef(false);
  const shakaHoldProgressRef = useRef(0);
  
  const cursorPositionRef = useRef<HTMLDivElement>(null);
  const visualPositionRef = useRef({ x: -100, y: -100 });
  const circleRef = useRef<SVGCircleElement>(null);

  const { playSuccessSound, playErrorSound } = useAudioFeedback();
  const isMouseInputActive = useMouseIdle(isHandModeEnabled && !isTrackingPaused);

  const { stickyTargetRef, clearStickyTarget, findStickyTarget, triggerClick } = useStickyTargeting(
    gestureRef,
    playSuccessSound,
    playErrorSound
  );

  useEffect(() => {
    onboardingActiveRef.current = isHandOnboardingActive;
  }, [isHandOnboardingActive]);

  useEffect(() => {
    isTrackingPausedRef.current = isTrackingPaused;
  }, [isTrackingPaused]);

  useEffect(() => {
    setHandTracking({ cameraStatus });
  }, [cameraStatus, setHandTracking]);

  const setActiveIfChanged = useCallback((active: boolean) => {
    if (isActiveRef.current === active) return;
    isActiveRef.current = active;
    setIsActive(active);
    setHandTracking({ isActive: active });
  }, [setHandTracking]);

  const setShakaIfChanged = useCallback((shaka: boolean) => {
    if (isShakaRef.current === shaka) return;
    isShakaRef.current = shaka;
    setHandTracking({ isShaka: shaka });
  }, [setHandTracking]);

  const setShakaHoldProgressIfChanged = useCallback((progress: number) => {
    if (shakaHoldProgressRef.current === progress) return;
    shakaHoldProgressRef.current = progress;
    setHandTracking({ shakaHoldProgress: progress });
  }, [setHandTracking]);

  const updateGesture = useCallback((nextGesture: HandGesture) => {
    if (gestureRef.current !== nextGesture) {
      gestureRef.current = nextGesture;
      setGesture(nextGesture);
      setHandTracking({ gesture: nextGesture });
    }
  }, [setHandTracking]);

  const applyCursorTransform = useCallback((visualX: number, visualY: number) => {
    visualPositionRef.current = { x: visualX, y: visualY };
    if (cursorPositionRef.current) {
      cursorPositionRef.current.style.transform =
        `translate(${visualX - CURSOR_OFFSET}px, ${visualY - CURSOR_OFFSET}px)`;
    }
  }, []);

  const updateCursorVisual = useCallback((smoothX: number, smoothY: number) => {
    const sticky = stickyTargetRef.current;
    let visualX = smoothX;
    let visualY = smoothY;

    if (sticky && gestureRef.current !== "fist") {
      const rect = sticky.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;
      const { x: currentX, y: currentY } = visualPositionRef.current;
      visualX = currentX + (targetX - currentX) * SNAP_LERP;
      visualY = currentY + (targetY - currentY) * SNAP_LERP;
    }

    applyCursorTransform(visualX, visualY);
    trackingRef.current = {
      ...trackingRef.current,
      position: { x: smoothX, y: smoothY },
      gesture: gestureRef.current,
      isActive: true,
      cameraStatus,
    };
  }, [applyCursorTransform, cameraStatus, trackingRef, stickyTargetRef]);

  const enterPausedState = useCallback(() => {
    setTrackingPaused(true);
    isTrackingPausedRef.current = true;
    document.body.classList.remove("is-fist-scrolling");
    updateGesture("none");
    clearStickyTarget();
    isActiveRef.current = false;
    setIsActive(false);
    setHandTracking({ isActive: false, gesture: "none", dwellProgress: 0, shakaHoldProgress: 0 });
    shakaHoldProgressRef.current = 0;
    document.body.classList.remove("hide-cursor");
  }, [clearStickyTarget, setHandTracking, setTrackingPaused, updateGesture]);

  const resumeTracking = useCallback(() => {
    setTrackingPaused(false);
    isTrackingPausedRef.current = false;
    setShakaHoldProgressIfChanged(0);
  }, [setShakaHoldProgressIfChanged, setTrackingPaused]);

  useEffect(() => {
    if (isHandModeEnabled && cameraStatus === "idle") {
      setCameraStatus("requesting");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Camera API not available (requires HTTPS or localhost).");
        setCameraStatus("denied");
        setTimeout(() => {
          setIsHandModeEnabled(false);
          setCameraStatus("idle");
        }, 4000);
        return;
      }

      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
          setCameraStatus("granted");
        })
        .catch((err) => {
          console.error("Camera access denied:", err);
          setCameraStatus("denied");
          setTimeout(() => {
            setIsHandModeEnabled(false);
            setCameraStatus("idle");
          }, 4000);
        });
    } else if (!isHandModeEnabled) {
      setCameraStatus("idle");
      document.body.classList.remove("hide-cursor");
      document.body.classList.remove("is-fist-scrolling");
      updateGesture("none");
      clearStickyTarget();
      isActiveRef.current = false;
      isShakaRef.current = false;
      isTrackingPausedRef.current = false;
      shakaHoldProgressRef.current = 0;
      setTrackingPaused(false);
      setIsActive(false);
      applyCursorTransform(-100, -100);
      setHandTracking({
        position: { x: -100, y: -100 },
        gesture: "none",
        isActive: false,
        isShaka: false,
        shakaHoldProgress: 0,
        cameraStatus: "idle",
        dwellProgress: 0,
        lastClickAt: 0,
        lastClickTarget: null,
      });
    }
  }, [
    isHandModeEnabled,
    cameraStatus,
    setIsHandModeEnabled,
    setTrackingPaused,
    setHandTracking,
    updateGesture,
    clearStickyTarget,
    applyCursorTransform,
  ]);

  useMediaPipeTracking(
    cameraStatus,
    videoRef,
    circleRef,
    onboardingActiveRef,
    isTrackingPausedRef,
    gestureRef,
    setActiveIfChanged,
    setShakaIfChanged,
    setShakaHoldProgressIfChanged,
    resumeTracking,
    enterPausedState,
    updateGesture,
    clearStickyTarget,
    findStickyTarget,
    triggerClick,
    updateCursorVisual,
    trackingRef
  );

  if (!isHandModeEnabled) return null;

  if (cameraStatus === "requesting" || cameraStatus === "denied") {
    return <CameraAccessOverlay cameraStatus={cameraStatus} />;
  }

  return (
    <>
      <video ref={videoRef} className="hidden" playsInline muted />
      {!isMouseInputActive && !isTrackingPaused && (
        <div
          data-hand-mouse-blocker
          className="fixed inset-0 z-[10000] cursor-none"
          aria-hidden="true"
        />
      )}
      
      <CursorVisual
        isActive={isActive}
        isTrackingPaused={isTrackingPaused}
        gesture={gesture}
        cursorPositionRef={cursorPositionRef}
        circleRef={circleRef}
      />

      <StatusBar
        isTrackingPaused={isTrackingPaused}
        isActive={isActive}
        gesture={gesture}
        shakaHoldProgress={tracking.shakaHoldProgress}
        isHandOnboardingActive={isHandOnboardingActive}
      />
    </>
  );
}
