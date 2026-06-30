import { useState, useRef, useEffect } from "react";

export function useCompletionPulse(isComplete: boolean) {
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
