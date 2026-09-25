export interface Fixture {
  id: number;
  fixture_code: string;
  fixture_type: string;
  position_x: number;
  position_y: number;
  dmx_address: number;
  channel_count: number;
  color_mode: string;
  /** ENABLED 参与合成；DISABLED 灯具在任意播放时刻都不参与。 */
  fixture_status: string;
}
