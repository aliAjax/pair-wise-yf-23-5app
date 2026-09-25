import type { CueScene } from "../../types/CueScene";
import type { TimelineTrack } from "../../types/TimelineTrack";
import type { Fixture } from "../../types/Fixture";
import { CueStatus } from "../../constants/CueStatus";
import { ColorChannelSlider } from "../common/ColorChannelSlider";

interface AdjustmentPanelProps {
  fixtures: Fixture[];
  scenes: CueScene[];
  tracks: TimelineTrack[];
  selectedFixtureId: number | null;
  selectedTrackId: number | null;
  onUpdateFixture: (fixture: Fixture) => void;
  onUpdateScene: (scene: CueScene) => void;
  onUpdateTrack: (track: TimelineTrack) => void;
  onSelectFixture: (id: number) => void;
}

const numberInput = (value: number, onChange: (next: number) => void, extra: Partial<React.InputHTMLAttributes<HTMLInputElement>> = {}) => (
  <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} {...extra} />
);

/** 场景/轨道/灯具调整入口；任何调整都只触发受影响灯具的增量重算。 */
export function AdjustmentPanel({
  fixtures,
  scenes,
  tracks,
  selectedFixtureId,
  selectedTrackId,
  onUpdateFixture,
  onUpdateScene,
  onUpdateTrack,
  onSelectFixture
}: AdjustmentPanelProps) {
  const fixture = fixtures.find((item) => item.id === selectedFixtureId) ?? null;
  const track = tracks.find((item) => item.id === selectedTrackId) ?? null;
  const scene = track ? scenes.find((item) => item.id === track.cue_scene_id) ?? null : null;
  const controlledFixtureIds = scene ? Object.keys(scene.fixture_states).map(Number) : [];
  const editableFixtureId =
    scene && controlledFixtureIds.includes(selectedFixtureId ?? -1)
      ? selectedFixtureId!
      : controlledFixtureIds[0] ?? null;
  const editableColor = editableFixtureId !== null ? scene?.fixture_states[editableFixtureId] : undefined;

  return (
    <div className="adjustment-panel">
      <h3>调整（仅重算受影响的灯）</h3>

      {fixture ? (
        <section className="adjust-block">
          <h4>灯具 {fixture.fixture_code}</h4>
          <label className="inline">
            <input
              type="checkbox"
              checked={fixture.fixture_status === "ENABLED"}
              onChange={(event) => onUpdateFixture({ ...fixture, fixture_status: event.target.checked ? "ENABLED" : "DISABLED" })}
            />
            参与合成（取消=停用灯具）
          </label>
          {fixture.fixture_status === "ENABLED" && scene && fixture.id in scene.fixture_states ? (
            <ColorChannelSlider
              label="预览目标色（改场景保存生效）"
              value={scene.fixture_states[fixture.id]}
              readOnly
            />
          ) : null}
        </section>
      ) : (
        <p className="muted-text">在舞台点选灯具可停用/启用。</p>
      )}

      {track && scene ? (
        <>
          <section className="adjust-block">
            <h4>轨道 #{track.id} · {scene.name}</h4>
            <label className="grid-row">
              <span>图层 layer</span>
              {numberInput(track.layer, (layer) => onUpdateTrack({ ...track, layer }), { min: 0 })}
            </label>
            <label className="grid-row">
              <span>开始 ms</span>
              {numberInput(track.start_ms, (start_ms) => onUpdateTrack({ ...track, start_ms }), { min: 0, step: 100 })}
            </label>
            <label className="grid-row">
              <span>时长 ms</span>
              {numberInput(track.duration_ms, (duration_ms) => onUpdateTrack({ ...track, duration_ms }), { min: 100, step: 100 })}
            </label>
            <label className="inline">
              <input type="checkbox" checked={track.locked} onChange={(event) => onUpdateTrack({ ...track, locked: event.target.checked })} />
              锁定轨道（始终压住普通轨道）
            </label>
          </section>

          <section className="adjust-block">
            <h4>场景 · {scene.name}</h4>
            <label className="grid-row">
              <span>优先级</span>
              {numberInput(scene.priority, (priority) => onUpdateScene({ ...scene, priority }))}
            </label>
            <label className="grid-row">
              <span>淡入 ms</span>
              {numberInput(scene.fade_in_ms, (fade_in_ms) => onUpdateScene({ ...scene, fade_in_ms }), { min: 0, step: 100 })}
            </label>
            <label className="grid-row">
              <span>状态</span>
              <select
                value={scene.scene_status}
                onChange={(event) => onUpdateScene({ ...scene, scene_status: event.target.value })}
              >
                {CueStatus.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="inline">
              <input
                type="checkbox"
                checked={scene.scene_status !== "DISABLED"}
                onChange={(event) => onUpdateScene({ ...scene, scene_status: event.target.checked ? "READY" : "DISABLED" })}
              />
              场景启用（取消=停用场景，不参与合成）
            </label>
            {scene && editableFixtureId !== null && editableColor ? (
              <>
                <label className="grid-row">
                  <span>编辑灯具</span>
                  <select
                    value={editableFixtureId}
                    onChange={(event) => onSelectFixture(Number(event.target.value))}
                  >
                    {controlledFixtureIds.map((id) => (
                      <option key={id} value={id}>
                        {fixtures.find((item) => item.id === id)?.fixture_code ?? `#${id}`}
                      </option>
                    ))}
                  </select>
                </label>
                <ColorChannelSlider
                  label={`在「${scene.name}」中的目标色`}
                  value={editableColor}
                  onChange={(next) =>
                    onUpdateScene({
                      ...scene,
                      fixture_states: { ...scene.fixture_states, [editableFixtureId]: next }
                    })
                  }
                />
              </>
            ) : (
              <p className="muted-text">该场景未控制任何灯具。</p>
            )}
          </section>
        </>
      ) : (
        <p className="muted-text">在下方时间轴点选轨道，可调整图层、锁定、开始时刻与场景优先级。</p>
      )}
    </div>
  );
}
