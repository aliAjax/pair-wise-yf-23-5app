import { create } from "zustand";
import { listFixture, saveFixture } from "../api/Fixture";
import type { Fixture } from "../types/Fixture";

type State = {
  rows: Fixture[];
  loading: boolean;
  load: () => Promise<void>;
  upsert: (fixture: Fixture) => Promise<Fixture>;
};

export const useFixtureStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listFixture(), loading: false });
  },
  async upsert(fixture) {
    const saved = await saveFixture(fixture);
    const exists = get().rows.some((row) => row.id === saved.id);
    set({
      rows: exists
        ? get().rows.map((row) => (row.id === saved.id ? saved : row))
        : [...get().rows, saved]
    });
    return saved;
  }
}));
