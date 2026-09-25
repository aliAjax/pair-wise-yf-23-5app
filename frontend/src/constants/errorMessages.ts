export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  COMPOSITE_TIME_INVALID: "播放时刻不能为负数",
  COMPOSITE_SNAPSHOT_UNAVAILABLE: "浏览器中没有可恢复的检查快照",
  INDEXEDDB_UNAVAILABLE: "当前浏览器不支持 IndexedDB，合成结果无法持久化"
};
