import type { CompositionSnapshot } from "../types/Composition";
import { STORAGE_KEYS } from "../constants/storageKeys";

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

/** 读本地行数据，没有或损坏时回退到种子数据 */
export function loadRows<T>(key: string, fallback: T[]): T[] {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export function saveRows<T>(key: string, rows: T[]): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(key, JSON.stringify(rows));
  } catch {
    // 存储写满或被禁用时静默降级，页面内状态仍然可用
  }
}

export function loadCompositionSnapshot(): CompositionSnapshot | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.compositionSnapshot);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CompositionSnapshot;
    if (parsed?.version !== 1 || typeof parsed.timeMs !== "number" || !parsed.results) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCompositionSnapshot(snapshot: CompositionSnapshot): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.compositionSnapshot, JSON.stringify(snapshot));
  } catch {
    // 同上，静默降级
  }
}
