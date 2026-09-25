import { create } from "zustand";
import { listCueScene, saveCueScene } from "../api/CueScene";
import type { CueScene } from "../types/CueScene";

type State = {
  rows: CueScene[];
  loading: boolean;
  load: () => Promise<void>;
  upsert: (scene: CueScene) => Promise<CueScene>;
};

export const useCueSceneStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listCueScene(), loading: false });
  },
  async upsert(scene) {
    const saved = await saveCueScene(scene);
    const exists = get().rows.some((row) => row.id === saved.id);
    set({
      rows: exists
        ? get().rows.map((row) => (row.id === saved.id ? saved : row))
        : [...get().rows, saved]
    });
    return saved;
  }
}));
