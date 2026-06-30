import {
  POINTER_GAIN_X,
  POINTER_GAIN_Y,
  SHAKA_PINKY_EXTEND_RATIO,
  SHAKA_THUMB_EXTEND_RATIO,
  SHAKA_THUMB_PINKY_SPREAD_RATIO,
  ONBOARDING_ROOT_SELECTOR,
  HAND_MOUSE_BLOCKER_SELECTOR,
} from "./constants";

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function expandNormalizedPosition(value: number, gain: number) {
  return clamp((value - 0.5) * gain + 0.5, 0, 1);
}

export function mapHandPointToViewport(x: number, y: number) {
  return {
    x: expandNormalizedPosition(1 - x, POINTER_GAIN_X) * window.innerWidth,
    y: expandNormalizedPosition(y, POINTER_GAIN_Y) * window.innerHeight,
  };
}

const PALM_LANDMARK_INDICES = [0, 5, 9, 13, 17] as const;

export function getPalmCenter(landmarks: Array<{ x: number; y: number }>) {
  let x = 0;
  let y = 0;
  for (const index of PALM_LANDMARK_INDICES) {
    x += landmarks[index].x;
    y += landmarks[index].y;
  }
  const count = PALM_LANDMARK_INDICES.length;
  return { x: x / count, y: y / count };
}

export function landmarkDistance(
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function isShakaSign(landmarks: Array<{ x: number; y: number }>) {
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  const palmSize = landmarkDistance(wrist, middleMcp) || 1e-6;

  const distFromWrist = (index: number) => landmarkDistance(landmarks[index], wrist);
  const indexCurled = distFromWrist(8) < distFromWrist(6);
  const middleCurled = distFromWrist(12) < distFromWrist(10);
  const ringCurled = distFromWrist(16) < distFromWrist(14);
  const pinkyExtended = distFromWrist(20) >= distFromWrist(18) * SHAKA_PINKY_EXTEND_RATIO;
  const thumbExtended = distFromWrist(4) >= distFromWrist(3) * SHAKA_THUMB_EXTEND_RATIO;
  const thumbPinkySpread =
    landmarkDistance(landmarks[4], landmarks[20]) > palmSize * SHAKA_THUMB_PINKY_SPREAD_RATIO;

  return indexCurled && middleCurled && ringCurled && pinkyExtended && thumbExtended && thumbPinkySpread;
}

export function getInteractiveTargetSelector(onboardingActive: boolean) {
  if (onboardingActive) {
    return `${ONBOARDING_ROOT_SELECTOR} button:not(:disabled), ${ONBOARDING_ROOT_SELECTOR} a, ${ONBOARDING_ROOT_SELECTOR} [role="button"]:not([aria-disabled="true"]), ${ONBOARDING_ROOT_SELECTOR} .group`;
  }
  return 'button:not(:disabled), a, [role="button"]:not([aria-disabled="true"]), .group';
}

export function isHandMouseBlocker(el: Element) {
  return el instanceof HTMLElement && el.matches(HAND_MOUSE_BLOCKER_SELECTOR);
}

export function hitTestAtPoint(x: number, y: number) {
  for (const el of document.elementsFromPoint(x, y)) {
    if (isHandMouseBlocker(el)) continue;
    return el;
  }
  return null;
}

export function isElementCenterVisible(el: HTMLElement, centerX: number, centerY: number) {
  const elementAtCenter = hitTestAtPoint(centerX, centerY);
  return !elementAtCenter || elementAtCenter === el || el.contains(elementAtCenter);
}
