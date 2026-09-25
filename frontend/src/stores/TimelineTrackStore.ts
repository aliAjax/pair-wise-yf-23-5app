import { create } from "zustand";
import { listTimelineTrack } from "../api/TimelineTrack";
import type { TimelineTrack } from "../types/TimelineTrack";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { loadRows, saveRows } from "../utils/compositionStorage";
import { affectedFixtureIdsForTrack } from "../utils/compositionEngine";
import { useCompositionStore } from "./CompositionStore";
import { useCueSceneStore } from "./CueSceneStore";

type State = {
  rows: TimelineTrack[];
  loading: boolean;
  load: () => Promise<void>;
  /** 调整轨道（图层、锁定、起点等）：只重算受影响场景覆盖的灯 */
  updateTrack: (id: number, patch: Partial<Omit<TimelineTrack, "id">>) => void;
};

export const useTimelineTrackStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    const seed = await listTimelineTrack();
    set({ rows: loadRows(STORAGE_KEYS.timelineTracks, seed), loading: false });
  },
  updateTrack(id, patch) {
    const prev = get().rows.find((row) => row.id === id);
    if (!prev) return;
    const next: TimelineTrack = { ...prev, ...patch, id };
    const rows = get().rows.map((row) => (row.id === id ? next : row));
    set({ rows });
    saveRows(STORAGE_KEYS.timelineTracks, rows);
    console.info(LOG_TEMPLATES.TimelineTrack[1], { id, patch });
    const scenes = useCueSceneStore.getState().rows;
    useCompositionStore.getState().recomputeFixtures(affectedFixtureIdsForTrack(prev, next, scenes));
  }
}));
