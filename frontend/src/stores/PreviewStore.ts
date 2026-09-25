import { create } from "zustand";
import type { Fixture } from "../types/Fixture";
import type { CueScene } from "../types/CueScene";
import type { TimelineTrack } from "../types/TimelineTrack";
import type { CompositeChangeKind } from "../types/CompositeChange";
import type { CompositeFixtureResult } from "../types/CompositeResult";
import { CompositeEngine } from "../lighting/CompositeEngine";
import { PLAYBACK } from "../constants/playback";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_CODES } from "../constants/errorCodes";
import {
  lastResultRepository,
  playheadRepository,
  snapshotRepository,
  type StoredSnapshot
} from "../db/playbackRepositories";
import { useFixtureStore } from "./FixtureStore";
import { useCueSceneStore } from "./CueSceneStore";
import { useTimelineTrackStore } from "./TimelineTrackStore";
import { createCompositeSnapshot } from "../constructors/CompositeConstructor";

interface PreviewState {
  ready: boolean;
  fixtures: Fixture[];
  scenes: CueScene[];
  tracks: TimelineTrack[];
  results: CompositeFixtureResult[];
  timeMs: number;
  durationMs: number;
  /** 最近一次重算覆盖的灯具 id，用于"只重算受影响的灯"。 */
  lastRecomputed: number[];
  lastChange: CompositeChangeKind;
  snapshots: StoredSnapshot[];
  restoredFromStorage: boolean;

  init: () => Promise<void>;
  seek: (timeMs: number) => void;
  updateScene: (scene: CueScene) => Promise<void>;
  updateTrack: (track: TimelineTrack) => Promise<void>;
  updateFixture: (fixture: Fixture) => Promise<void>;
  saveSnapshot: (label: string) => Promise<void>;
  loadSnapshot: (id: number) => void;
  removeSnapshot: (id: number) => Promise<void>;
}

// 合成引擎为非响应式重型对象，放在 store 之外。
const engine = new CompositeEngine();
let persistTimer: ReturnType<typeof setTimeout> | null = null;
/** 数据版本：IndexedDB 种子升级后可强制丢弃旧缓存。 */
const DATA_VERSION = 3;

function computeDuration(tracks: TimelineTrack[]): number {
  const maxEnd = tracks.reduce((max, track) => Math.max(max, track.start_ms + track.duration_ms), 0);
  return Math.max(PLAYBACK.TIMELINE_DURATION_MS, maxEnd);
}

export const usePreviewStore = create<PreviewState>((set, get) => {
  /** 用引擎结果刷新 store，并按节流把结果/播放头写入浏览器。 */
  const flush = (affected: number[], change: CompositeChangeKind, persistNow = false) => {
    const results = engine.recompute(affected);
    const timeMs = engine.currentTimeMs;
    set({ results, timeMs, lastRecomputed: engine.lastRecomputedFixtureIds, lastChange: change, restoredFromStorage: false });

    const snapshot = createCompositeSnapshot(timeMs, results);
    snapshot.version = DATA_VERSION;
    const fire = () => {
      void playheadRepository.save(timeMs);
      void lastResultRepository.save(snapshot);
    };
    if (persistNow) {
      fire();
    } else if (persistTimer === null) {
      persistTimer = setTimeout(() => {
        persistTimer = null;
        fire();
      }, PLAYBACK.PERSIST_THROTTLE_MS);
    }
  };

  return {
    ready: false,
    fixtures: [],
    scenes: [],
    tracks: [],
    results: [],
    timeMs: 0,
    durationMs: PLAYBACK.TIMELINE_DURATION_MS,
    lastRecomputed: [],
    lastChange: "INIT",
    snapshots: [],
    restoredFromStorage: false,

    async init() {
      if (get().ready) return;
      const [fixtures, scenes, tracks] = await Promise.all([
        useFixtureStore.getState().load().then(() => useFixtureStore.getState().rows),
        useCueSceneStore.getState().load().then(() => useCueSceneStore.getState().rows),
        useTimelineTrackStore.getState().load().then(() => useTimelineTrackStore.getState().rows)
      ]);

      engine.setFixtures(fixtures);
      engine.setScenes(scenes);
      engine.setTracks(tracks);

      // 重新进入页面：恢复播放头与最近一次合成结果，继续检查。
      const savedPlayhead = await playheadRepository.load();
      const savedSnapshot = await lastResultRepository.load();
      const snapshots = await snapshotRepository.list();

      engine.seek(savedPlayhead);
      const results = engine.recomputeAll();
      const sameVersion = Boolean(savedSnapshot && savedSnapshot.version === DATA_VERSION);
      const restoredResults = sameVersion && savedSnapshot ? savedSnapshot.results : results;

      console.info(LOG_TEMPLATES.Composite[3], { savedPlayhead, restored: Boolean(sameVersion) });

      set({
        ready: true,
        fixtures,
        scenes,
        tracks,
        timeMs: savedPlayhead,
        durationMs: computeDuration(tracks),
        results: sameVersion ? restoredResults : results,
        lastRecomputed: engine.lastRecomputedFixtureIds,
        lastChange: "INIT",
        snapshots,
        restoredFromStorage: Boolean(sameVersion && savedSnapshot)
      });
      void playheadRepository.save(savedPlayhead);
    },

    seek(timeMs) {
      if (timeMs < 0) throw new Error(ERROR_CODES.COMPOSITE_TIME_INVALID);
      const affected = engine.seek(timeMs);
      flush(affected, "SEEK");
    },

    async updateScene(scene) {
      const saved = await useCueSceneStore.getState().upsert(scene);
      const scenes = useCueSceneStore.getState().rows;
      engine.setScenes(scenes);
      set({ scenes });
      flush(engine.affectedByScene(saved.id), "SCENE_UPDATE", true);
    },

    async updateTrack(track) {
      const saved = await useTimelineTrackStore.getState().upsert(track);
      const tracks = useTimelineTrackStore.getState().rows;
      engine.setTracks(tracks);
      set({ tracks, durationMs: computeDuration(tracks) });
      flush(engine.affectedByTracks([saved.id]), "TRACK_UPDATE", true);
    },

    async updateFixture(fixture) {
      const saved = await useFixtureStore.getState().upsert(fixture);
      const fixtures = useFixtureStore.getState().rows;
      engine.setFixtures(fixtures);
      set({ fixtures });
      flush(engine.affectedByFixtures([saved.id]), "FIXTURE_UPDATE", true);
    },

    async saveSnapshot(label) {
      const { timeMs, results } = get();
      const record = await snapshotRepository.add(label, createCompositeSnapshot(timeMs, results));
      console.info(LOG_TEMPLATES.Composite[2], { id: record.id, label, timeMs });
      set({ snapshots: await snapshotRepository.list() });
    },

    loadSnapshot(id) {
      const record = get().snapshots.find((item) => item.id === id);
      if (!record) throw new Error(ERROR_CODES.COMPOSITE_SNAPSHOT_UNAVAILABLE);
      // 跳转到快照时刻并用当前数据重新全量合成，避免快照里的旧颜色与已编辑数据不一致。
      engine.seek(record.time_ms);
      const results = engine.recomputeAll();
      set({
        timeMs: record.time_ms,
        results,
        lastRecomputed: engine.lastRecomputedFixtureIds,
        lastChange: "SEEK",
        restoredFromStorage: true
      });
      void playheadRepository.save(record.time_ms);
      void lastResultRepository.save({ ...createCompositeSnapshot(record.time_ms, results), version: DATA_VERSION });
    },

    async removeSnapshot(id) {
      await snapshotRepository.remove(id);
      set({ snapshots: await snapshotRepository.list() });
    }
  };
});
