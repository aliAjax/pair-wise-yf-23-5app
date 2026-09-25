import type { Fixture } from "../types/Fixture";
import type { CueScene } from "../types/CueScene";
import type { TimelineTrack } from "../types/TimelineTrack";
import type { ShowProject } from "../types/ShowProject";

// 舞台坐标为百分比 0-100。颜色通道 0-255。
const fixtureSeed: Fixture[] = [
  { id: 1, fixture_code: "PAR-L-01", fixture_type: "PAR", position_x: 18, position_y: 30, dmx_address: 1, channel_count: 3, color_mode: "RGB", fixture_status: "ENABLED" },
  { id: 2, fixture_code: "WASH-C-02", fixture_type: "WASH", position_x: 50, position_y: 22, dmx_address: 4, channel_count: 4, color_mode: "RGBW", fixture_status: "ENABLED" },
  { id: 3, fixture_code: "PAR-R-03", fixture_type: "PAR", position_x: 82, position_y: 30, dmx_address: 8, channel_count: 3, color_mode: "RGB", fixture_status: "ENABLED" },
  { id: 4, fixture_code: "BEAM-F-04", fixture_type: "BEAM", position_x: 35, position_y: 72, dmx_address: 11, channel_count: 3, color_mode: "RGB", fixture_status: "ENABLED" },
  { id: 5, fixture_code: "SPOT-F-05", fixture_type: "SPOT", position_x: 65, position_y: 72, dmx_address: 14, channel_count: 3, color_mode: "RGB", fixture_status: "DISABLED" }
];

// 场景：base 红铺底；blue 与 green 同刻(3000)开始，green 优先级更高应后覆盖；
// stobeWhite 为锁定轨道上的白闪；disabledScene 被停用，不参与。
const cueSceneSeed: CueScene[] = [
  {
    id: 1,
    name: "红色铺底",
    fixture_states: {
      1: { red: 220, green: 30, blue: 30, white: 0, dimmer: 230 },
      2: { red: 200, green: 20, blue: 40, white: 0, dimmer: 220 },
      3: { red: 220, green: 30, blue: 30, white: 0, dimmer: 230 },
      4: { red: 180, green: 10, blue: 20, white: 0, dimmer: 200 }
    },
    fade_in_ms: 500,
    hold_ms: 0,
    priority: 10,
    scene_status: "READY"
  },
  {
    id: 2,
    name: "蓝色推高",
    fixture_states: {
      1: { red: 40, green: 80, blue: 230, white: 0, dimmer: 240 },
      2: { red: 30, green: 100, blue: 240, white: 0, dimmer: 240 },
      3: { red: 40, green: 80, blue: 230, white: 0, dimmer: 240 }
    },
    fade_in_ms: 400,
    hold_ms: 0,
    priority: 5,
    scene_status: "READY"
  },
  {
    id: 3,
    name: "绿色优先（同刻后覆盖）",
    fixture_states: {
      1: { red: 30, green: 220, blue: 60, white: 0, dimmer: 240 },
      2: { red: 30, green: 230, blue: 70, white: 0, dimmer: 240 }
    },
    fade_in_ms: 400,
    hold_ms: 0,
    priority: 8,
    scene_status: "READY"
  },
  {
    id: 4,
    name: "锁定白闪",
    fixture_states: {
      1: { red: 255, green: 255, blue: 255, white: 255, dimmer: 255 },
      2: { red: 255, green: 255, blue: 255, white: 255, dimmer: 255 },
      3: { red: 255, green: 255, blue: 255, white: 255, dimmer: 255 },
      4: { red: 255, green: 255, blue: 255, white: 255, dimmer: 255 }
    },
    fade_in_ms: 0,
    hold_ms: 0,
    priority: 1,
    scene_status: "READY"
  },
  {
    id: 5,
    name: "停用的紫场",
    fixture_states: {
      2: { red: 180, green: 0, blue: 200, white: 0, dimmer: 255 }
    },
    fade_in_ms: 0,
    hold_ms: 0,
    priority: 9,
    scene_status: "DISABLED"
  }
];

const timelineTrackSeed: TimelineTrack[] = [
  // 红色铺底：0 - 16s 全程，layer 1
  { id: 1, cue_scene_id: 1, start_ms: 0, duration_ms: 16000, layer: 1, locked: false },
  // 蓝/绿同刻 3s 开始：绿色 priority 8 > 蓝色 5，故灯1/2 由绿色后覆盖；灯3仅蓝色控制
  { id: 2, cue_scene_id: 2, start_ms: 3000, duration_ms: 5000, layer: 2, locked: false },
  { id: 3, cue_scene_id: 3, start_ms: 3000, duration_ms: 5000, layer: 2, locked: false },
  // 锁定轨道白闪 6s-8s：layer 很低也始终压住普通轨道
  { id: 4, cue_scene_id: 4, start_ms: 6000, duration_ms: 2000, layer: 0, locked: true },
  // 停用场景即使在时间轴上也不参与
  { id: 5, cue_scene_id: 5, start_ms: 4000, duration_ms: 4000, layer: 3, locked: false }
];

const showProjectSeed: ShowProject[] = [
  {
    id: 1,
    title: "晚间联排",
    venue_name: "一号演播厅",
    fixture_ids: [1, 2, 3, 4, 5],
    track_ids: [1, 2, 3, 4, 5],
    updated_at: "2026-09-25T09:00:00Z"
  }
];

export const mockData = {
  fixture: fixtureSeed,
  cueScene: cueSceneSeed,
  timelineTrack: timelineTrackSeed,
  showProject: showProjectSeed
};
