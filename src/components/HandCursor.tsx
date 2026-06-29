import { useEffect, useRef, useState, useCallback } from "react";
import * as mpHands from "@mediapipe/hands";
import type { Results } from "@mediapipe/hands";
import * as mpCamera from "@mediapipe/camera_utils";
import { motion, AnimatePresence } from "motion/react";
import { useHandMode } from "../context/HandModeContext";
import type { HandCameraStatus, HandGesture } from "../context/HandModeContext";

// --- Configuration Constants ---
const STICKY_ACQUIRE_THRESHOLD = 170;
const STICKY_RELEASE_THRESHOLD = 230;
const PINCH_THRESHOLD = 0.04;
const FIST_THRESHOLD = 0.12;
const DWELL_DURATION = 1500;
const MOUSE_IDLE_HIDE_DELAY = 900;
const POINTER_GAIN_X = 1.65;
const POINTER_GAIN_Y = 1.75;
const SCROLL_VELOCITY_MULTIPLIER = 2.35;
const SCROLL_DEADZONE = 1.5;
const SCROLL_MAX_DELTA = 64;
const SCROLL_SMOOTHING = 0.24;
const ONBOARDING_ROOT_SELECTOR = "[data-hand-onboarding]";
const INTERACTIVE_TARGET_SELECTOR = 'button, a, [role="button"], .group';
const HAND_MOUSE_BLOCKER_SELECTOR = "[data-hand-mouse-blocker]";
const SNAP_LERP = 0.35;
// Shaka sign ("hang loose"): thumb + pinky extended, three middle fingers curled.
const SHAKA_PINKY_EXTEND_RATIO = 0.98;
const SHAKA_THUMB_EXTEND_RATIO = 0.92;
const SHAKA_THUMB_PINKY_SPREAD_RATIO = 0.45;
const SHAKA_TOGGLE_DURATION = 2000;
const CURSOR_RADIUS = 24;
const CURSOR_CIRCUMFERENCE = 2 * Math.PI * CURSOR_RADIUS;
const CIRCUMFERENCE_STR = String(CURSOR_CIRCUMFERENCE);
const CURSOR_OFFSET = 40;

// --- 1-Euro Filter Implementation (Jitter Smoothing + Speed) ---
class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xPrev: number | null = null;
  private dxPrev: number = 0;
  private tPrev: number | null = null;

  constructor(minCutoff: number = 1.0, beta: number = 0.0, dCutoff: number = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  reset() {
    this.xPrev = null;
    this.dxPrev = 0;
    this.tPrev = null;
  }

  private alpha(tE: number, cutoff: number) {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / tE);
  }

  filter(x: number, t: number): number {
    if (this.xPrev === null || this.tPrev === null) {
      this.xPrev = x;
      this.tPrev = t;
      return x;
    }

    const tE = (t - this.tPrev) / 1000.0;
    if (tE <= 0) return x;

    const dx = (x - this.xPrev) / tE;
    const alphaD = this.alpha(tE, this.dCutoff);
    const edx = dx * alphaD + this.dxPrev * (1.0 - alphaD);

    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    const alphaP = this.alpha(tE, cutoff);
    const filteredX = x * alphaP + this.xPrev * (1.0 - alphaP);

    this.xPrev = filteredX;
    this.dxPrev = edx;
    this.tPrev = t;

    return filteredX;
  }
}

// --- Utility Functions ---
function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function expandNormalizedPosition(value: number, gain: number) {
  return clamp((value - 0.5) * gain + 0.5, 0, 1);
}

function mapHandPointToViewport(x: number, y: number) {
  return {
    x: expandNormalizedPosition(1 - x, POINTER_GAIN_X) * window.innerWidth,
    y: expandNormalizedPosition(y, POINTER_GAIN_Y) * window.innerHeight,
  };
}

const PALM_LANDMARK_INDICES = [0, 5, 9, 13, 17] as const;

function getPalmCenter(landmarks: Array<{ x: number; y: number }>) {
  let x = 0;
  let y = 0;
  for (const index of PALM_LANDMARK_INDICES) {
    x += landmarks[index].x;
    y += landmarks[index].y;
  }
  const count = PALM_LANDMARK_INDICES.length;
  return { x: x / count, y: y / count };
}

function landmarkDistance(
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Detects the shaka / "hang loose" sign: thumb and pinky extended outward while
 * the index, middle, and ring fingers are curled toward the palm.
 */
function isShakaSign(landmarks: Array<{ x: number; y: number }>) {
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  const palmSize = landmarkDistance(wrist, middleMcp) || 1e-6;

  const distFromWrist = (index: number) => landmarkDistance(landmarks[index], wrist);

  // A non-thumb finger is curled when its tip folds closer to the wrist than its PIP joint.
  const indexCurled = distFromWrist(8) < distFromWrist(6);
  const middleCurled = distFromWrist(12) < distFromWrist(10);
  const ringCurled = distFromWrist(16) < distFromWrist(14);

  // Pinky and thumb are extended when their tips reach at least as far from the wrist as their PIP joints.
  const pinkyExtended = distFromWrist(20) >= distFromWrist(18) * SHAKA_PINKY_EXTEND_RATIO;
  const thumbExtended = distFromWrist(4) >= distFromWrist(3) * SHAKA_THUMB_EXTEND_RATIO;

  // Thumb and pinky spread apart, but not as wide as a full hang-loose stretch.
  const thumbPinkySpread =
    landmarkDistance(landmarks[4], landmarks[20]) > palmSize * SHAKA_THUMB_PINKY_SPREAD_RATIO;

  return indexCurled && middleCurled && ringCurled && pinkyExtended && thumbExtended && thumbPinkySpread;
}

function getInteractiveTargetSelector(onboardingActive: boolean) {
  if (onboardingActive) {
    return `${ONBOARDING_ROOT_SELECTOR} button:not(:disabled), ${ONBOARDING_ROOT_SELECTOR} a, ${ONBOARDING_ROOT_SELECTOR} [role="button"]:not([aria-disabled="true"]), ${ONBOARDING_ROOT_SELECTOR} .group`;
  }
  return 'button:not(:disabled), a, [role="button"]:not([aria-disabled="true"]), .group';
}

function isHandMouseBlocker(el: Element) {
  return el instanceof HTMLElement && el.matches(HAND_MOUSE_BLOCKER_SELECTOR);
}

/** Hit-test that ignores the mouse-blocking overlay so hand targeting keeps working. */
function hitTestAtPoint(x: number, y: number) {
  for (const el of document.elementsFromPoint(x, y)) {
    if (isHandMouseBlocker(el)) continue;
    return el;
  }
  return null;
}

function isElementCenterVisible(el: HTMLElement, centerX: number, centerY: number) {
  const elementAtCenter = hitTestAtPoint(centerX, centerY);
  return !elementAtCenter || elementAtCenter === el || el.contains(elementAtCenter);
}

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
  const [isMouseInputActive, setIsMouseInputActive] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const pinchStartTime = useRef<number | null>(null);
  const lastHandPos = useRef<{ x: number; y: number } | null>(null);
  const scrollVelocity = useRef(0);
  const audioContextIdx = useRef<AudioContext | null>(null);

  const filterX = useRef(new OneEuroFilter(0.4, 0.02));
  const filterY = useRef(new OneEuroFilter(0.4, 0.02));

  const stickyTargetRef = useRef<HTMLElement | null>(null);
  const resultsRef = useRef<Results | null>(null);
  const gestureRef = useRef<HandGesture>("none");
  const onboardingActiveRef = useRef(isHandOnboardingActive);
  const isActiveRef = useRef(false);
  const isShakaRef = useRef(false);
  const isTrackingPausedRef = useRef(false);
  const shakaHoldStartRef = useRef<number | null>(null);
  const shakaHoldProgressRef = useRef(0);
  const cursorPositionRef = useRef<HTMLDivElement>(null);
  const visualPositionRef = useRef({ x: -100, y: -100 });
  const cachedElementsRef = useRef<HTMLElement[]>([]);

  const circleRef = useRef<SVGCircleElement>(null);

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
  }, [applyCursorTransform, cameraStatus, trackingRef]);

  const rebuildElementCache = useCallback(() => {
    const selector = getInteractiveTargetSelector(onboardingActiveRef.current);
    cachedElementsRef.current = Array.from(
      document.querySelectorAll<HTMLElement>(selector),
    );
  }, []);

  useEffect(() => {
    if (!isHandModeEnabled) return;

    rebuildElementCache();

    const observer = new MutationObserver(rebuildElementCache);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled", "aria-disabled", "class"],
    });

    return () => observer.disconnect();
  }, [isHandModeEnabled, rebuildElementCache]);

  const getAudioContext = useCallback(() => {
    if (!audioContextIdx.current) {
      audioContextIdx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextIdx.current;
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }, []);

  const playSuccessSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const startTime = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, startTime);
      osc.frequency.exponentialRampToValueAtTime(240, startTime + 0.045);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(850, startTime);
      filter.Q.setValueAtTime(0.45, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.090, startTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.055);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.07);
    } catch (e) {
      console.warn("Audio context failed", e);
    }
  }, [getAudioContext]);

  const playErrorSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.16);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(0.5, ctx.currentTime);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.090, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn("Audio context failed", e);
    }
  }, [getAudioContext]);

  const clearStickyTarget = useCallback(() => {
    if (stickyTargetRef.current) {
      stickyTargetRef.current.removeAttribute("data-hand-hover");
      stickyTargetRef.current = null;
    }
  }, []);

  const enterPausedState = useCallback(() => {
    setTrackingPaused(true);
    isTrackingPausedRef.current = true;
    document.body.classList.remove("is-fist-scrolling");
    updateGesture("none");
    clearStickyTarget();
    filterX.current.reset();
    filterY.current.reset();
    lastHandPos.current = null;
    scrollVelocity.current = 0;
    pinchStartTime.current = null;
    isActiveRef.current = false;
    setIsActive(false);
    setHandTracking({ isActive: false, gesture: "none", dwellProgress: 0, shakaHoldProgress: 0 });
    shakaHoldProgressRef.current = 0;
    shakaHoldStartRef.current = null;
    document.body.classList.remove("hide-cursor");
    setIsMouseInputActive(true);
  }, [clearStickyTarget, setHandTracking, setTrackingPaused, updateGesture]);

  const resumeTracking = useCallback(() => {
    setTrackingPaused(false);
    isTrackingPausedRef.current = false;
    shakaHoldStartRef.current = null;
    setShakaHoldProgressIfChanged(0);
    filterX.current.reset();
    filterY.current.reset();
  }, [setShakaHoldProgressIfChanged, setTrackingPaused]);

  useEffect(() => {
    onboardingActiveRef.current = isHandOnboardingActive;
    pinchStartTime.current = null;
    clearStickyTarget();
    rebuildElementCache();
  }, [clearStickyTarget, isHandOnboardingActive, rebuildElementCache]);

  const findStickyTarget = useCallback((x: number, y: number) => {
    if (gestureRef.current === "fist") {
      clearStickyTarget();
      return;
    }

    const elements = cachedElementsRef.current;
    type Candidate = { el: HTMLElement; d: number; centerX: number; centerY: number };
    const candidates: Candidate[] = [];

    if (
      stickyTargetRef.current &&
      (!stickyTargetRef.current.isConnected ||
        (onboardingActiveRef.current && !stickyTargetRef.current.closest(ONBOARDING_ROOT_SELECTOR)))
    ) {
      clearStickyTarget();
    }

    const rects = elements.map((el) => el.getBoundingClientRect());

    elements.forEach((el, i) => {
      const rect = rects[i];
      if (rect.width === 0 || rect.height === 0) return;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      if (centerX < 0 || centerX > window.innerWidth || centerY < 0 || centerY > window.innerHeight) return;

      const d = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      const threshold = el === stickyTargetRef.current ? STICKY_RELEASE_THRESHOLD : STICKY_ACQUIRE_THRESHOLD;

      if (d < threshold) {
        candidates.push({ el, d, centerX, centerY });
      }
    });

    candidates.sort((a, b) => a.d - b.d);

    let closest: HTMLElement | null = null;
    for (const candidate of candidates) {
      if (isElementCenterVisible(candidate.el, candidate.centerX, candidate.centerY)) {
        closest = candidate.el;
        break;
      }
    }

    if (stickyTargetRef.current && stickyTargetRef.current !== closest) {
      stickyTargetRef.current.removeAttribute("data-hand-hover");
    }
    if (closest) closest.setAttribute("data-hand-hover", "true");

    stickyTargetRef.current = closest;
  }, [clearStickyTarget]);

  const getActionableClickTarget = useCallback((el: Element | null) => {
    const target = el?.closest(INTERACTIVE_TARGET_SELECTOR);
    if (!(target instanceof HTMLElement)) return null;

    if (target instanceof HTMLButtonElement && target.disabled) return null;
    if (target.getAttribute("aria-disabled") === "true") return null;

    return target;
  }, []);

  const triggerClick = useCallback((x: number, y: number) => {
    const rawTarget = stickyTargetRef.current || hitTestAtPoint(x, y);
    const el = getActionableClickTarget(rawTarget);

    if (!el) {
      playErrorSound();
      return;
    }

    if (onboardingActiveRef.current && !el.closest(ONBOARDING_ROOT_SELECTOR)) {
      playErrorSound();
      return;
    }

    setHandTracking({
      lastClickAt: Date.now(),
      lastClickTarget: el,
    });
    window.dispatchEvent(new CustomEvent("handmode:click", { detail: { target: el } }));
    playSuccessSound();

    el.click();
  }, [getActionableClickTarget, playErrorSound, playSuccessSound, setHandTracking]);

  useEffect(() => {
    if (!isHandModeEnabled || isTrackingPaused) {
      document.body.classList.remove("hide-cursor");
      setIsMouseInputActive(true);
      return;
    }

    setIsMouseInputActive(true);

    let idleTimer = window.setTimeout(() => {
      setIsMouseInputActive(false);
      document.body.classList.add("hide-cursor");
    }, MOUSE_IDLE_HIDE_DELAY);

    const activateMouseUntilIdle = () => {
      setIsMouseInputActive(true);
      document.body.classList.remove("hide-cursor");
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        setIsMouseInputActive(false);
        document.body.classList.add("hide-cursor");
      }, MOUSE_IDLE_HIDE_DELAY);
    };

    // Capture phase so movement is detected even while the blocker overlay is on top.
    window.addEventListener("mousemove", activateMouseUntilIdle, true);
    window.addEventListener("mousedown", activateMouseUntilIdle, true);

    return () => {
      window.clearTimeout(idleTimer);
      window.removeEventListener("mousemove", activateMouseUntilIdle, true);
      window.removeEventListener("mousedown", activateMouseUntilIdle, true);
      document.body.classList.remove("hide-cursor");
      setIsMouseInputActive(true);
    };
  }, [isHandModeEnabled, isTrackingPaused]);

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
      filterX.current.reset();
      filterY.current.reset();
      lastHandPos.current = null;
      scrollVelocity.current = 0;
      pinchStartTime.current = null;
      isActiveRef.current = false;
      isShakaRef.current = false;
      isTrackingPausedRef.current = false;
      shakaHoldStartRef.current = null;
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

  useEffect(() => {
    if (cameraStatus !== "granted" || !videoRef.current) {
      setActiveIfChanged(false);
      filterX.current.reset();
      filterY.current.reset();
      lastHandPos.current = null;
      scrollVelocity.current = 0;
      pinchStartTime.current = null;
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
      width: 480,
      height: 360,
    });

    camera.start();

    let rafId: number;
    const updateLoop = () => {
      const results = resultsRef.current;
      if (results && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const timestamp = Date.now();

        const landmarks = results.multiHandLandmarks[0];
        const wrist = landmarks[0];
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];

        const palm = getPalmCenter(landmarks);
        const target = mapHandPointToViewport(palm.x, palm.y);

        const smoothX = filterX.current.filter(target.x, timestamp);
        const smoothY = filterY.current.filter(target.y, timestamp);

        const isShaka = isShakaSign(landmarks);
        setShakaIfChanged(isShaka);

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

          const pinchDist = Math.sqrt(Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2));
          const isPinching = pinchDist < PINCH_THRESHOLD;

          const fingerTips = [indexTip, landmarks[12], landmarks[16], landmarks[20]];
          const avgTipDist = fingerTips.reduce((acc, tip) => acc + Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2)), 0) / 4;
          const isFist = avgTipDist < FIST_THRESHOLD && !isPinching;

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

          updateCursorVisual(smoothX, smoothY);
        }
      } else {
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

  if (!isHandModeEnabled) return null;

  if (cameraStatus === "requesting" || cameraStatus === "denied") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-sm">
        <div className="bg-white border border-black p-8 max-w-md text-center shadow-2xl">
          <h2 className="font-sans font-black text-2xl uppercase tracking-tighter mb-4">Camera Access Required</h2>
          <p className="font-sans text-sm text-neutral-600 mb-8 leading-relaxed">
            {cameraStatus === "requesting"
              ? "We cannot bypass your browser's security. Please allow camera access in the native prompt to enable Hand Tracking Mode."
              : "Camera access was denied. Hand mode disabled. Please reset your browser permissions to try again."}
          </p>
          {cameraStatus === "requesting" && <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />}
        </div>
      </div>
    );
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
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        <AnimatePresence>
          {isActive && !isTrackingPaused && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: gesture === "fist" ? 0.8 : 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="fixed top-0 left-0 w-20 h-20"
            >
              <div
                ref={cursorPositionRef}
                className="w-20 h-20 flex items-center justify-center"
                style={{ willChange: "transform" }}
              >
                <div className={`absolute inset-0 rounded-full border-2 border-blue-500/30 backdrop-blur-[2px] transition-all duration-300 ${
                  gesture !== "none" ? "scale-110 bg-blue-500/10" : "scale-100 bg-white/5"
                }`} />

                <svg className="absolute inset-0 w-20 h-20 -rotate-90">
                  <circle
                    ref={circleRef}
                    cx="40"
                    cy="40"
                    r={CURSOR_RADIUS}
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    strokeDasharray={CURSOR_CIRCUMFERENCE}
                    style={{ strokeDashoffset: CURSOR_CIRCUMFERENCE, transition: "none" }}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none bg-white/90 backdrop-blur-md border border-blue-100 px-4 py-2 rounded-none font-mono text-[9px] tracking-widest uppercase flex flex-col items-start gap-1 shadow-lg min-w-[200px]">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${
            isTrackingPaused
              ? "bg-amber-500"
              : isActive
                ? "bg-blue-500"
                : "bg-red-500 animate-pulse"
          }`} />
          {isTrackingPaused
            ? "Hand Paused"
            : isActive
              ? "System Ready"
              : "Initializing..."}
        </div>
        {isTrackingPaused ? (
          <div className="text-[8px] opacity-60 normal-case tracking-normal">
            Use mouse or hold shaka 2s to resume
          </div>
        ) : isActive && (
          <div className="text-[8px] opacity-60">
            {gesture === "fist" ? "Action: Scrolling" : gesture === "pinch" ? "Action: Selecting" : "Status: Tracking"}
          </div>
        )}
        {tracking.shakaHoldProgress > 0 && !isHandOnboardingActive && (
          <>
            <div className="text-[8px] opacity-80 normal-case tracking-normal mt-1">
              {isTrackingPaused
                ? "Hold shaka — resuming in 2 seconds"
                : "Hold shaka — pausing in 2 seconds"}
            </div>
            <div className="w-full h-1 bg-blue-100 overflow-hidden mt-0.5">
              <div
                className="h-full bg-blue-500 transition-none"
                style={{ width: `${Math.round(tracking.shakaHoldProgress * 100)}%` }}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
