import { useCallback, useEffect, useState } from "react";
import { kvGet, kvSet } from "../db/playbackRepositories";

/**
 * 把一段可 JSON 化的 UI 状态持久化到 IndexedDB（kv 表）。
 * 重新进入页面时读回，便于继续检查。
 */
export function useIndexedDbStore<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    kvGet<T>(key).then((stored) => {
      if (!cancelled && stored !== undefined) setValue(stored);
      if (!cancelled) setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const save = useCallback(
    (next: T) => {
      setValue(next);
      void kvSet(key, next);
    },
    [key]
  );

  return { value, setValue: save, hydrated };
}
