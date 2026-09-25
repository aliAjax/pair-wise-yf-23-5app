import { useEffect, useMemo } from "react";
import { useFixtureStore } from "../stores/FixtureStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { useCompositionStore } from "../stores/CompositionStore";
import { useTimelinePlayback } from "../hooks/useTimelinePlayback";
import { StageCanvas } from "../components/common/StageCanvas";
import { PlaybackControls } from "../components/common/PlaybackControls";
import { StatusBadge } from "../components/common/StatusBadge";
import { formatDate, formatDurationMs } from "../utils/formatters";

export function PreviewPage() {
  const fixtures = useFixtureStore((state) => state.rows);
  const scenes = useCueSceneStore((state) => state.rows);
  const tracks = useTimelineTrackStore((state) => state.rows);
  const setFixtureEnabled = useFixtureStore((state) => state.setEnabled);
  const updateScene = useCueSceneStore((state) => state.updateScene);
  const updateTrack = useTimelineTrackStore((state) => state.updateTrack);
  const timeMs = useCompositionStore((state) => state.timeMs);
  const results = useCompositionStore((state) => state.results);
  const lastRecomputedFixtureIds = useCompositionStore((state) => state.lastRecomputedFixtureIds);
  const recomputeCount = useCompositionStore((state) => state.recomputeCount);
  const savedAt = useCompositionStore((state) => state.savedAt);
  const setTime = useCompositionStore((state) => state.setTime);

  // 先进数据，再恢复浏览器里的合成快照（没有快照则全量重算）
  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      useFixtureStore.getState().load(),
      useCueSceneStore.getState().load(),
      useTimelineTrackStore.getState().load()
    ]).then(() => {
      if (!cancelled) useCompositionStore.getState().bootstrap();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const durationMs = useMemo(
    () => tracks.reduce((max, track) => Math.max(max, track.start_ms + track.duration_ms), 0),
    [tracks]
  );
  const { playing, toggle } = useTimelinePlayback(durationMs);

  const sceneById = useMemo(() => new Map(scenes.map((scene) => [scene.id, scene])), [scenes]);
  const fixtureCodeById = useMemo(
    () => new Map(fixtures.map((fixture) => [fixture.id, fixture.fixture_code])),
    [fixtures]
  );

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light</p>
          <h1>舞台预览</h1>
        </div>
        <StatusBadge value={playing ? "PLAYING" : "PAUSED"} />
      </section>

      <PlaybackControls
        timeMs={timeMs}
        durationMs={durationMs}
        playing={playing}
        onToggle={toggle}
        onSeek={setTime}
      />

      <section className="workbench">
        <div className="panel wide">
          <h2>舞台合成画面 · {formatDurationMs(timeMs)}</h2>
          <StageCanvas fixtures={fixtures} results={results} />
          <ul className="rule-list">
            <li>普通轨道按图层从低到高覆盖</li>
            <li>锁定轨道始终压住普通轨道</li>
            <li>停用场景和停用灯具不参与合成</li>
            <li>同一时刻开始的场景，优先级高的后覆盖</li>
          </ul>
        </div>

        <div className="panel">
          <h2>重算与存档</h2>
          <p className="kv"><span>上次重算灯具</span><strong>{lastRecomputedFixtureIds.length > 0 ? lastRecomputedFixtureIds.map((id) => fixtureCodeById.get(id) ?? id).join("、") : "—"}</strong></p>
          <p className="kv"><span>累计重算次数</span><strong>{recomputeCount}</strong></p>
          <p className="kv"><span>快照保存于</span><strong>{savedAt ? formatDate(savedAt) : "—"}</strong></p>
          <p className="hint">合成结果已写入浏览器 localStorage，重新进入页面可继续检查。</p>
        </div>
      </section>

      <section className="workbench">
        <div className="panel wide">
          <h2>灯具合成结果</h2>
          <div className="table">
            {fixtures.map((fixture) => {
              const result = results[fixture.id];
              const state = result?.state ?? null;
              const sourceScene = result?.sourceSceneId != null ? sceneById.get(result.sourceSceneId) : undefined;
              return (
                <article className="row fixture-result" key={fixture.id}>
                  <span className="swatch" style={{ background: fixture.enabled && state ? state.color : "#2c2f2c" }} />
                  <strong>{fixture.fixture_code}</strong>
                  <span>{fixture.enabled ? (state ? `亮度 ${Math.round(state.intensity)}%` : "暗场") : "已停用"}</span>
                  <span>{fixture.enabled && sourceScene ? `${sourceScene.name} / 轨道 #${result?.sourceTrackId}` : "—"}</span>
                  <span>{fixture.enabled ? `命中 ${result?.contributors ?? 0} 条` : "不参与"}</span>
                  <button type="button" className="mini-button" onClick={() => setFixtureEnabled(fixture.id, !fixture.enabled)}>
                    {fixture.enabled ? "停用" : "启用"}
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <h2>轨道调整</h2>
          <div className="table">
            {tracks.map((track) => {
              const scene = sceneById.get(track.cue_scene_id);
              return (
                <article className="row track-row" key={track.id}>
                  <strong>#{track.id} {scene?.name ?? "未知场景"}</strong>
                  <span>图层 {track.layer} · {track.locked ? "锁定" : "普通"}</span>
                  <span className="button-group">
                    <button type="button" className="mini-button" onClick={() => updateTrack(track.id, { layer: Math.max(0, track.layer - 1) })}>-层</button>
                    <button type="button" className="mini-button" onClick={() => updateTrack(track.id, { layer: track.layer + 1 })}>+层</button>
                    <button type="button" className="mini-button" onClick={() => updateTrack(track.id, { locked: !track.locked })}>{track.locked ? "解锁" : "锁定"}</button>
                  </span>
                </article>
              );
            })}
          </div>
          <h2>场景调整</h2>
          <div className="table">
            {scenes.map((scene) => (
              <article className="row track-row" key={scene.id}>
                <strong>{scene.name}</strong>
                <span>优先级 {scene.priority} · {scene.scene_status}</span>
                <span className="button-group">
                  <button type="button" className="mini-button" onClick={() => updateScene(scene.id, { priority: scene.priority - 1 })}>-优</button>
                  <button type="button" className="mini-button" onClick={() => updateScene(scene.id, { priority: scene.priority + 1 })}>+优</button>
                  <button
                    type="button"
                    className="mini-button"
                    onClick={() => updateScene(scene.id, { scene_status: scene.scene_status === "DISABLED" ? "READY" : "DISABLED" })}
                  >
                    {scene.scene_status === "DISABLED" ? "启用" : "停用"}
                  </button>
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
