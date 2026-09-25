import type { Fixture } from "../types/Fixture";
import type { FixtureColorState } from "../types/FixtureColorState";
import type { CompositeContributor, CompositeFixtureResult } from "../types/CompositeResult";
import { BLACKOUT } from "../types/FixtureColorState";
import { FixtureStatus } from "../constants/FixtureStatus";
import { applyFixtureState, resolveFade } from "./applyFixtureState";
import type { ActivePlayable } from "./compositeOrder";

/** 停用灯具不参与合成：保持黑场、无覆盖链路。 */
function composeDisabledFixture(fixture: Fixture): CompositeFixtureResult {
  return {
    fixtureId: fixture.id,
    active: false,
    color: { ...BLACKOUT },
    contributors: [],
    winningSceneId: null,
    winningTrackId: null
  };
}

/**
 * 合成单盏灯在某播放时刻的结果。
 * playables 已按覆盖顺序从先到后排列，依次覆盖，末尾为最终生效者。
 */
export function composeFixture(
  fixture: Fixture,
  playables: ActivePlayable[],
  timeMs: number
): CompositeFixtureResult {
  if (fixture.fixture_status === FixtureStatus[1]) {
    return composeDisabledFixture(fixture);
  }

  let color: FixtureColorState = { ...BLACKOUT };
  const contributors: CompositeContributor[] = [];
  let winningSceneId: number | null = null;
  let winningTrackId: number | null = null;

  for (const { track, scene } of playables) {
    const fade = resolveFade(track, scene, timeMs);
    const nextColor = applyFixtureState(scene, fixture.id, fade);
    if (nextColor === null) continue;
    color = nextColor;
    contributors.push({
      trackId: track.id,
      sceneId: scene.id,
      sceneName: scene.name,
      layer: track.layer,
      locked: track.locked,
      priority: scene.priority,
      startMs: track.start_ms,
      fade,
      color: { ...nextColor }
    });
    winningSceneId = scene.id;
    winningTrackId = track.id;
  }

  return {
    fixtureId: fixture.id,
    active: true,
    color,
    contributors,
    winningSceneId,
    winningTrackId
  };
}
