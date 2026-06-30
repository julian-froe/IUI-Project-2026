import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import fistIconUrl from "../../assets/HandGestureIcons/Fist.svg";
import openHandIconUrl from "../../assets/HandGestureIcons/OpenHand.svg";
import pinchIconUrl from "../../assets/HandGestureIcons/Pinch.svg";
import shakaIconUrl from "../../assets/HandGestureIcons/shaka_sign.svg";
import { useHandMode, useHandTrackingRef } from "../context/HandModeContext";
import type { HandOnboardingStep, HandTrackingState } from "../context/HandModeContext";

const PRESENT_HAND_DELAY = 2000;
const AUTO_ADVANCE_DELAY = 1200;
const POINT_TARGETS_REQUIRED = 5;
const CLICK_TARGETS_REQUIRED = 3;
const SCROLL_PANELS_REQUIRED = 4;
const completionPulseFrame = "border-green-500 animate-[exercise-complete-pulse_1000ms_ease-out_1]";

const stepOrder: HandOnboardingStep[] = ["point", "click", "scroll"];

const stepContent: Record<HandOnboardingStep, {
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

const emptyCompletion: Record<HandOnboardingStep, boolean> = {
  point: false,
  click: false,
  scroll: false,
};

const stepCompletionContent: Record<HandOnboardingStep, {
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

function PresentHandOverlay({
  tracking,
  onReady,
  onCancel,
}: {
  tracking: HandTrackingState;
  onReady: () => void;
  onCancel: () => void;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (tracking.cameraStatus !== "granted" || !tracking.isShaka) {
      setProgress(0);
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const nextProgress = Math.min((Date.now() - startedAt) / PRESENT_HAND_DELAY, 1);
      setProgress(nextProgress);

      if (nextProgress >= 1) {
        window.clearInterval(timer);
        onReady();
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [tracking.cameraStatus, tracking.isShaka, onReady]);

  if (tracking.cameraStatus !== "granted") {
    return null;
  }

  return (
    <div
      data-hand-onboarding
      className="fixed inset-0 z-[9998] bg-black/65 backdrop-blur-md flex items-center justify-center px-6 text-white"
    >
      <button
        type="button"
        onClick={onCancel}
        className="absolute top-6 right-6 w-11 h-11 border border-white/50 bg-black/20 text-white font-black text-sm hover:bg-white hover:text-black transition-colors"
        aria-label="Close onboarding"
      >
        X
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center"
      >
        <div className="w-36 h-36 mb-8">
          <ShakaIcon />
        </div>
        <h1 className="font-sans font-black text-4xl md:text-5xl uppercase tracking-tighter">
          {tracking.isShaka ? "Hold it there" : "Show the shaka sign"}
        </h1>
        <p className="mt-6 max-w-lg text-white/80 font-sans text-lg leading-relaxed">
          {tracking.isShaka
            ? "Hand tracking starts in 2 seconds."
            : "Hold for 2 seconds to start hand tracking."}
        </p>
        <p className="mt-4 max-w-lg text-white/70 font-sans text-lg leading-relaxed">
          Hold for 2 seconds again anytime to pause or resume.
        </p>
        <div className="mt-8 w-72 h-2 bg-white/20 overflow-hidden">
          <motion.div
            className="h-full bg-white"
            animate={{ width: `${Math.round(progress * 100)}%` }}
            transition={{ duration: 0.08 }}
          />
        </div>
      </motion.div>
    </div>
  );
}

function StepProgress({
  currentStep,
  completedSteps,
}: {
  currentStep: HandOnboardingStep;
  completedSteps: Record<HandOnboardingStep, boolean>;
}) {
  return (
    <div className="flex items-center gap-4">
      {stepOrder.map((step, index) => {
        const isCurrent = currentStep === step;
        const isComplete = completedSteps[step];

        return (
          <div key={step} className="flex items-center gap-4 flex-1 last:flex-none">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              isCurrent || isComplete ? "border-white" : "border-white/40"
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isComplete ? "bg-white" : isCurrent ? "bg-white/70" : "bg-transparent"
              }`} />
            </div>
            {index < stepOrder.length - 1 && (
              <div className="h-px flex-1 border-t border-dashed border-white/30" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PointingExercise({ onComplete }: { onComplete: () => void }) {
  const trackingRef = useHandTrackingRef();
  const [hits, setHits] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const targetRef = useRef<HTMLDivElement>(null);
  const hoverStartedAt = useRef<number | null>(null);

  const targetPositions = [
    { left: "18%", top: "24%" },
    { left: "63%", top: "18%" },
    { left: "72%", top: "62%" },
    { left: "28%", top: "68%" },
    { left: "48%", top: "42%" },
    { left: "16%", top: "52%" },
    { left: "76%", top: "34%" },
  ];
  const targetPosition = targetPositions[targetIndex % targetPositions.length];
  const isComplete = hits >= POINT_TARGETS_REQUIRED;
  const showCompletionPulse = useCompletionPulse(isComplete);

  useEffect(() => {
    if (hits >= POINT_TARGETS_REQUIRED) {
      onComplete();
    }
  }, [hits, onComplete]);

  useEffect(() => {
    if (isComplete) return;

    let rafId: number;

    const checkHover = () => {
      const target = targetRef.current;
      const { isActive, gesture, position } = trackingRef.current;

      if (!target || !isActive || gesture !== "none") {
        hoverStartedAt.current = null;
      } else {
        const rect = target.getBoundingClientRect();
        const isInside =
          position.x >= rect.left &&
          position.x <= rect.right &&
          position.y >= rect.top &&
          position.y <= rect.bottom;

        if (!isInside) {
          hoverStartedAt.current = null;
        } else if (hoverStartedAt.current === null) {
          hoverStartedAt.current = Date.now();
        } else if (Date.now() - hoverStartedAt.current > 250) {
          hoverStartedAt.current = null;
          setHits((current) => {
            if (current >= POINT_TARGETS_REQUIRED) return current;
            return current + 1;
          });
          setTargetIndex((current) => {
            if (current >= POINT_TARGETS_REQUIRED - 1) return current;
            return current + 1;
          });
        }
      }

      rafId = requestAnimationFrame(checkHover);
    };

    rafId = requestAnimationFrame(checkHover);
    return () => cancelAnimationFrame(rafId);
  }, [trackingRef, isComplete]);

  return (
    <section className="absolute inset-0 p-10">
      <ExerciseHeader
        title="Catch the targets"
        description="Hover the hand pointer over each circle."
        progress={`${Math.min(hits, POINT_TARGETS_REQUIRED)} / ${POINT_TARGETS_REQUIRED}`}
      />

      <div className={`absolute inset-10 top-40 border bg-white overflow-hidden ${
        showCompletionPulse ? completionPulseFrame : "border-black/10"
      }`}>
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(90deg,#000_1px,transparent_1px),linear-gradient(#000_1px,transparent_1px)] bg-[size:48px_48px]" />
        {!isComplete && (
          <motion.div
            ref={targetRef}
            key={targetIndex}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 18, stiffness: 260 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-4 border-black bg-white flex items-center justify-center shadow-xl"
            style={targetPosition}
          >
            <div className="w-12 h-12 rounded-full bg-black" />
          </motion.div>
        )}
      </div>
    </section>
  );
}

function ClickingExercise({ onComplete }: { onComplete: () => void }) {
  const [hits, setHits] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const practiceButtonIds = ["one", "two", "three"];
  const displayButtonIds = ["one", "two", "three", "four"];
  const isComplete = hits >= CLICK_TARGETS_REQUIRED;
  const activeId = isComplete ? null : practiceButtonIds[activeIndex];
  const showCompletionPulse = useCompletionPulse(isComplete);

  useEffect(() => {
    if (hits >= CLICK_TARGETS_REQUIRED) {
      onComplete();
    }
  }, [hits, onComplete]);

  useEffect(() => {
    const handleHandClick = (event: Event) => {
      const target = (event as CustomEvent<{ target?: Element }>).detail?.target;
      const clickedPracticeButton = target?.closest("[data-click-practice]");

      if (
        !activeId ||
        !clickedPracticeButton ||
        clickedPracticeButton.getAttribute("data-click-practice") !== activeId
      ) {
        return;
      }

      setHits((current) => {
        if (current >= CLICK_TARGETS_REQUIRED) return current;
        return current + 1;
      });
      setActiveIndex((current) => Math.min(current + 1, practiceButtonIds.length - 1));
    };

    window.addEventListener("handmode:click", handleHandClick);
    return () => window.removeEventListener("handmode:click", handleHandClick);
  }, [activeId]);

  return (
    <section className="absolute inset-0 p-10">
      <ExerciseHeader
        title="Pinch and hold"
        description="Select the active button three times."
        progress={`${Math.min(hits, CLICK_TARGETS_REQUIRED)} / ${CLICK_TARGETS_REQUIRED}`}
      />

      <div className={`absolute inset-10 top-40 grid grid-cols-2 gap-6 border bg-white p-6 ${
        showCompletionPulse ? completionPulseFrame : "border-black/10"
      }`}>
        {displayButtonIds.map((id, index) => {
          const isPracticeButton = practiceButtonIds.includes(id);
          const isActive = isPracticeButton && id === activeId;

          return (
            <button
              key={id}
              type="button"
              data-click-practice={isPracticeButton ? id : undefined}
              onClick={(event) => event.preventDefault()}
              disabled={!isPracticeButton}
              className={`group border-2 p-8 text-left transition-all data-[hand-hover=true]:scale-[1.03] data-[hand-hover=true]:shadow-2xl ${
                isActive
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white text-black/30"
              } ${!isPracticeButton ? "cursor-default" : ""}`}
            >
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase mb-5">
                Button {index + 1}
              </p>
              <p className="font-sans font-black text-4xl uppercase tracking-tighter">
                {isActive ? "Select me" : "Wait"}
              </p>
              {isActive && (
                <p className="mt-5 text-sm text-white/70">
                  Pinch until the cursor ring fills.
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ScrollingExercise({ onComplete }: { onComplete: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [furthestPanel, setFurthestPanel] = useState(0);
  const panels = [
    { title: "Start", className: "bg-white text-black" },
    { title: "Make a fist", className: "bg-neutral-200 text-black" },
    { title: "Move slowly", className: "bg-neutral-800 text-white" },
    { title: "Nice scroll", className: "bg-black text-white" },
  ];
  const isComplete = furthestPanel >= SCROLL_PANELS_REQUIRED - 1;
  const showCompletionPulse = useCompletionPulse(isComplete);

  useEffect(() => {
    if (furthestPanel >= SCROLL_PANELS_REQUIRED - 1) {
      onComplete();
    }
  }, [furthestPanel, onComplete]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updateFurthestPanel = () => {
      const panelHeight = Math.max(container.clientHeight, 1);
      const currentPanel = Math.min(
        SCROLL_PANELS_REQUIRED - 1,
        Math.max(0, Math.round(container.scrollTop / panelHeight)),
      );
      setFurthestPanel((current) => Math.max(current, currentPanel));
    };

    container.addEventListener("scroll", updateFurthestPanel, { passive: true });
    updateFurthestPanel();

    return () => container.removeEventListener("scroll", updateFurthestPanel);
  }, []);

  return (
    <section className="absolute inset-0 p-10">
      <ExerciseHeader
        title="Scroll the stack"
        description="Use a fist to move through all four cards."
        progress={`${Math.min(furthestPanel + 1, SCROLL_PANELS_REQUIRED)} / ${SCROLL_PANELS_REQUIRED}`}
      />

      <div
        ref={scrollRef}
        data-scrollable="true"
        className={`absolute inset-10 top-40 overflow-y-auto snap-y snap-mandatory no-scrollbar border bg-white ${
          showCompletionPulse ? completionPulseFrame : "border-black"
        }`}
      >
        {panels.map((panel, index) => (
          <article
            key={panel.title}
            className={`h-full snap-start flex flex-col justify-center px-14 ${panel.className}`}
          >
            <p className="font-mono text-[10px] tracking-[0.35em] uppercase opacity-50 mb-6">
              Card {index + 1}
            </p>
            <h3 className="font-sans font-black text-7xl uppercase tracking-tighter leading-none">
              {panel.title}
            </h3>
            <p className="mt-6 max-w-md text-lg opacity-70">
              {index === panels.length - 1
                ? "You reached the end. Finish is ready."
                : "Keep your fist closed and move your hand."}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ExerciseHeader({
  title,
  description,
  progress,
}: {
  title: string;
  description: string;
  progress: string;
}) {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 h-36 bg-white border-b border-black/10 px-10 py-6 flex justify-between items-start gap-8">
      <div>
        <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-black/40 mb-2">
          Practice
        </p>
        <h3 className="font-sans font-black text-4xl uppercase tracking-tighter leading-none">
          {title}
        </h3>
        <p className="mt-2 text-sm text-black/55">
          {description}
        </p>
      </div>
      <div className="min-w-28 border border-black bg-white px-5 py-4 text-center">
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-black/40 mb-1">
          Done
        </p>
        <p className="font-sans font-black text-2xl">
          {progress}
        </p>
      </div>
    </header>
  );
}

function useCompletionPulse(isComplete: boolean) {
  const [showPulse, setShowPulse] = useState(false);
  const hasPulsed = useRef(false);

  useEffect(() => {
    if (!isComplete) {
      hasPulsed.current = false;
      setShowPulse(false);
      return;
    }

    if (hasPulsed.current) {
      return;
    }

    hasPulsed.current = true;
    setShowPulse(true);
    const timer = window.setTimeout(() => setShowPulse(false), 1000);

    return () => window.clearTimeout(timer);
  }, [isComplete]);

  return showPulse;
}

function GestureIcon({ step }: { step: HandOnboardingStep }) {
  if (step === "click") return <PinchIcon />;
  if (step === "scroll") return <FistIcon />;
  return <OpenHandIcon />;
}

function OpenHandIcon() {
  return <HandGestureImage src={openHandIconUrl} />;
}

function ShakaIcon() {
  return <HandGestureImage src={shakaIconUrl} />;
}

function PinchIcon() {
  return <HandGestureImage src={pinchIconUrl} />;
}

function FistIcon() {
  return <HandGestureImage src={fistIconUrl} />;
}

function HandGestureImage({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="w-full h-full object-contain invert"
      draggable={false}
    />
  );
}
