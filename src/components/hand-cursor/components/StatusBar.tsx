import React from "react";
import type { HandGesture } from "../../../context/HandModeContext";

export const StatusBar = React.memo(function StatusBar({
  isTrackingPaused,
  isActive,
  gesture,
  shakaHoldProgress,
  isHandOnboardingActive,
}: {
  isTrackingPaused: boolean;
  isActive: boolean;
  gesture: HandGesture;
  shakaHoldProgress: number;
  isHandOnboardingActive: boolean;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none bg-white/90 backdrop-blur-md border border-blue-100 px-4 py-2 rounded-none font-mono text-[9px] tracking-widest uppercase flex flex-col items-start gap-1 shadow-lg min-w-[200px]">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${
          isTrackingPaused
            ? "bg-amber-500"
            : isActive
              ? "bg-blue-500"
              : "bg-red-500 animate-pulse"
        }`} />
        {isTrackingPaused
          ? "Hand Paused"
          : isActive
            ? "System Ready"
            : "Initializing..."}
      </div>
      {isTrackingPaused ? (
        <div className="text-[8px] opacity-60 normal-case tracking-normal">
          Use mouse or hold shaka 2s to resume
        </div>
      ) : isActive && (
        <div className="text-[8px] opacity-60">
          {gesture === "fist" ? "Action: Scrolling" : gesture === "pinch" ? "Action: Selecting" : "Status: Tracking"}
        </div>
      )}
      {shakaHoldProgress > 0 && !isHandOnboardingActive && (
        <>
          <div className="text-[8px] opacity-80 normal-case tracking-normal mt-1">
            {isTrackingPaused
              ? "Hold shaka — resuming in 2 seconds"
              : "Hold shaka — pausing in 2 seconds"}
          </div>
          <div className="w-full h-1 bg-blue-100 overflow-hidden mt-0.5">
            <div
              className="h-full bg-blue-500 transition-none"
              style={{ width: `${Math.round(shakaHoldProgress * 100)}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
});
