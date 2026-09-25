/** 浏览器本地存储 key，统一收口，避免散落各处 */
export const STORAGE_KEYS = {
  fixtures: "stage-light:fixtures:v1",
  cueScenes: "stage-light:cue-scenes:v1",
  timelineTracks: "stage-light:timeline-tracks:v1",
  /** 合成结果快照：重新进入页面后继续检查 */
  compositionSnapshot: "stage-light:composition:v1"
} as const;
