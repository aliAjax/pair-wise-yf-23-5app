export interface TimelineTrack {
  id: number;
  cue_scene_id: number;
  start_ms: number;
  duration_ms: number;
  /** 普通轨道按图层从低到高覆盖 */
  layer: number;
  /** 锁定轨道始终压住普通轨道 */
  locked: boolean;
}
