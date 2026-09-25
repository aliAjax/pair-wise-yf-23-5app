import type { FixtureColorState } from "./FixtureColorState";

export interface CueScene {
  id: number;
  name: string;
  /** 场景对各灯具的目标颜色/亮度，key 为 fixture id。 */
  fixture_states: Record<number, FixtureColorState>;
  fade_in_ms: number;
  hold_ms: number;
  /** 数值越大优先级越高；同一播放时刻开始的场景，高优先级后覆盖。 */
  priority: number;
  scene_status: string;
}
