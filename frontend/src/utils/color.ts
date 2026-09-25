import type { FixtureChannelState } from "../types/CueScene";

/** 无人控制时的暗场状态，渐变从这里起步 */
export const DARK_STATE: FixtureChannelState = { intensity: 0, color: "#000000" };

export function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value = parseInt(normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized, 16);
  if (Number.isNaN(value)) return [0, 0, 0];
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return "#" + [clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** 颜色线性插值，ratio=0 取 from，ratio=1 取 to */
export function blendColors(from: string, to: string, ratio: number): string {
  const [fr, fg, fb] = hexToRgb(from);
  const [tr, tg, tb] = hexToRgb(to);
  return rgbToHex(fr + (tr - fr) * ratio, fg + (tg - fg) * ratio, fb + (tb - fb) * ratio);
}

/** 通道状态插值：亮度、颜色同步向目标靠拢 */
export function blendStates(from: FixtureChannelState, to: FixtureChannelState, ratio: number): FixtureChannelState {
  return {
    intensity: from.intensity + (to.intensity - from.intensity) * ratio,
    color: blendColors(from.color, to.color, ratio)
  };
}
