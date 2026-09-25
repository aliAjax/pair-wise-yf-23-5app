import { formatClock } from "../../utils/clock";
import { PLAYBACK } from "../../constants/playback";

interface TimelineRulerProps {
  durationMs: number;
  timeMs: number;
  onSeek?: (timeMs: number) => void;
}

/** 时间轴标尺：点击/拖动跳转播放时刻。 */
export function TimelineRuler({ durationMs, timeMs, onSeek }: TimelineRulerProps) {
  const ticks = Array.from({ length: Math.floor(durationMs / 1000) + 1 }, (_, i) => i * 1000);

  const handlePointer = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    onSeek?.(Math.round((ratio * durationMs) / PLAYBACK.TICK_MS) * PLAYBACK.TICK_MS);
  };

  return (
    <div className="timeline-ruler" onMouseDown={handlePointer}>
      <div className="ruler-ticks">
        {ticks.map((tick) => (
          <span key={tick} className="ruler-tick" style={{ left: `${(tick / durationMs) * 100}%` }}>
            {formatClock(tick)}
          </span>
        ))}
      </div>
      <div className="ruler-playhead" style={{ left: `${(timeMs / durationMs) * 100}%` }} />
    </div>
  );
}
