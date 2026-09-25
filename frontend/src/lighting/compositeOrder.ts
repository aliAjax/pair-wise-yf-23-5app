import type { CueScene } from "../types/CueScene";
import type { TimelineTrack } from "../types/TimelineTrack";
import { TRACK_LOCK_GROUP } from "../constants/playback";
import { isSceneEnabled, isTrackActive } from "./applyFixtureState";

/** 参与某播放时刻合成的轨道-场景配对（窗口内且场景启用）。 */
export interface ActivePlayable {
  track: TimelineTrack;
  scene: CueScene;
}

/**
 * 覆盖顺序比较器。按顺序依次覆盖，越靠后优先级越高：
 *   1. locked 分组：普通轨道(0) 先于锁定轨道(1) —— 锁定轨道始终压住普通轨道；
 *   2. layer 升序 —— 普通轨道按图层从低到高覆盖；
 *   3. start_ms 升序 —— 同图层越早开始越先铺；
 *   4. priority 升序 —— 多个场景同一时刻开始时，优先级高的排在后面后覆盖；
 *   5. track id 升序 —— 稳定兜底。
 */
export function compareCompositeOrder(a: ActivePlayable, b: ActivePlayable): number {
  const lockGroupA = a.track.locked ? TRACK_LOCK_GROUP.LOCKED : TRACK_LOCK_GROUP.NORMAL;
  const lockGroupB = b.track.locked ? TRACK_LOCK_GROUP.LOCKED : TRACK_LOCK_GROUP.NORMAL;
  if (lockGroupA !== lockGroupB) return lockGroupA - lockGroupB;
  if (a.track.layer !== b.track.layer) return a.track.layer - b.track.layer;
  if (a.track.start_ms !== b.track.start_ms) return a.track.start_ms - b.track.start_ms;
  if (a.scene.priority !== b.scene.priority) return a.scene.priority - b.scene.priority;
  return a.track.id - b.track.id;
}

/** 收集给定播放时刻所有生效的 轨道→场景 配对，并按覆盖顺序排好。 */
export function collectActivePlayables(
  tracks: TimelineTrack[],
  scenesById: Map<number, CueScene>,
  timeMs: number
): ActivePlayable[] {
  const playables: ActivePlayable[] = [];
  for (const track of tracks) {
    if (!isTrackActive(track, timeMs)) continue;
    const scene = scenesById.get(track.cue_scene_id);
    if (!scene || !isSceneEnabled(scene)) continue;
    playables.push({ track, scene });
  }
  return playables.sort(compareCompositeOrder);
}
