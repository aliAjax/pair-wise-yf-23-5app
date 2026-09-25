export interface TimelineTrack {
  id: number;
  cue_scene_id: number;
  start_ms: number;
  duration_ms: number;
  /** 普通轨道图层，数值越大越靠上、后覆盖。 */
  layer: number;
  /** 锁定轨道始终压住普通轨道（无论 layer 大小）。 */
  locked: boolean;
}
