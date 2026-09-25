/** 单灯颜色/亮度通道，取值 0-255。 */
export interface FixtureColorState {
  red: number;
  green: number;
  blue: number;
  white?: number;
  /** 亮度/调光通道，0-255。 */
  dimmer: number;
}

export const BLACKOUT: FixtureColorState = { red: 0, green: 0, blue: 0, white: 0, dimmer: 0 };
