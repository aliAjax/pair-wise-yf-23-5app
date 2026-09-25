import { create } from "zustand";
import type { FixtureComposeResult } from "../types/Composition";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { composeAtTime } from "../utils/compositionEngine";
import { loadCompositionSnapshot, saveCompositionSnapshot } from "../utils/compositionStorage";
import { useFixtureStore } from "./FixtureStore";
import { useCueSceneStore } from "./CueSceneStore";
import { useTimelineTrackStore } from "./TimelineTrackStore";

type State = {
  /** 当前播放时刻 */
  timeMs: number;
  /** fixtureId -> 合成结果 */
  results: Record<number, FixtureComposeResult>;
  /** 上一次重算实际涉及的灯具，供灯光师核对增量范围 */
  lastRecomputedFixtureIds: number[];
  recomputeCount: number;
  /** 快照写入浏览器的时间 */
  savedAt: string | null;
  /** 从浏览器恢复快照；没有快照则全量重算 */
  bootstrap: () => void;
  /** 移动播放头：时刻变了，所有灯都可能变，全量重算 */
  setTime: (timeMs: number) => void;
  fullRecompute: () => void;
  /** 调整场景/轨道/灯具后，只重算受影响的灯；调用方用引擎算出受影响灯具集合 */
  recomputeFixtures: (fixtureIds: number[]) => void;
};

function currentInput() {
  return {
    fixtures: useFixtureStore.getState().rows,
    scenes: useCueSceneStore.getState().rows,
    tracks: useTimelineTrackStore.getState().rows
  };
}

export const useCompositionStore = create<State>((set, get) => {
  /** 重算一批灯并把快照写进浏览器；fixtureIds 为 null 表示全量 */
  const applyRecompute = (fixtureIds: number[] | null) => {
    const { timeMs, results, recomputeCount } = get();
    const input = currentInput();
    const partial = composeAtTime({ ...input, timeMs }, fixtureIds ?? undefined);
    const merged = fixtureIds ? { ...results, ...partial } : partial;
    const recomputed = fixtureIds ?? input.fixtures.map((fixture) => fixture.id);
    const savedAt = new Date().toISOString();
    set({
      results: merged,
      lastRecomputedFixtureIds: recomputed,
      recomputeCount: recomputeCount + 1,
      savedAt
    });
    saveCompositionSnapshot({
      version: 1,
      timeMs,
      results: merged,
      recomputedFixtureIds: recomputed,
      savedAt
    });
    console.info(fixtureIds ? LOG_TEMPLATES.Composition[1] : LOG_TEMPLATES.Composition[0], {
      fixtureIds: recomputed,
      timeMs
    });
    console.info(LOG_TEMPLATES.Composition[2], { savedAt });
  };

  return {
    timeMs: 0,
    results: {},
    lastRecomputedFixtureIds: [],
    recomputeCount: 0,
    savedAt: null,

    bootstrap() {
      const snapshot = loadCompositionSnapshot();
      if (snapshot) {
        set({
          timeMs: snapshot.timeMs,
          results: snapshot.results,
          lastRecomputedFixtureIds: snapshot.recomputedFixtureIds,
          savedAt: snapshot.savedAt
        });
        console.info(LOG_TEMPLATES.Composition[3], { savedAt: snapshot.savedAt });
        return;
      }
      get().fullRecompute();
    },

    setTime(timeMs) {
      set({ timeMs });
      applyRecompute(null);
    },

    fullRecompute() {
      applyRecompute(null);
    },

    recomputeFixtures(fixtureIds) {
      if (fixtureIds.length === 0) return;
      applyRecompute([...new Set(fixtureIds)]);
    }
  };
});
