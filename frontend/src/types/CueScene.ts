import type { CueStatus } from "./CueStatus";

/** 单个灯具在场景中的目标状态 */
export interface FixtureChannelState {
  /** 亮度 0-100 */
  intensity: number;
  /** 颜色，#rrggbb */
  color: string;
}

export interface CueScene {
  id: number;
  name: string;
  /** fixtureId -> 目标通道状态 */
  fixture_states: Record<number, FixtureChannelState>;
  fade_in_ms: number;
  hold_ms: number;
  /** 同一时刻开始的场景，优先级高的后覆盖 */
  priority: number;
  scene_status: CueStatus;
}
