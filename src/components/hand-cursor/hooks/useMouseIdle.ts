import { useEffect, useState } from "react";
import { MOUSE_IDLE_HIDE_DELAY } from "../constants";

export function useMouseIdle(isEnabled: boolean) {
  const [isMouseInputActive, setIsMouseInputActive] = useState(true);

  useEffect(() => {
    if (!isEnabled) {
      document.body.classList.remove("hide-cursor");
      setIsMouseInputActive(true);
      return;
    }

    setIsMouseInputActive(true);

    let idleTimer = window.setTimeout(() => {
      setIsMouseInputActive(false);
      document.body.classList.add("hide-cursor");
    }, MOUSE_IDLE_HIDE_DELAY);

    const activateMouseUntilIdle = () => {
      setIsMouseInputActive(true);
      document.body.classList.remove("hide-cursor");
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        setIsMouseInputActive(false);
        document.body.classList.add("hide-cursor");
      }, MOUSE_IDLE_HIDE_DELAY);
    };

    window.addEventListener("mousemove", activateMouseUntilIdle, true);
    window.addEventListener("mousedown", activateMouseUntilIdle, true);

    return () => {
      window.clearTimeout(idleTimer);
      window.removeEventListener("mousemove", activateMouseUntilIdle, true);
      window.removeEventListener("mousedown", activateMouseUntilIdle, true);
      document.body.classList.remove("hide-cursor");
      setIsMouseInputActive(true);
    };
  }, [isEnabled]);

  return isMouseInputActive;
}
