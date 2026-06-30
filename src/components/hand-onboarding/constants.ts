import type { HandOnboardingStep } from "../../context/HandModeContext";

export const PRESENT_HAND_DELAY = 2000;
export const AUTO_ADVANCE_DELAY = 1200;
export const POINT_TARGETS_REQUIRED = 5;
export const CLICK_TARGETS_REQUIRED = 3;
export const SCROLL_PANELS_REQUIRED = 4;
export const completionPulseFrame = "border-green-500 animate-[exercise-complete-pulse_1000ms_ease-out_1]";

export const stepOrder: HandOnboardingStep[] = ["point", "click", "scroll"];

export const stepContent: Record<HandOnboardingStep, {
  label: string;
  title: string;
  description: string;
  helper: string;
}> = {
  point: {
    label: "Point",
    title: "Guide the pointer",
    description: "Move your hand to steer the blue dot.",
    helper: "Move the center of your palm to steer the dot.",
  },
  click: {
    label: "Click",
    title: "Pinch to select",
    description: "Touch thumb and finger together, then hold.",
    helper: "Buttons gently pull the pointer in.",
  },
  scroll: {
    label: "Scroll",
    title: "Make a fist to scroll",
    description: "Close your hand and move up or down.",
    helper: "The practice cards snap into place.",
  },
};

export const emptyCompletion: Record<HandOnboardingStep, boolean> = {
  point: false,
  click: false,
  scroll: false,
};

export const stepCompletionContent: Record<HandOnboardingStep, {
  title: string;
  description: string;
}> = {
  point: {
    title: "Pointer locked in",
    description: "Nice aim. Moving on to pinch selection.",
  },
  click: {
    title: "Click learned",
    description: "Great. Next, close your hand to scroll.",
  },
  scroll: {
    title: "Practice complete",
    description: "You are ready. Press Finish to enter the site.",
  },
};
