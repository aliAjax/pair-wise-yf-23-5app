import type { FixtureChannelState } from "./CueScene";

/** 某盏灯在某个播放时刻的合成结果 */
export interface FixtureComposeResult {
  fixtureId: number;
  /** 合成后的通道状态；null 表示当前时刻无人控制（保持暗场） */
  state: FixtureChannelState | null;
  /** 最终压台的轨道 / 场景，null 表示无来源 */
  sourceTrackId: number | null;
  sourceSceneId: number | null;
  /** 当前时刻命中该灯具的轨道数量 */
  contributors: number;
}

/** 存入浏览器的合成快照，重新进入页面可继续检查 */
export interface CompositionSnapshot {
  version: number;
  timeMs: number;
  results: Record<number, FixtureComposeResult>;
  /** 上一次重算实际涉及的灯具，用于核对"只重算受影响的灯" */
  recomputedFixtureIds: number[];
  savedAt: string;
}
