import type { CueScene } from "../types/CueScene";
import type { TimelineTrack } from "../types/TimelineTrack";
import type { FixtureColorState } from "../types/FixtureColorState";
import { CueStatus } from "../constants/CueStatus";
import { scaleColorByFade } from "../utils/color";

/** 轨道在给定播放时刻是否处于其片段窗口内（含起点，不含终点）。 */
export function isTrackActive(track: TimelineTrack, timeMs: number): boolean {
  return timeMs >= track.start_ms && timeMs < track.start_ms + track.duration_ms;
}

/** 停用场景（DISABLED）不参与；DRAFT/READY/ARCHIVED 中仅 DISABLED 被排除。 */
export function isSceneEnabled(scene: CueScene): boolean {
  return scene.scene_status !== CueStatus[2];
}

/**
 * 计算一条命中轨道在当前时刻的淡入系数。
 * 淡入从轨道起点开始（编排以轨道为播放单位），时长取场景 fade_in_ms。
 */
export function resolveFade(track: TimelineTrack, scene: CueScene, timeMs: number): number {
  const fadeIn = Math.max(0, scene.fade_in_ms);
  if (fadeIn === 0) return 1;
  const elapsed = timeMs - track.start_ms;
  if (elapsed <= 0) return 0;
  if (elapsed >= fadeIn) return 1;
  return elapsed / fadeIn;
}

/** 取场景对某盏灯的目标颜色；场景未控制该灯返回 null。 */
export function resolveTargetColor(scene: CueScene, fixtureId: number): FixtureColorState | null {
  return scene.fixture_states[fixtureId] ?? null;
}

/** 淡入插值后的实际颜色。 */
export function applyFixtureState(scene: CueScene, fixtureId: number, fade: number): FixtureColorState | null {
  const target = resolveTargetColor(scene, fixtureId);
  if (target === null) return null;
  return scaleColorByFade(target, fade);
}
