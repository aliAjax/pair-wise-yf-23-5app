import { formatClock } from "../../utils/clock";

interface PlaybackControlsProps {
  playing: boolean;
  timeMs: number;
  durationMs: number;
  recomputedCount: number;
  restored: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSeek: (timeMs: number) => void;
  onSaveSnapshot: () => void;
}

/** 播放控制条：播放/暂停、回到开头、跳转、保存检查快照。 */
export function PlaybackControls({
  playing,
  timeMs,
  durationMs,
  recomputedCount,
  restored,
  onToggle,
  onReset,
  onSeek,
  onSaveSnapshot
}: PlaybackControlsProps) {
  return (
    <div className="playback-controls">
      <button type="button" className="primary" onClick={onToggle}>
        {playing ? "暂停" : "播放"}
      </button>
      <button type="button" onClick={onReset}>
        回到开头
      </button>
      <span className="clock">
        {formatClock(timeMs)} / {formatClock(durationMs)}
      </span>
      <input
        type="range"
        min={0}
        max={durationMs}
        step={100}
        value={timeMs}
        onChange={(event) => onSeek(Number(event.target.value))}
        className="scrub"
      />
      <span className="recomputed-hint">本次重算 {recomputedCount} 盏灯</span>
      {restored ? <span className="restored-hint">已从浏览器恢复</span> : null}
      <button type="button" onClick={onSaveSnapshot}>
        保存检查快照
      </button>
    </div>
  );
}
