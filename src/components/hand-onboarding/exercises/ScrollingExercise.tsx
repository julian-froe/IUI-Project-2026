import { useEffect, useState, useRef } from "react";
import { SCROLL_PANELS_REQUIRED, completionPulseFrame } from "../constants";
import { useCompletionPulse } from "../hooks/useCompletionPulse";
import { ExerciseHeader } from "../components/ExerciseHeader";

export function ScrollingExercise({ onComplete }: { onComplete: () => void }) {
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
