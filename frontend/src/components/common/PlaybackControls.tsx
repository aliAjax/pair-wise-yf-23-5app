import { formatDurationMs } from "../../utils/formatters";

/** 播放控制：播放/暂停、拖动播放头、时刻读数 */
export function PlaybackControls({
  timeMs,
  durationMs,
  playing,
  onToggle,
  onSeek
}: {
  timeMs: number;
  durationMs: number;
  playing: boolean;
  onToggle: () => void;
  onSeek: (timeMs: number) => void;
}) {
  return (
    <div className="playback-controls">
      <button type="button" className="play-button" onClick={onToggle}>
        {playing ? "暂停" : "播放"}
      </button>
      <input
        type="range"
        min={0}
        max={Math.max(durationMs, 1)}
        step={100}
        value={Math.min(timeMs, durationMs)}
        onChange={(event) => onSeek(Number(event.target.value))}
      />
      <span className="time-readout">
        {formatDurationMs(timeMs)} / {formatDurationMs(durationMs)}
      </span>
    </div>
  );
}
