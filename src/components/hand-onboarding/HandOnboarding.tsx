import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useHandMode } from "../../context/HandModeContext";
import type { HandOnboardingStep } from "../../context/HandModeContext";

import {
  AUTO_ADVANCE_DELAY,
  stepOrder,
  stepContent,
  stepCompletionContent,
  emptyCompletion,
} from "./constants";

import { PresentHandOverlay } from "./PresentHandOverlay";
import { StepProgress } from "./components/StepProgress";
import { GestureIcon } from "./components/GestureIcons";
import { PointingExercise } from "./exercises/PointingExercise";
import { ClickingExercise } from "./exercises/ClickingExercise";
import { ScrollingExercise } from "./exercises/ScrollingExercise";

export default function HandOnboarding() {
  const {
    isHandModeEnabled,
    tracking,
    onboardingStatus,
    onboardingStep,
    setOnboardingStep,
    startTutorial,
    completeOnboarding,
    cancelOnboarding,
  } = useHandMode();
  const [completedSteps, setCompletedSteps] = useState(emptyCompletion);

  useEffect(() => {
    if (onboardingStatus === "present-hand") {
      setCompletedSteps(emptyCompletion);
    }
  }, [onboardingStatus]);

  const markStepComplete = useCallback((step: HandOnboardingStep) => {
    setCompletedSteps((current) => current[step] ? current : { ...current, [step]: true });
  }, []);

  const currentStepIndex = stepOrder.indexOf(onboardingStep);
  const currentContent = stepContent[onboardingStep];
  const currentCompletionContent = stepCompletionContent[onboardingStep];
  const isStepComplete = completedSteps[onboardingStep];
  const isFinalStep = onboardingStep === "scroll";
  const nextStep = stepOrder[currentStepIndex + 1];

  useEffect(() => {
    if (
      onboardingStatus !== "tutorial" ||
      !isStepComplete ||
      isFinalStep ||
      !nextStep
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setOnboardingStep(nextStep);
    }, AUTO_ADVANCE_DELAY);

    return () => window.clearTimeout(timer);
  }, [isFinalStep, isStepComplete, nextStep, onboardingStatus, setOnboardingStep]);

  if (!isHandModeEnabled || onboardingStatus === "idle") {
    return null;
  }

  if (onboardingStatus === "present-hand") {
    return (
      <PresentHandOverlay
        tracking={tracking}
        onReady={startTutorial}
        onCancel={cancelOnboarding}
      />
    );
  }

  return (
    <div
      data-hand-onboarding
      className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-md flex items-center justify-center px-6 py-8"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 24 }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="relative w-full max-w-7xl h-[82vh] min-h-[620px] bg-white text-black border border-black shadow-2xl flex overflow-hidden"
      >
        <button
          type="button"
          onClick={cancelOnboarding}
          className="absolute top-5 right-5 z-20 w-11 h-11 border border-black bg-white text-black font-black text-sm hover:bg-black hover:text-white transition-colors"
          aria-label="Close onboarding"
        >
          X
        </button>

        <aside className="w-[34%] min-w-[340px] bg-black text-white p-8 flex flex-col min-h-0 overflow-hidden">
          <div className="shrink-0">
            <StepProgress currentStep={onboardingStep} completedSteps={completedSteps} />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar mt-8">
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/50 mb-4">
              Step {currentStepIndex + 1} / {stepOrder.length}
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={onboardingStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-24 h-24 mb-8 text-white">
                  <GestureIcon step={onboardingStep} />
                </div>
                <h2 className="font-sans font-black text-4xl uppercase tracking-tighter leading-none mb-5">
                  {currentContent.title}
                </h2>
                <p className="font-sans text-base text-white/80 leading-relaxed mb-4">
                  {currentContent.description}
                </p>
                <p className="font-sans text-sm text-white/50 leading-relaxed">
                  {currentContent.helper}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="shrink-0 space-y-5 pt-4">
            <AnimatePresence mode="wait">
              {isStepComplete && (
                <motion.div
                  key={`${onboardingStep}-complete`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  className="border border-white bg-white/10 p-5"
                >
                  <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/45 mb-3">
                    Step complete
                  </p>
                  <p className="font-sans font-black text-xl uppercase tracking-tighter leading-none">
                    {currentCompletionContent.title}
                  </p>
                  <p className="mt-3 text-sm text-white/60 leading-relaxed">
                    {currentCompletionContent.description}
                  </p>
                  {!isFinalStep && (
                    <div className="mt-5 h-1 bg-white/15 overflow-hidden">
                      <motion.div
                        className="h-full bg-white"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: AUTO_ADVANCE_DELAY / 1000, ease: "linear" }}
                      />
                    </div>
                  )}
                </motion.div>
                )}
            </AnimatePresence>

            <div className={isFinalStep ? "grid grid-cols-2 gap-5" : ""}>
              <button
                type="button"
                onClick={completeOnboarding}
                className="h-16 w-full border border-white/25 text-white/55 text-xs font-black tracking-widest uppercase hover:border-white hover:text-white transition-colors"
              >
                Skip
              </button>

              {isFinalStep && (
                <button
                  type="button"
                  onClick={completeOnboarding}
                  disabled={!isStepComplete}
                  className={`h-16 border text-xs font-black tracking-widest uppercase transition-colors ${
                    isStepComplete
                      ? "border-white bg-white text-black hover:bg-neutral-200"
                      : "border-white/20 bg-white/10 text-white/30 cursor-not-allowed"
                  }`}
                >
                  Finish
                </button>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 bg-neutral-100 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={onboardingStep}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.24 }}
              className="absolute inset-0"
            >
              {onboardingStep === "point" && (
               <PointingExercise onComplete={() => markStepComplete("point")} />
              )}
              {onboardingStep === "click" && (
                <ClickingExercise onComplete={() => markStepComplete("click")} />
              )}
              {onboardingStep === "scroll" && (
                <ScrollingExercise onComplete={() => markStepComplete("scroll")} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
}
