import type { FixtureColorState } from "../types/FixtureColorState";

const clampChannel = (value: number): number => Math.max(0, Math.min(255, Math.round(value)));

export const clampColor = (color: FixtureColorState): FixtureColorState => ({
  red: clampChannel(color.red),
  green: clampChannel(color.green),
  blue: clampChannel(color.blue),
  white: clampChannel(color.white ?? 0),
  dimmer: clampChannel(color.dimmer)
});

/** 按淡入系数把目标颜色从黑场插值到目标值（fade=0 全黑，fade=1 完全到达）。 */
export const scaleColorByFade = (target: FixtureColorState, fade: number): FixtureColorState =>
  clampColor({
    red: target.red * fade,
    green: target.green * fade,
    blue: target.blue * fade,
    white: (target.white ?? 0) * fade,
    dimmer: target.dimmer * fade
  });

/** CSS rgb 字符串（不含白色通道）。 */
export const toRgbCss = (color: FixtureColorState): string =>
  `rgb(${clampChannel(color.red)}, ${clampChannel(color.green)}, ${clampChannel(color.blue)})`;

/** 感知亮度，用于决定灯上图标的前景色。 */
export const perceivedLuminance = (color: FixtureColorState): number =>
  (0.2126 * color.red + 0.7152 * color.green + 0.0722 * color.blue) / 255;
