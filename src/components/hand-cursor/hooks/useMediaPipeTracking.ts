import { useEffect, useRef } from "react";
import * as mpHands from "@mediapipe/hands";
import type { Results } from "@mediapipe/hands";
import * as mpCamera from "@mediapipe/camera_utils";
import type { HandCameraStatus, HandGesture } from "../../../context/HandModeContext";

import { OneEuroFilter } from "../OneEuroFilter";
import {
  PINCH_THRESHOLD,
  FIST_THRESHOLD,
  DWELL_DURATION,
  SCROLL_VELOCITY_MULTIPLIER,
  SCROLL_DEADZONE,
  SCROLL_MAX_DELTA,
  SCROLL_SMOOTHING,
  ONBOARDING_ROOT_SELECTOR,
  SHAKA_TOGGLE_DURATION,
  CURSOR_CIRCUMFERENCE,
  CIRCUMFERENCE_STR,
} from "../constants";

import { mapHandPointToViewport, getPalmCenter, isShakaSign, hitTestAtPoint, clamp } from "../utils";

export function useMediaPipeTracking(
  cameraStatus: HandCameraStatus,
  videoRef: React.RefObject<HTMLVideoElement>,
  circleRef: React.RefObject<SVGCircleElement>,
  onboardingActiveRef: React.MutableRefObject<boolean>,
  isTrackingPausedRef: React.MutableRefObject<boolean>,
  gestureRef: React.MutableRefObject<HandGesture>,
  setActiveIfChanged: (active: boolean) => void,
  setShakaIfChanged: (shaka: boolean) => void,
  setShakaHoldProgressIfChanged: (progress: number) => void,
  resumeTracking: () => void,
  enterPausedState: () => void,
  updateGesture: (gesture: HandGesture) => void,
  clearStickyTarget: () => void,
  findStickyTarget: (x: number, y: number) => void,
  triggerClick: (x: number, y: number) => void,
  updateCursorVisual: (smoothX: number, smoothY: number) => void,
  trackingRef: any
) {
  const filterX = useRef(new OneEuroFilter(0.4, 0.02));
  const filterY = useRef(new OneEuroFilter(0.4, 0.02));
  const resultsRef = useRef<Results | null>(null);

  // New refs for decoupled 30fps AI vs 60fps Visual logic
  const lastProcessedResultsRef = useRef<Results | null>(null);
  const targetFilteredPos = useRef({ x: -100, y: -100 });
  const currentVisualPos = useRef({ x: -100, y: -100 });
  const gestureStateRef = useRef({ isShaka: false, isFist: false, isPinching: false });
  
  const lastHandPos = useRef<{ x: number; y: number } | null>(null);
  const scrollVelocity = useRef(0);
  const pinchStartTime = useRef<number | null>(null);
  const shakaHoldStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (cameraStatus !== "granted" || !videoRef.current) {
      document.body.classList.remove("hide-cursor");
      return;
    }

    document.body.classList.add("hide-cursor");

    const hands = new mpHands.Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
    hands.onResults((results: Results) => { resultsRef.current = results; });

    const camera = new mpCamera.Camera(videoRef.current, {
      onFrame: async () => { if (videoRef.current) await hands.send({ image: videoRef.current }); },
      width: 480,
      height: 360,
    });

    camera.start();

    let rafId: number;
    const updateLoop = () => {
      const results = resultsRef.current;
      if (results && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const timestamp = Date.now();

        // --- 1. Process New Frame (30fps AI rate) ---
        if (results !== lastProcessedResultsRef.current) {
          lastProcessedResultsRef.current = results;

          const landmarks = results.multiHandLandmarks[0];
          const wrist = landmarks[0];
          const thumbTip = landmarks[4];
          const indexTip = landmarks[8];

          const palm = getPalmCenter(landmarks);
          const target = mapHandPointToViewport(palm.x, palm.y);

          targetFilteredPos.current = {
            x: filterX.current.filter(target.x, timestamp),
            y: filterY.current.filter(target.y, timestamp)
          };

          const isShaka = isShakaSign(landmarks);
          const pinchDist = Math.sqrt(Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2));
          const isPinching = pinchDist < PINCH_THRESHOLD;

          const fingerTips = [indexTip, landmarks[12], landmarks[16], landmarks[20]];
          const avgTipDist = fingerTips.reduce((acc, tip) => acc + Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2)), 0) / 4;
          const isFist = avgTipDist < FIST_THRESHOLD && !isPinching;

          gestureStateRef.current = { isShaka, isFist, isPinching };
          setShakaIfChanged(isShaka);
        }

        // --- 2. Visual Rendering & Continuous Interaction (60fps/120fps display rate) ---
        
        // Initial snap to position if resetting
        if (currentVisualPos.current.x === -100 && currentVisualPos.current.y === -100) {
          currentVisualPos.current = { ...targetFilteredPos.current };
        } else {
          // Lerp for buttery smooth visual cursor (decouples from AI framerate)
          const LERP_FACTOR = 0.4;
          currentVisualPos.current.x += (targetFilteredPos.current.x - currentVisualPos.current.x) * LERP_FACTOR;
          currentVisualPos.current.y += (targetFilteredPos.current.y - currentVisualPos.current.y) * LERP_FACTOR;
        }

        const smoothX = currentVisualPos.current.x;
        const smoothY = currentVisualPos.current.y;
        
        const { isShaka, isFist, isPinching } = gestureStateRef.current;
        const canTogglePause = !onboardingActiveRef.current;

        if (canTogglePause) {
          if (isShaka) {
            if (shakaHoldStartRef.current === null) {
              shakaHoldStartRef.current = timestamp;
            }
            const elapsed = timestamp - shakaHoldStartRef.current;
            const holdProgress = Math.min(elapsed / SHAKA_TOGGLE_DURATION, 1);
            setShakaHoldProgressIfChanged(holdProgress);

            if (holdProgress >= 1) {
              shakaHoldStartRef.current = null;
              setShakaHoldProgressIfChanged(0);
              if (isTrackingPausedRef.current) {
                resumeTracking();
              } else {
                enterPausedState();
              }
            }
          } else {
            shakaHoldStartRef.current = null;
            setShakaHoldProgressIfChanged(0);
          }
        } else {
          shakaHoldStartRef.current = null;
          setShakaHoldProgressIfChanged(0);
        }

        if (isTrackingPausedRef.current) {
          setActiveIfChanged(false);
          if (circleRef.current) circleRef.current.style.strokeDashoffset = CIRCUMFERENCE_STR;
          trackingRef.current = {
            ...trackingRef.current,
            position: { x: smoothX, y: smoothY },
            isShaka,
            isActive: false,
            gesture: "none",
            cameraStatus,
          };
        } else {
          setActiveIfChanged(true);

          if (isShaka) {
            if (gestureRef.current !== "none") {
              updateGesture("none");
              document.body.classList.remove("is-fist-scrolling");
            }
            if (circleRef.current) circleRef.current.style.strokeDashoffset = CIRCUMFERENCE_STR;
            pinchStartTime.current = null;
            lastHandPos.current = null;
            scrollVelocity.current = 0;
            clearStickyTarget();
          } else {
            if (isFist) {
              if (gestureRef.current !== "fist") {
                updateGesture("fist");
                document.body.classList.add("is-fist-scrolling");
                clearStickyTarget();
              }
              if (circleRef.current) circleRef.current.style.strokeDashoffset = CIRCUMFERENCE_STR;
              pinchStartTime.current = null;

              if (lastHandPos.current) {
                const handDeltaY = lastHandPos.current.y - smoothY;
                const targetDeltaY = Math.abs(handDeltaY) < SCROLL_DEADZONE
                  ? 0
                  : clamp(handDeltaY * SCROLL_VELOCITY_MULTIPLIER, -SCROLL_MAX_DELTA, SCROLL_MAX_DELTA);

                const deltaY = scrollVelocity.current + (targetDeltaY - scrollVelocity.current) * SCROLL_SMOOTHING;
                scrollVelocity.current = Math.abs(deltaY) < 0.2 ? 0 : deltaY;

                const elementUnderCursor = hitTestAtPoint(smoothX, smoothY);
                const scrollContainer = elementUnderCursor?.closest('.overflow-y-scroll, .overflow-auto, .overflow-y-auto, [data-scrollable="true"]');

                if (scrollVelocity.current !== 0) {
                  if (scrollContainer && (!onboardingActiveRef.current || scrollContainer.closest(ONBOARDING_ROOT_SELECTOR))) {
                    scrollContainer.scrollBy(0, scrollVelocity.current);
                  } else if (!onboardingActiveRef.current) {
                    window.scrollBy(0, scrollVelocity.current);
                  }
                }
              }
              lastHandPos.current = { x: smoothX, y: smoothY };
            } else if (isPinching) {
              if (gestureRef.current !== "pinch") {
                updateGesture("pinch");
                document.body.classList.remove("is-fist-scrolling");
              }
              lastHandPos.current = null;
              scrollVelocity.current = 0;

              if (pinchStartTime.current === null) {
                pinchStartTime.current = Date.now();
              } else {
                const elapsed = Date.now() - pinchStartTime.current;
                const progress = Math.min(elapsed / DWELL_DURATION, 1);

                if (circleRef.current) {
                  circleRef.current.style.strokeDashoffset = String(CURSOR_CIRCUMFERENCE - progress * CURSOR_CIRCUMFERENCE);
                }

                if (progress >= 1) {
                  triggerClick(smoothX, smoothY);
                  pinchStartTime.current = null;
                  if (circleRef.current) circleRef.current.style.strokeDashoffset = CIRCUMFERENCE_STR;
                }
              }
            } else {
              if (gestureRef.current !== "none") {
                updateGesture("none");
                document.body.classList.remove("is-fist-scrolling");
              }
              if (circleRef.current) circleRef.current.style.strokeDashoffset = CIRCUMFERENCE_STR;
              pinchStartTime.current = null;
              lastHandPos.current = null;
              scrollVelocity.current = 0;
              findStickyTarget(smoothX, smoothY);
            }
          }

          updateCursorVisual(smoothX, smoothY);
        }
      } else {
        // No hands detected
        setActiveIfChanged(false);
        setShakaIfChanged(false);
        shakaHoldStartRef.current = null;
        setShakaHoldProgressIfChanged(0);
        document.body.classList.remove("is-fist-scrolling");
        filterX.current.reset();
        filterY.current.reset();
        lastHandPos.current = null;
        scrollVelocity.current = 0;
        pinchStartTime.current = null;
        
        lastProcessedResultsRef.current = null;
        currentVisualPos.current = { x: -100, y: -100 };
        targetFilteredPos.current = { x: -100, y: -100 };

        trackingRef.current = {
          ...trackingRef.current,
          isActive: false,
          isShaka: false,
          shakaHoldProgress: 0,
          dwellProgress: 0,
        };
        clearStickyTarget();
      }
      rafId = requestAnimationFrame(updateLoop);
    };

    rafId = requestAnimationFrame(updateLoop);

    return () => {
      camera.stop();
      hands.close();
      cancelAnimationFrame(rafId);
      document.body.classList.remove("hide-cursor");
      document.body.classList.remove("is-fist-scrolling");
      filterX.current.reset();
      filterY.current.reset();
      lastHandPos.current = null;
      scrollVelocity.current = 0;
      pinchStartTime.current = null;
      clearStickyTarget();
    };
  }, [
    cameraStatus,
    clearStickyTarget,
    enterPausedState,
    findStickyTarget,
    resumeTracking,
    setActiveIfChanged,
    setShakaHoldProgressIfChanged,
    setShakaIfChanged,
    trackingRef,
    triggerClick,
    updateCursorVisual,
    updateGesture,
  ]);

  return { filterX, filterY, lastHandPos, scrollVelocity, pinchStartTime, shakaHoldStartRef };
}
