/** 播放与合成相关的固定参数。 */
export const PLAYBACK = {
  /** 默认时间轴总时长（ms），种子数据内可覆盖。 */
  TIMELINE_DURATION_MS: 16000,
  /** 播放帧间隔（ms）。 */
  TICK_MS: 100,
  /** 自动持久化当前合成结果/播放头的节流间隔（ms）。 */
  PERSIST_THROTTLE_MS: 300,
  /** IndexedDB 库名与版本。 */
  DB_NAME: "stage-light",
  DB_VERSION: 1,
  /** 播放头键值。 */
  PLAYHEAD_KEY: "playhead_ms",
  /** 最近一次合成结果键值。 */
  LAST_RESULT_KEY: "last_composite"
} as const;

/** 合成排序分组：锁定轨道始终在普通轨道之后（后覆盖）。 */
export const TRACK_LOCK_GROUP = { NORMAL: 0, LOCKED: 1 } as const;
