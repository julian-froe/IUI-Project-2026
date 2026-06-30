import type { HandOnboardingStep } from "../../../context/HandModeContext";
import { stepOrder } from "../constants";

export function StepProgress({
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
