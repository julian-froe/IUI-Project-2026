import type { HandCameraStatus } from "../../../context/HandModeContext";

export function CameraAccessOverlay({ cameraStatus }: { cameraStatus: HandCameraStatus }) {
  if (cameraStatus !== "requesting" && cameraStatus !== "denied") return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="bg-white border border-black p-8 max-w-md text-center shadow-2xl">
        <h2 className="font-sans font-black text-2xl uppercase tracking-tighter mb-4">Camera Access Required</h2>
        <p className="font-sans text-sm text-neutral-600 mb-8 leading-relaxed">
          {cameraStatus === "requesting"
            ? "We cannot bypass your browser's security. Please allow camera access in the native prompt to enable Hand Tracking Mode."
            : "Camera access was denied. Hand mode disabled. Please reset your browser permissions to try again."}
        </p>
        {cameraStatus === "requesting" && <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />}
      </div>
    </div>
  );
}
