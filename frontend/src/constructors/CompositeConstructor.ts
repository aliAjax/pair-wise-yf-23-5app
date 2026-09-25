import type { CompositeFixtureResult, CompositeSnapshot } from "../types/CompositeResult";

export const createCompositeResult = (overrides: Partial<CompositeFixtureResult> = {}): CompositeFixtureResult => ({
  fixtureId: 0,
  active: false,
  color: { red: 0, green: 0, blue: 0, white: 0, dimmer: 0 },
  contributors: [],
  winningSceneId: null,
  winningTrackId: null,
  ...overrides
});

export const createCompositeSnapshot = (
  time_ms: number,
  results: CompositeFixtureResult[],
  savedAt = new Date().toISOString()
): CompositeSnapshot => ({
  time_ms,
  results,
  saved_at: savedAt
});
