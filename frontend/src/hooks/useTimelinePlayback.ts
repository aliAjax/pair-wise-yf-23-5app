import { useCallback, useEffect, useRef, useState } from "react";
import { PLAYBACK } from "../constants/playback";

/**
 * 时间轴播放：按 TICK_MS 推进播放头，到末尾自动停止。
 * seek 由外部（预览 store）同步，保证播放与合成共用同一播放时刻。
 */
export function useTimelinePlayback(durationMs: number, onTick: (timeMs: number) => void) {
  const [playing, setPlaying] = useState(false);
  const [timeMs, setTimeMs] = useState(0);
  const rafRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const seek = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(durationMs, next));
      setTimeMs(clamped);
      onTickRef.current(clamped);
    },
    [durationMs]
  );

  useEffect(() => {
    if (!playing) return;
    rafRef.current = setInterval(() => {
      setTimeMs((prev) => {
        const next = prev + PLAYBACK.TICK_MS;
        if (next >= durationMs) {
          setPlaying(false);
          const end = durationMs;
          onTickRef.current(end);
          return end;
        }
        onTickRef.current(next);
        return next;
      });
    }, PLAYBACK.TICK_MS);
    return () => {
      if (rafRef.current) clearInterval(rafRef.current);
    };
  }, [playing, durationMs]);

  const play = useCallback(() => {
    if (timeMs >= durationMs) seek(0);
    setPlaying(true);
  }, [timeMs, durationMs, seek]);
  const pause = useCallback(() => setPlaying(false), []);
  const reset = useCallback(() => {
    setPlaying(false);
    seek(0);
  }, [seek]);

  return { playing, timeMs, setTimeMs: seek, play, pause, reset, toggle: playing ? pause : play };
}
