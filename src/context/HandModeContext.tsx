import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";

export type HandGesture = "none" | "pinch" | "fist";
export type HandCameraStatus = "idle" | "requesting" | "granted" | "denied";
export type HandOnboardingStatus = "idle" | "present-hand" | "tutorial";
export type HandOnboardingStep = "point" | "click" | "scroll";

export interface HandTrackingState {
  position: { x: number; y: number };
  gesture: HandGesture;
  isActive: boolean;
  cameraStatus: HandCameraStatus;
  dwellProgress: number;
  lastClickAt: number;
  lastClickTarget: HTMLElement | null;
}

interface HandModeContextType {
  isHandModeEnabled: boolean;
  setIsHandModeEnabled: (enabled: boolean) => void;
  tracking: HandTrackingState;
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
  const [tracking, setTracking] = useState<HandTrackingState>({
    position: { x: -100, y: -100 },
    gesture: "none",
    isActive: false,
    cameraStatus: "idle",
    dwellProgress: 0,
    lastClickAt: 0,
    lastClickTarget: null,
  });

  const setHandTracking = useCallback((nextTracking: Partial<HandTrackingState>) => {
    setTracking((current) => ({ ...current, ...nextTracking }));
  }, []);

  const setIsHandModeEnabled = useCallback((enabled: boolean) => {
    setIsHandModeEnabledState(enabled);

    if (!enabled) {
      setOnboardingStatus("idle");
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

  // Modified: Keep isHandModeEnabledState as true, but dismiss the onboarding screens
  const cancelOnboarding = useCallback(() => {
    setHasSeenOnboardingThisSession(true);
    setOnboardingStatus("idle");
  }, []);

  const value = useMemo(() => ({
    isHandModeEnabled: isHandModeEnabledState,
    setIsHandModeEnabled,
    tracking,
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