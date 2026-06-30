import { useCallback, useEffect, useRef } from "react";
import { useHandMode } from "../../../context/HandModeContext";
import {
  ONBOARDING_ROOT_SELECTOR,
  INTERACTIVE_TARGET_SELECTOR,
  STICKY_ACQUIRE_THRESHOLD,
  STICKY_RELEASE_THRESHOLD,
} from "../constants";
import { getInteractiveTargetSelector, hitTestAtPoint, isElementCenterVisible } from "../utils";

export function useStickyTargeting(
  gestureRef: React.MutableRefObject<string>,
  playSuccessSound: () => void,
  playErrorSound: () => void
) {
  const { isHandOnboardingActive, setHandTracking } = useHandMode();
  
  const stickyTargetRef = useRef<HTMLElement | null>(null);
  const cachedElementsRef = useRef<HTMLElement[]>([]);
  const onboardingActiveRef = useRef(isHandOnboardingActive);

  useEffect(() => {
    onboardingActiveRef.current = isHandOnboardingActive;
  }, [isHandOnboardingActive]);

  const clearStickyTarget = useCallback(() => {
    if (stickyTargetRef.current) {
      stickyTargetRef.current.removeAttribute("data-hand-hover");
      stickyTargetRef.current = null;
    }
  }, []);

  const rebuildElementCache = useCallback(() => {
    const selector = getInteractiveTargetSelector(onboardingActiveRef.current);
    cachedElementsRef.current = Array.from(
      document.querySelectorAll<HTMLElement>(selector),
    );
  }, []);

  useEffect(() => {
    rebuildElementCache();

    const observer = new MutationObserver(rebuildElementCache);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled", "aria-disabled", "class"],
    });

    return () => observer.disconnect();
  }, [rebuildElementCache]);

  useEffect(() => {
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
  }, [clearStickyTarget, gestureRef]);

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

  return { stickyTargetRef, clearStickyTarget, findStickyTarget, triggerClick };
}
