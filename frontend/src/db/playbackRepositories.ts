import type { CompositeSnapshot } from "../types/CompositeResult";
import { STORE_NAMES, idbClear, idbDelete, idbGet, idbGetAll, idbPut, openStageLightDb } from "./stageLightDb";
import { PLAYBACK } from "../constants/playback";
import { createCompositeSnapshot } from "../constructors/CompositeConstructor";

export interface StoredSnapshot extends CompositeSnapshot {
  id?: number;
  label: string;
}

/** kv 表无 keyPath，必须带 key 写入。 */
export async function kvSet(key: string, value: unknown): Promise<void> {
  const db = await openStageLightDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAMES.kv, "readwrite");
    const request = transaction.objectStore(STORE_NAMES.kv).put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function kvGet<T>(key: string): Promise<T | undefined> {
  return idbGet<T>(STORE_NAMES.kv, key);
}

export const playheadRepository = {
  async load(): Promise<number> {
    const value = await kvGet<number>(PLAYBACK.PLAYHEAD_KEY);
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
  },
  async save(timeMs: number): Promise<void> {
    await kvSet(PLAYBACK.PLAYHEAD_KEY, timeMs);
  }
};

export const lastResultRepository = {
  async load(): Promise<CompositeSnapshot | null> {
    return (await kvGet<CompositeSnapshot>(PLAYBACK.LAST_RESULT_KEY)) ?? null;
  },
  async save(snapshot: CompositeSnapshot): Promise<void> {
    await kvSet(PLAYBACK.LAST_RESULT_KEY, snapshot);
  }
};

/** 命名检查快照：保存后重新进入页面仍可继续检查。 */
export const snapshotRepository = {
  async list(): Promise<StoredSnapshot[]> {
    const rows = await idbGetAll<StoredSnapshot>(STORE_NAMES.snapshot);
    return rows.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
  },
  async add(label: string, snapshot: CompositeSnapshot): Promise<StoredSnapshot> {
    const record: StoredSnapshot = { ...createCompositeSnapshot(snapshot.time_ms, snapshot.results, snapshot.saved_at), label };
    const id = await idbPut(STORE_NAMES.snapshot, record);
    return { ...record, id: Number(id) };
  },
  async remove(id: number): Promise<void> {
    await idbDelete(STORE_NAMES.snapshot, id);
  },
  async clear(): Promise<void> {
    await idbClear(STORE_NAMES.snapshot);
  }
};
