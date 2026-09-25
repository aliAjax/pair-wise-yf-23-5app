import type { Fixture } from "../types/Fixture";
import type { CueScene } from "../types/CueScene";
import type { TimelineTrack } from "../types/TimelineTrack";
import type { CompositeFixtureResult } from "../types/CompositeResult";
import { collectActivePlayables } from "./compositeOrder";
import { composeFixture } from "./composeFixture";
import { LOG_TEMPLATES } from "../constants/logTemplates";

/**
 * 合成引擎：维护灯具/场景/轨道与当前播放时刻，
 * 并提供按受影响范围的增量重算。
 *
 * 依赖关系：
 * - 场景变更 → 引用该场景的所有轨道窗口内可能命中的灯（简单起见取这些轨道 + 场景控制的灯的并集）；
 * - 轨道变更（时间/图层/锁定/绑定场景）→ 该轨道窗口覆盖时间点下、其场景控制的灯；
 * - 灯具变更（含停用/启用）→ 仅该灯具；
 * - 播放头移动 / 初始化 → 全部启用灯具。
 */
export class CompositeEngine {
  private fixtures: Fixture[] = [];
  private scenes: CueScene[] = [];
  private tracks: TimelineTrack[] = [];
  private timeMs = 0;
  private results = new Map<number, CompositeFixtureResult>();
  /** 本次增量重算实际重算的灯具数，供页面展示"只重算受影响的灯"。 */
  lastRecomputedFixtureIds: number[] = [];

  setFixtures(fixtures: Fixture[]): number[] {
    this.fixtures = fixtures;
    return fixtures.map((fixture) => fixture.id);
  }

  setScenes(scenes: CueScene[]): number[] {
    this.scenes = scenes;
    return this.allFixtureIds();
  }

  setTracks(tracks: TimelineTrack[]): number[] {
    this.tracks = tracks;
    return this.allFixtureIds();
  }

  seek(timeMs: number): number[] {
    this.timeMs = Math.max(0, timeMs);
    return this.allFixtureIds();
  }

  get currentTimeMs(): number {
    return this.timeMs;
  }

  /** 调整场景：仅重算受该场景控制的灯（颜色/优先级/淡入/停用都只作用于这些灯）。 */
  affectedByScene(sceneId: number): number[] {
    const scene = this.scenes.find((item) => item.id === sceneId);
    const controlled = scene ? Object.keys(scene.fixture_states).map(Number) : [];
    return this.uniqueFixtureIds(controlled);
  }

  /**
   * 调整轨道：重算两类灯的并集——
   * 1) 新绑定场景当前控制的灯（覆盖改颜色/绑定新场景）；
   * 2) 调整前结果中由该轨道贡献过颜色的灯（覆盖改时间窗口、改图层、改锁定、换绑旧场景）。
   */
  affectedByTracks(trackIds: number[]): number[] {
    const fixtureIds: number[] = [];
    for (const trackId of trackIds) {
      const track = this.tracks.find((item) => item.id === trackId);
      if (track) {
        const scene = this.scenes.find((item) => item.id === track.cue_scene_id);
        if (scene) fixtureIds.push(...Object.keys(scene.fixture_states).map(Number));
      }
      for (const result of this.results.values()) {
        if (result.contributors.some((contributor) => contributor.trackId === trackId)) {
          fixtureIds.push(result.fixtureId);
        }
      }
    }
    return this.uniqueFixtureIds(fixtureIds);
  }

  /** 调整灯具（含停用/启用、位置等）：仅重算这些灯。 */
  affectedByFixtures(fixtureIds: number[]): number[] {
    return this.uniqueFixtureIds(fixtureIds);
  }

  /**
   * 执行增量重算。fixtureIds 为受影响灯集合；为空表示全量。
   * 返回本次真正重算的灯具 id（停用灯具也会重算为黑场）。
   */
  recompute(fixtureIds: number[] = this.allFixtureIds()): CompositeFixtureResult[] {
    const targetIds = fixtureIds.length > 0 ? fixtureIds : this.allFixtureIds();
    const scenesById = new Map(this.scenes.map((scene) => [scene.id, scene]));
    const playables = collectActivePlayables(this.tracks, scenesById, this.timeMs);

    for (const fixtureId of targetIds) {
      const fixture = this.fixtures.find((item) => item.id === fixtureId);
      if (!fixture) {
        this.results.delete(fixtureId);
        continue;
      }
      this.results.set(fixtureId, composeFixture(fixture, playables, this.timeMs));
    }

    this.lastRecomputedFixtureIds = targetIds.filter((id) =>
      this.fixtures.some((fixture) => fixture.id === id)
    );
    if (this.lastRecomputedFixtureIds.length > 0) {
      // 所有写操作都要记录日志（见 constants/logTemplates）。
      console.info(LOG_TEMPLATES.Composite[1], {
        timeMs: this.timeMs,
        recomputed: this.lastRecomputedFixtureIds
      });
    }
    return this.getResults();
  }

  /** 首次/全量合成。 */
  recomputeAll(): CompositeFixtureResult[] {
    return this.recompute(this.allFixtureIds());
  }

  getResults(): CompositeFixtureResult[] {
    return this.fixtures.map((fixture) => this.results.get(fixture.id)).filter(
      (result): result is CompositeFixtureResult => Boolean(result)
    );
  }

  getResult(fixtureId: number): CompositeFixtureResult | undefined {
    return this.results.get(fixtureId);
  }

  private allFixtureIds(): number[] {
    return this.fixtures.map((fixture) => fixture.id);
  }

  private uniqueFixtureIds(ids: number[]): number[] {
    return Array.from(new Set(ids.filter((id) => this.fixtures.some((f) => f.id === id))));
  }
}
