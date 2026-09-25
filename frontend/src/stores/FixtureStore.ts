import { create } from "zustand";
import { listFixture } from "../api/Fixture";
import type { Fixture } from "../types/Fixture";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { loadRows, saveRows } from "../utils/compositionStorage";
import { useCompositionStore } from "./CompositionStore";

type State = {
  rows: Fixture[];
  loading: boolean;
  load: () => Promise<void>;
  /** 停用/启用灯具：停用灯具不参与合成，只重算这盏灯 */
  setEnabled: (id: number, enabled: boolean) => void;
};

export const useFixtureStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    const seed = await listFixture();
    set({ rows: loadRows(STORAGE_KEYS.fixtures, seed), loading: false });
  },
  setEnabled(id, enabled) {
    const rows = get().rows.map((row) => (row.id === id ? { ...row, enabled } : row));
    set({ rows });
    saveRows(STORAGE_KEYS.fixtures, rows);
    console.info(LOG_TEMPLATES.Fixture[2], { id, enabled });
    useCompositionStore.getState().recomputeFixtures([id]);
  }
}));
