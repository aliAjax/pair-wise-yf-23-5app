import { useCallback, useEffect, useRef, useState } from "react";
import { useCompositionStore } from "../stores/CompositionStore";

const TICK_MS = 100;

/**
 * 播放时钟：每 100ms 推进一次播放头并触发合成重算，走到末尾自动循环。
 * 时间轴总时长由调用方（预览页）根据轨道计算后传入。
 */
export function useTimelinePlayback(durationMs: number) {
  const [playing, setPlaying] = useState(false);
  const durationRef = useRef(durationMs);
  durationRef.current = durationMs;

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      const { timeMs, setTime } = useCompositionStore.getState();
      const duration = durationRef.current;
      const next = timeMs + TICK_MS;
      setTime(duration > 0 && next >= duration ? 0 : next);
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [playing]);

  const play = useCallback(() => setPlaying(true), []);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => setPlaying((value) => !value), []);

  return { playing, play, pause, toggle, tickMs: TICK_MS };
}
