import { useMemo } from "react";
import type { Fixture } from "../types/Fixture";

export interface DmxConflict {
  leftId: number;
  rightId: number;
  dmxAddress: number;
}

/**
 * DMX 地址冲突检查：通道区间 [address, address+channel_count-1] 重叠即冲突。
 */
export function useDmxAddressCheck(fixtures: Fixture[] = []) {
  const conflicts = useMemo<DmxConflict[]>(() => {
    const enabled = fixtures.filter((fixture) => fixture.fixture_status === "ENABLED");
    const result: DmxConflict[] = [];
    for (let i = 0; i < enabled.length; i += 1) {
      for (let j = i + 1; j < enabled.length; j += 1) {
        const a = enabled[i];
        const b = enabled[j];
        const aStart = Number(a.dmx_address);
        const bStart = Number(b.dmx_address);
        if (Number.isNaN(aStart) || Number.isNaN(bStart)) continue;
        const aEnd = aStart + Number(a.channel_count) - 1;
        const bEnd = bStart + Number(b.channel_count) - 1;
        if (aStart <= bEnd && bStart <= aEnd) {
          result.push({ leftId: a.id, rightId: b.id, dmxAddress: Math.max(aStart, bStart) });
        }
      }
    }
    return result;
  }, [fixtures]);

  const hasConflict = conflicts.length > 0;
  return { conflicts, hasConflict };
}
