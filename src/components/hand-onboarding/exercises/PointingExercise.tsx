import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { useHandTrackingRef } from "../../../context/HandModeContext";
import { POINT_TARGETS_REQUIRED, completionPulseFrame } from "../constants";
import { useCompletionPulse } from "../hooks/useCompletionPulse";
import { ExerciseHeader } from "../components/ExerciseHeader";

export function PointingExercise({ onComplete }: { onComplete: () => void }) {
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
