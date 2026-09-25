import type { CueScene } from "../../types/CueScene";
import { StatusBadge } from "./StatusBadge";

interface CueCardProps {
  scene: CueScene;
  compact?: boolean;
  onClick?: () => void;
  selected?: boolean;
}

/** 场景卡片：状态、优先级、淡入时间。 */
export function CueCard({ scene, compact = false, onClick, selected = false }: CueCardProps) {
  return (
    <button
      type="button"
      className={"cue-card" + (selected ? " selected" : "")}
      onClick={onClick}
      title={scene.name}
    >
      <strong>{scene.name}</strong>
      <span className="cue-meta">
        优先级 {scene.priority} · 淡入 {scene.fade_in_ms}ms
        {compact ? "" : ` · 控制 ${Object.keys(scene.fixture_states).length} 灯`}
      </span>
      <StatusBadge value={scene.scene_status} />
    </button>
  );
}
