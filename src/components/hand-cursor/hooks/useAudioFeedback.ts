import { useRef, useCallback } from "react";

export function useAudioFeedback() {
  const audioContextIdx = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextIdx.current) {
      audioContextIdx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextIdx.current;
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }, []);

  const playSuccessSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const startTime = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, startTime);
      osc.frequency.exponentialRampToValueAtTime(240, startTime + 0.045);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(850, startTime);
      filter.Q.setValueAtTime(0.45, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.090, startTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.055);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.07);
    } catch (e) {
      console.warn("Audio context failed", e);
    }
  }, [getAudioContext]);

  const playErrorSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.16);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(0.5, ctx.currentTime);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.090, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn("Audio context failed", e);
    }
  }, [getAudioContext]);

  return { playSuccessSound, playErrorSound };
}
