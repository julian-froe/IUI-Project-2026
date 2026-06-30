import { useEffect, useState } from "react";
import { CLICK_TARGETS_REQUIRED, completionPulseFrame } from "../constants";
import { useCompletionPulse } from "../hooks/useCompletionPulse";
import { ExerciseHeader } from "../components/ExerciseHeader";

export function ClickingExercise({ onComplete }: { onComplete: () => void }) {
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
