import React from "react";
import { AnimatePresence, motion } from "motion/react";
import type { HandGesture } from "../../../context/HandModeContext";
import { CURSOR_RADIUS, CURSOR_CIRCUMFERENCE } from "../constants";

export const CursorVisual = React.memo(function CursorVisual({
  isActive,
  isTrackingPaused,
  gesture,
  cursorPositionRef,
  circleRef,
}: {
  isActive: boolean;
  isTrackingPaused: boolean;
  gesture: HandGesture;
  cursorPositionRef: React.RefObject<HTMLDivElement>;
  circleRef: React.RefObject<SVGCircleElement>;
}) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {isActive && !isTrackingPaused && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: gesture === "fist" ? 0.8 : 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed top-0 left-0 w-20 h-20"
          >
            <div
              ref={cursorPositionRef}
              className="w-20 h-20 flex items-center justify-center"
              style={{ willChange: "transform" }}
            >
              <div className={`absolute inset-0 rounded-full border-2 border-blue-500/30 backdrop-blur-[2px] transition-all duration-300 ${
                gesture !== "none" ? "scale-110 bg-blue-500/10" : "scale-100 bg-white/5"
              }`} />

              <svg className="absolute inset-0 w-20 h-20 -rotate-90">
                <circle
                  ref={circleRef}
                  cx="40"
                  cy="40"
                  r={CURSOR_RADIUS}
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeDasharray={CURSOR_CIRCUMFERENCE}
                  style={{ strokeDashoffset: CURSOR_CIRCUMFERENCE, transition: "none" }}
                  strokeLinecap="round"
                />
              </svg>

              <div className={`transition-transform duration-300 ${gesture === "fist" ? "scale-125" : "scale-100"}`}>
                {gesture === "fist" ? (
                  <div className="w-4 h-4 bg-blue-600 rounded-sm rotate-45" />
                ) : (
                  <div className={`w-3 h-3 rounded-full transition-colors ${gesture === "pinch" ? "bg-blue-600 scale-150" : "bg-blue-500"}`} />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
