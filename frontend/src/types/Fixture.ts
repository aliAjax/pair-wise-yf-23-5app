import type { FixtureType } from "./FixtureType";
import type { ChannelMode } from "./ChannelMode";

export interface Fixture {
  id: number;
  fixture_code: string;
  fixture_type: FixtureType;
  /** 舞台横坐标，0-100 百分比 */
  position_x: number;
  /** 舞台纵坐标，0-100 百分比 */
  position_y: number;
  dmx_address: number;
  channel_count: number;
  color_mode: ChannelMode;
  /** 停用灯具不参与播放合成 */
  enabled: boolean;
}
