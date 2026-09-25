/** 触发一次合成结果变更的来源，用于增量重算时确定受影响灯具范围。 */
export type CompositeChangeKind =
  | "SCENE_UPDATE"
  | "TRACK_UPDATE"
  | "FIXTURE_UPDATE"
  | "SEEK"
  | "INIT";

export interface CompositeChange {
  kind: CompositeChangeKind;
  /** 被调整的场景/轨道/灯具 id；SEEK、INIT 时为空表示全部。 */
  entityIds?: number[];
  time_ms: number;
}
