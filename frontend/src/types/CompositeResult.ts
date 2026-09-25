import type { FixtureColorState } from "./FixtureColorState";

/** 某盏灯在合成链中的一次命中（一个生效轨道/场景）。 */
export interface CompositeContributor {
  trackId: number;
  sceneId: number;
  sceneName: string;
  layer: number;
  locked: boolean;
  priority: number;
  startMs: number;
  /** 该命中在当前播放时刻的淡入系数 0-1。 */
  fade: number;
  /** 淡入后的实际颜色。 */
  color: FixtureColorState;
}

export interface CompositeFixtureResult {
  fixtureId: number;
  /** 是否参与合成（停用灯具始终为 false）。 */
  active: boolean;
  /** 最终颜色（按规则依次覆盖后的结果）。 */
  color: FixtureColorState;
  /** 覆盖链路，按从先到后的覆盖顺序排列，末尾即最终生效者。 */
  contributors: CompositeContributor[];
  /** 最终生效的场景 id；无命中时为 null（黑场）。 */
  winningSceneId: number | null;
  winningTrackId: number | null;
}

export interface CompositeSnapshot {
  time_ms: number;
  results: CompositeFixtureResult[];
  saved_at: string;
  /** 种子/数据结构版本，版本不符时丢弃浏览器中的旧结果。 */
  version?: number;
}
