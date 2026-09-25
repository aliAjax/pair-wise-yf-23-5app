import type { CueScene, FixtureChannelState } from "../types/CueScene";
import type { Fixture } from "../types/Fixture";
import type { TimelineTrack } from "../types/TimelineTrack";
import type { FixtureComposeResult } from "../types/Composition";
import { DARK_STATE, blendStates } from "./color";

/** 一条轨道连同它引用的场景，合成时的最小计算单元 */
export interface ActiveTrackContext {
  track: TimelineTrack;
  scene: CueScene;
}

export interface ComposeInput {
  fixtures: Fixture[];
  scenes: CueScene[];
  tracks: TimelineTrack[];
  timeMs: number;
}

/**
 * 挑出当前时刻在播的轨道。
 * 停用场景（DISABLED）不参与；轨道窗口为 [start_ms, start_ms + duration_ms)。
 */
export function getActiveTrackContexts(scenes: CueScene[], tracks: TimelineTrack[], timeMs: number): ActiveTrackContext[] {
  const sceneById = new Map(scenes.map((scene) => [scene.id, scene]));
  const contexts: ActiveTrackContext[] = [];
  for (const track of tracks) {
    if (timeMs < track.start_ms || timeMs >= track.start_ms + track.duration_ms) continue;
    const scene = sceneById.get(track.cue_scene_id);
    if (!scene || scene.scene_status === "DISABLED") continue;
    contexts.push({ track, scene });
  }
  return contexts;
}

/**
 * 叠加顺序（靠后的覆盖靠前的）：
 * 1. 普通轨道先铺，锁定轨道整组后压 —— 锁定始终压住普通；
 * 2. 同组内按图层从低到高；
 * 3. 同层先开始的先铺，后开始的后盖；
 * 4. 同一时刻开始的场景，优先级高的后覆盖；
 * 5. 以上都打平时按轨道 id 保证结果稳定。
 */
export function sortTrackContexts(contexts: ActiveTrackContext[]): ActiveTrackContext[] {
  return [...contexts].sort((a, b) => {
    const lockedA = a.track.locked ? 1 : 0;
    const lockedB = b.track.locked ? 1 : 0;
    if (lockedA !== lockedB) return lockedA - lockedB;
    if (a.track.layer !== b.track.layer) return a.track.layer - b.track.layer;
    if (a.track.start_ms !== b.track.start_ms) return a.track.start_ms - b.track.start_ms;
    if (a.scene.priority !== b.scene.priority) return a.scene.priority - b.scene.priority;
    return a.track.id - b.track.id;
  });
}

/**
 * 按叠加顺序逐条压台，合成单盏灯在某个时刻的状态。
 * 渐变中的轨道按 fade_in_ms 进度，从低层已合成的状态插值到自己的目标状态。
 */
export function composeFixtureState(sortedContexts: ActiveTrackContext[], fixtureId: number, timeMs: number): FixtureComposeResult {
  let state: FixtureChannelState | null = null;
  let sourceTrackId: number | null = null;
  let sourceSceneId: number | null = null;
  let contributors = 0;

  for (const { track, scene } of sortedContexts) {
    const target = scene.fixture_states[fixtureId];
    if (!target) continue;
    contributors += 1;
    const elapsed = timeMs - track.start_ms;
    const progress = scene.fade_in_ms > 0 ? Math.min(1, Math.max(0, elapsed / scene.fade_in_ms)) : 1;
    const base: FixtureChannelState = state ?? DARK_STATE;
    state = progress >= 1 ? { ...target } : blendStates(base, target, progress);
    sourceTrackId = track.id;
    sourceSceneId = scene.id;
  }

  return { fixtureId, state, sourceTrackId, sourceSceneId, contributors };
}

/**
 * 按播放时刻合成灯具结果。
 * 只传 fixtureIds 时只重算这些灯（调整场景/轨道后的增量重算），其余灯的结果由调用方保留。
 * 停用灯具不参与，结果里直接给暗场。
 */
export function composeAtTime(input: ComposeInput, fixtureIds?: number[]): Record<number, FixtureComposeResult> {
  const { fixtures, scenes, tracks, timeMs } = input;
  const fixtureById = new Map(fixtures.map((fixture) => [fixture.id, fixture]));
  const sorted = sortTrackContexts(getActiveTrackContexts(scenes, tracks, timeMs));
  const targetIds = fixtureIds ?? fixtures.map((fixture) => fixture.id);

  const results: Record<number, FixtureComposeResult> = {};
  for (const fixtureId of targetIds) {
    const fixture = fixtureById.get(fixtureId);
    if (!fixture || !fixture.enabled) {
      results[fixtureId] = { fixtureId, state: null, sourceTrackId: null, sourceSceneId: null, contributors: 0 };
      continue;
    }
    results[fixtureId] = composeFixtureState(sorted, fixtureId, timeMs);
  }
  return results;
}

/** 场景内容变了，受影响的灯 = 新旧 fixture_states 里出现过的灯具并集 */
export function affectedFixtureIdsForScene(prev: CueScene | undefined, next: CueScene): number[] {
  const ids = new Set<number>();
  for (const key of Object.keys(prev?.fixture_states ?? {})) ids.add(Number(key));
  for (const key of Object.keys(next.fixture_states)) ids.add(Number(key));
  return [...ids];
}

/** 轨道变了，受影响的灯 = 新旧两条轨道各自关联场景的灯具并集 */
export function affectedFixtureIdsForTrack(prev: TimelineTrack | undefined, next: TimelineTrack, scenes: CueScene[]): number[] {
  const sceneById = new Map(scenes.map((scene) => [scene.id, scene]));
  const ids = new Set<number>();
  for (const sceneId of [prev?.cue_scene_id, next.cue_scene_id]) {
    if (sceneId == null) continue;
    for (const key of Object.keys(sceneById.get(sceneId)?.fixture_states ?? {})) ids.add(Number(key));
  }
  return [...ids];
}
