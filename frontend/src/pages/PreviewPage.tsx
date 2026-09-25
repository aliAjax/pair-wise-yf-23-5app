import { useEffect, useMemo, useRef, useState } from "react";
import { usePreviewStore } from "../stores/PreviewStore";
import { useTimelinePlayback } from "../hooks/useTimelinePlayback";
import { useIndexedDbStore } from "../hooks/useIndexedDbStore";
import { StageCanvas } from "../components/common/StageCanvas";
import { TimelineRuler } from "../components/common/TimelineRuler";
import { EmptyState } from "../components/common/EmptyState";
import { PlaybackControls } from "../components/preview/PlaybackControls";
import { TrackStrip } from "../components/preview/TrackStrip";
import { CompositeResultPanel } from "../components/preview/CompositeResultPanel";
import { AdjustmentPanel } from "../components/preview/AdjustmentPanel";
import { formatClock } from "../utils/clock";

export function PreviewPage() {
  const {
    ready,
    fixtures,
    scenes,
    tracks,
    results,
    durationMs,
    lastRecomputed,
    lastChange,
    snapshots,
    restoredFromStorage,
    init,
    seek,
    updateScene,
    updateTrack,
    updateFixture,
    saveSnapshot,
    loadSnapshot,
    removeSnapshot
  } = usePreviewStore();

  const [selectedFixtureId, setSelectedFixtureId] = useState<number | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  // 最近一次检查时刻也单独持久化，重新进入可继续检查。
  const { value: lastInspection, setValue: setLastInspection } = useIndexedDbStore<number>("last_inspection_ms", 0);

  useEffect(() => {
    void init();
  }, [init]);

  const playback = useTimelinePlayback(durationMs, (next) => {
    seek(next);
    setLastInspection(next);
  });

  // 进入页面恢复播放头后，同步播放 hook 的内部时钟。
  const playheadSyncedRef = useRef(false);
  useEffect(() => {
    if (ready && !playback.playing && !playheadSyncedRef.current) {
      playheadSyncedRef.current = true;
      playback.setTimeMs(usePreviewStore.getState().timeMs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const scenesById = useMemo(() => new Map(scenes.map((scene) => [scene.id, scene])), [scenes]);
  const selectedResult = results.find((result) => result.fixtureId === selectedFixtureId) ?? null;

  if (!ready) {
    return (
      <section className="preview-page">
        <EmptyState title="正在从浏览器读取灯具、场景与轨道…" />
      </section>
    );
  }

  const handleSeek = (timeMs: number) => {
    playback.pause();
    playback.setTimeMs(timeMs);
    setLastInspection(timeMs);
  };

  const handleSnapshot = () => {
    void saveSnapshot(`${formatClock(usePreviewStore.getState().timeMs)} 检查点`);
  };

  return (
    <section className="preview-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">stage-light · 舞台预览</p>
          <h1>按播放时刻合成灯具结果</h1>
          <p className="subtitle">
            普通轨道按图层从低到高覆盖；锁定轨道始终压住普通轨道；停用场景/灯具不参与；同刻开始高优先级后覆盖。
          </p>
        </div>
      </header>

      <PlaybackControls
        playing={playback.playing}
        timeMs={playback.timeMs}
        durationMs={durationMs}
        recomputedCount={lastRecomputed.length}
        restored={restoredFromStorage || lastInspection > 0}
        onToggle={playback.toggle}
        onReset={playback.reset}
        onSeek={handleSeek}
        onSaveSnapshot={handleSnapshot}
      />

      <div className="preview-grid">
        <div className="preview-main">
          <StageCanvas
            fixtures={fixtures}
            results={results}
            selectedFixtureId={selectedFixtureId}
            onSelectFixture={setSelectedFixtureId}
          />
          <div className="timeline-wrap">
            <TrackStrip
              tracks={tracks}
              scenesById={scenesById}
              durationMs={durationMs}
              timeMs={playback.timeMs}
              selectedTrackId={selectedTrackId}
              onSelectTrack={setSelectedTrackId}
            />
            <TimelineRuler durationMs={durationMs} timeMs={playback.timeMs} onSeek={handleSeek} />
          </div>
        </div>

        <aside className="preview-side">
          <CompositeResultPanel result={selectedResult} />
          <AdjustmentPanel
            fixtures={fixtures}
            scenes={scenes}
            tracks={tracks}
            selectedFixtureId={selectedFixtureId}
            selectedTrackId={selectedTrackId}
            onUpdateFixture={updateFixture}
            onUpdateScene={updateScene}
            onUpdateTrack={updateTrack}
            onSelectFixture={setSelectedFixtureId}
          />
        </aside>
      </div>

      <div className="recompute-bar">
        最近变更来源：<strong>{lastChange}</strong>　·　本次重算灯具：
        <strong>{lastRecomputed.length ? lastRecomputed.join(", ") : "—（沿用缓存结果）"}</strong>
      </div>

      <div className="snapshot-list">
        <h3>浏览器中的检查快照</h3>
        {snapshots.length === 0 ? (
          <EmptyState title="还没有快照，播放到疑问时刻后点「保存检查快照」。" />
        ) : (
          <ul>
            {snapshots.map((snapshot) => (
              <li key={snapshot.id}>
                <button type="button" onClick={() => { playback.pause(); loadSnapshot(snapshot.id!); }}>
                  {snapshot.label} · {new Date(snapshot.saved_at).toLocaleString("zh-CN")}
                </button>
                <button type="button" className="danger" onClick={() => void removeSnapshot(snapshot.id!)}>
                  删除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
