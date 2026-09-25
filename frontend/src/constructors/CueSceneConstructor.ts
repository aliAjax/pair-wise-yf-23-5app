import type { CueScene } from "../types/CueScene";
import { BLACKOUT } from "../types/FixtureColorState";

export const createDefaultCueScene = (overrides: Partial<CueScene> = {}): CueScene => ({
  id: 0,
  name: "新建场景",
  fixture_states: {},
  fade_in_ms: 0,
  hold_ms: 0,
  priority: 0,
  scene_status: "READY",
  ...overrides
});

export const createCueSceneForm = createDefaultCueScene;
export const createCueSceneResponse = createDefaultCueScene;

/** 构造一个单灯颜色目标（默认黑场）。 */
export const createFixtureStateTarget = (overrides: Partial<typeof BLACKOUT> = {}) => ({
  ...BLACKOUT,
  ...overrides
});
