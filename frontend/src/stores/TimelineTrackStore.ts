import { create } from "zustand";
import { listTimelineTrack, saveTimelineTrack } from "../api/TimelineTrack";
import type { TimelineTrack } from "../types/TimelineTrack";

type State = {
  rows: TimelineTrack[];
  loading: boolean;
  load: () => Promise<void>;
  upsert: (track: TimelineTrack) => Promise<TimelineTrack>;
};

export const useTimelineTrackStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listTimelineTrack(), loading: false });
  },
  async upsert(track) {
    const saved = await saveTimelineTrack(track);
    const exists = get().rows.some((row) => row.id === saved.id);
    set({
      rows: exists
        ? get().rows.map((row) => (row.id === saved.id ? saved : row))
        : [...get().rows, saved]
    });
    return saved;
  }
}));
