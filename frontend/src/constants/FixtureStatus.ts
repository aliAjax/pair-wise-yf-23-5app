export const FixtureStatus = ["ENABLED", "DISABLED"] as const;
export type FixtureStatus = (typeof FixtureStatus)[number];
export const FixtureStatusText: Record<FixtureStatus, string> = {
  ENABLED: "启用",
  DISABLED: "停用"
};
