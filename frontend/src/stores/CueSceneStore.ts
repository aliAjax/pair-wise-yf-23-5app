import { create } from "zustand";
import { listCueScene } from "../api/CueScene";
import type { CueScene } from "../types/CueScene";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { loadRows, saveRows } from "../utils/compositionStorage";
import { affectedFixtureIdsForScene } from "../utils/compositionEngine";
import { useCompositionStore } from "./CompositionStore";

type State = {
  rows: CueScene[];
  loading: boolean;
  load: () => Promise<void>;
  /** 调整场景（优先级、状态、灯具状态等）：只重算受影响的灯 */
  updateScene: (id: number, patch: Partial<Omit<CueScene, "id">>) => void;
};

export const useCueSceneStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    const seed = await listCueScene();
    set({ rows: loadRows(STORAGE_KEYS.cueScenes, seed), loading: false });
  },
  updateScene(id, patch) {
    const prev = get().rows.find((row) => row.id === id);
    if (!prev) return;
    const next: CueScene = { ...prev, ...patch, id };
    const rows = get().rows.map((row) => (row.id === id ? next : row));
    set({ rows });
    saveRows(STORAGE_KEYS.cueScenes, rows);
    console.info(LOG_TEMPLATES.CueScene[1], { id, patch });
    useCompositionStore.getState().recomputeFixtures(affectedFixtureIdsForScene(prev, next));
  }
}));
