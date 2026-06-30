import React, { createContext, useCallback, useContext, useMemo, useRef, useState, ReactNode } from "react";

export type HandGesture = "none" | "pinch" | "fist";
export type HandCameraStatus = "idle" | "requesting" | "granted" | "denied";
export type HandOnboardingStatus = "idle" | "present-hand" | "tutorial";
export type HandOnboardingStep = "point" | "click" | "scroll";

export interface HandTrackingState {
  position: { x: number; y: number };
  gesture: HandGesture;
  isActive: boolean;
  isShaka: boolean;
  shakaHoldProgress: number;
  cameraStatus: HandCameraStatus;
  dwellProgress: number;
  lastClickAt: number;
  lastClickTarget: HTMLElement | null;
}

const initialTrackingState: HandTrackingState = {
  position: { x: -100, y: -100 },
  gesture: "none",
  isActive: false,
  isShaka: false,
  shakaHoldProgress: 0,
  cameraStatus: "idle",
  dwellProgress: 0,
  lastClickAt: 0,
  lastClickTarget: null,
};

interface HandModeContextType {
  isHandModeEnabled: boolean;
  setIsHandModeEnabled: (enabled: boolean) => void;
  isTrackingPaused: boolean;
  setTrackingPaused: (paused: boolean) => void;
  tracking: HandTrackingState;
  trackingRef: React.MutableRefObject<HandTrackingState>;
  setHandTracking: (tracking: Partial<HandTrackingState>) => void;
  onboardingStatus: HandOnboardingStatus;
  onboardingStep: HandOnboardingStep;
  setOnboardingStep: (step: HandOnboardingStep) => void;
  startTutorial: () => void;
  completeOnboarding: () => void;
  cancelOnboarding: () => void;
  isHandOnboardingActive: boolean;
}

const HandModeContext = createContext<HandModeContextType | undefined>(undefined);

export function HandModeProvider({ children }: { children: ReactNode }) {
  const [isHandModeEnabledState, setIsHandModeEnabledState] = useState(false);
  const [hasSeenOnboardingThisSession, setHasSeenOnboardingThisSession] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<HandOnboardingStatus>("idle");
  const [onboardingStep, setOnboardingStep] = useState<HandOnboardingStep>("point");
  const [isTrackingPaused, setIsTrackingPausedState] = useState(false);
  const [tracking, setTracking] = useState<HandTrackingState>(initialTrackingState);
  const trackingRef = useRef<HandTrackingState>(initialTrackingState);

  const setTrackingPaused = useCallback((paused: boolean) => {
    setIsTrackingPausedState(paused);
  }, []);

  const setHandTracking = useCallback((nextTracking: Partial<HandTrackingState>) => {
    setTracking((current) => {
      const merged = { ...current, ...nextTracking };
      trackingRef.current = merged;
      return merged;
    });
  }, []);

  const setIsHandModeEnabled = useCallback((enabled: boolean) => {
    setIsHandModeEnabledState(enabled);

    if (!enabled) {
      setOnboardingStatus("idle");
      setIsTrackingPausedState(false);
      setTracking((current) => {
        const reset = { ...current, shakaHoldProgress: 0 };
        trackingRef.current = reset;
        return reset;
      });
      return;
    }

    if (!hasSeenOnboardingThisSession) {
      setOnboardingStep("point");
      setOnboardingStatus("present-hand");
    }
  }, [hasSeenOnboardingThisSession]);

  const startTutorial = useCallback(() => {
    setOnboardingStep("point");
    setOnboardingStatus("tutorial");
  }, []);

  const completeOnboarding = useCallback(() => {
    setHasSeenOnboardingThisSession(true);
    setOnboardingStatus("idle");
  }, []);
  const cancelOnboarding = useCallback(() => {
    setHasSeenOnboardingThisSession(true);
    setOnboardingStatus("idle");
  }, []);

  const value = useMemo(() => ({
    isHandModeEnabled: isHandModeEnabledState,
    setIsHandModeEnabled,
    isTrackingPaused,
    setTrackingPaused,
    tracking,
    trackingRef,
    setHandTracking,
    onboardingStatus,
    onboardingStep,
    setOnboardingStep,
    startTutorial,
    completeOnboarding,
    cancelOnboarding,
    isHandOnboardingActive: onboardingStatus !== "idle",
  }), [
    isHandModeEnabledState,
    setIsHandModeEnabled,
    isTrackingPaused,
    setTrackingPaused,
    tracking,
    setHandTracking,
    onboardingStatus,
    onboardingStep,
    startTutorial,
    completeOnboarding,
    cancelOnboarding,
  ]);

  return (
    <HandModeContext.Provider value={value}>
      {children}
    </HandModeContext.Provider>
  );
}

export function useHandMode() {
  const context = useContext(HandModeContext);
  if (context === undefined) {
    throw new Error("useHandMode must be used within a HandModeProvider");
  }
  return context;
}

export function useHandTrackingRef() {
  const { trackingRef } = useHandMode();
  return trackingRef;
}