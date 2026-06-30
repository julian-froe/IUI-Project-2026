import type { HandOnboardingStep } from "../../../context/HandModeContext";
import fistIconUrl from "../../../../assets/HandGestureIcons/Fist.svg";
import openHandIconUrl from "../../../../assets/HandGestureIcons/OpenHand.svg";
import pinchIconUrl from "../../../../assets/HandGestureIcons/Pinch.svg";
import shakaIconUrl from "../../../../assets/HandGestureIcons/shaka_sign.svg";

export function HandGestureImage({ src }: { src: string }) {
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

export function OpenHandIcon() {
  return <HandGestureImage src={openHandIconUrl} />;
}

export function ShakaIcon() {
  return <HandGestureImage src={shakaIconUrl} />;
}

export function PinchIcon() {
  return <HandGestureImage src={pinchIconUrl} />;
}

export function FistIcon() {
  return <HandGestureImage src={fistIconUrl} />;
}

export function GestureIcon({ step }: { step: HandOnboardingStep }) {
  if (step === "click") return <PinchIcon />;
  if (step === "scroll") return <FistIcon />;
  return <OpenHandIcon />;
}
