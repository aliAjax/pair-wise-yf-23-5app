import type { TimelineTrack } from "../../types/TimelineTrack";
import type { CueScene } from "../../types/CueScene";

interface TrackStripProps {
  tracks: TimelineTrack[];
  scenesById: Map<number, CueScene>;
  durationMs: number;
  timeMs: number;
  selectedTrackId: number | null;
  onSelectTrack: (id: number) => void;
}

/** 多轨道时间轴条带：锁定轨道标红，当前时刻生效的轨道高亮，停用场景置灰。 */
export function TrackStrip({ tracks, scenesById, durationMs, timeMs, selectedTrackId, onSelectTrack }: TrackStripProps) {
  return (
    <div className="track-strip">
      {tracks.map((track) => {
        const scene = scenesById.get(track.cue_scene_id);
        const disabled = scene ? scene.scene_status === "DISABLED" : true;
        const active = !disabled && timeMs >= track.start_ms && timeMs < track.start_ms + track.duration_ms;
        const className = [
          "track-block",
          track.locked ? "locked" : "normal",
          active ? "live" : "",
          disabled ? "muted" : "",
          selectedTrackId === track.id ? "selected" : ""
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            type="button"
            key={track.id}
            className={className}
            style={{
              left: `${(track.start_ms / durationMs) * 100}%`,
              width: `${(track.duration_ms / durationMs) * 100}%`
            }}
            onClick={() => onSelectTrack(track.id)}
            title={scene ? `${scene.name} · layer ${track.layer}${track.locked ? " · 锁定" : ""}` : "场景缺失"}
          >
            <span>{scene?.name ?? "缺失场景"}</span>
            <small>
              L{track.layer}
              {track.locked ? " 🔒" : ""}
            </small>
          </button>
        );
      })}
      <div className="track-playhead" style={{ left: `${(timeMs / durationMs) * 100}%` }} />
    </div>
  );
}
