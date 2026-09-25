export const mockData = {
  "fixture": [
    { "id": 1, "fixture_code": "PAR-01", "fixture_type": "PAR", "position_x": 18, "position_y": 30, "dmx_address": 1, "channel_count": 3, "color_mode": "RGB", "enabled": true },
    { "id": 2, "fixture_code": "SPOT-01", "fixture_type": "SPOT", "position_x": 38, "position_y": 22, "dmx_address": 17, "channel_count": 4, "color_mode": "RGBW", "enabled": true },
    { "id": 3, "fixture_code": "WASH-01", "fixture_type": "WASH", "position_x": 58, "position_y": 30, "dmx_address": 33, "channel_count": 3, "color_mode": "RGB", "enabled": true },
    { "id": 4, "fixture_code": "BEAM-01", "fixture_type": "BEAM", "position_x": 78, "position_y": 22, "dmx_address": 49, "channel_count": 16, "color_mode": "MOVING_HEAD", "enabled": true },
    { "id": 5, "fixture_code": "STB-01", "fixture_type": "STROBE", "position_x": 30, "position_y": 68, "dmx_address": 65, "channel_count": 1, "color_mode": "DIMMER_ONLY", "enabled": true },
    { "id": 6, "fixture_code": "PAR-02", "fixture_type": "PAR", "position_x": 70, "position_y": 68, "dmx_address": 81, "channel_count": 3, "color_mode": "RGB", "enabled": false }
  ],
  "cueScene": [
    {
      "id": 1,
      "name": "暖色底光",
      "fixture_states": {
        "1": { "intensity": 70, "color": "#ff9a3c" },
        "2": { "intensity": 70, "color": "#ff9a3c" },
        "3": { "intensity": 70, "color": "#ff9a3c" },
        "4": { "intensity": 60, "color": "#ffb46b" },
        "5": { "intensity": 50, "color": "#ff9a3c" },
        "6": { "intensity": 70, "color": "#ff9a3c" }
      },
      "fade_in_ms": 0,
      "hold_ms": 12000,
      "priority": 1,
      "scene_status": "READY"
    },
    {
      "id": 2,
      "name": "蓝色氛围",
      "fixture_states": {
        "1": { "intensity": 90, "color": "#2e6bff" },
        "2": { "intensity": 90, "color": "#2e6bff" },
        "3": { "intensity": 90, "color": "#2e6bff" }
      },
      "fade_in_ms": 2000,
      "hold_ms": 7000,
      "priority": 2,
      "scene_status": "READY"
    },
    {
      "id": 3,
      "name": "追光独奏",
      "fixture_states": {
        "2": { "intensity": 100, "color": "#ffffff" }
      },
      "fade_in_ms": 500,
      "hold_ms": 5500,
      "priority": 3,
      "scene_status": "READY"
    },
    {
      "id": 4,
      "name": "红色强调",
      "fixture_states": {
        "2": { "intensity": 95, "color": "#ff2e4d" },
        "3": { "intensity": 95, "color": "#ff2e4d" }
      },
      "fade_in_ms": 0,
      "hold_ms": 4000,
      "priority": 5,
      "scene_status": "READY"
    },
    {
      "id": 5,
      "name": "旧版彩排",
      "fixture_states": {
        "4": { "intensity": 100, "color": "#22c55e" }
      },
      "fade_in_ms": 0,
      "hold_ms": 12000,
      "priority": 9,
      "scene_status": "DISABLED"
    }
  ],
  "timelineTrack": [
    { "id": 1, "cue_scene_id": 1, "start_ms": 0, "duration_ms": 12000, "layer": 0, "locked": false },
    { "id": 2, "cue_scene_id": 2, "start_ms": 0, "duration_ms": 9000, "layer": 1, "locked": false },
    { "id": 3, "cue_scene_id": 3, "start_ms": 1000, "duration_ms": 6000, "layer": 0, "locked": true },
    { "id": 4, "cue_scene_id": 4, "start_ms": 0, "duration_ms": 4000, "layer": 1, "locked": false },
    { "id": 5, "cue_scene_id": 5, "start_ms": 0, "duration_ms": 12000, "layer": 2, "locked": false }
  ],
  "showProject": [
    {
      "id": 1,
      "title": "周末 Livehouse 场",
      "venue_name": "东郊音乐厅",
      "fixture_ids": [1, 2, 3, 4, 5, 6],
      "track_ids": [1, 2, 3, 4, 5],
      "updated_at": "2026-09-25T09:00:00Z"
    }
  ]
} as const;
