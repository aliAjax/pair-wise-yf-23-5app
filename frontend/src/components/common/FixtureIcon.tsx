import type { FixtureType } from "../../types/FixtureType";

const TYPE_GLYPH: Record<FixtureType, string> = {
  PAR: "◉",
  SPOT: "◎",
  WASH: "◍",
  BEAM: "◈",
  STROBE: "✦"
};

/** 舞台上的一盏灯：颜色取自合成结果，亮度映射为发光强度，停用灯具置灰 */
export function FixtureIcon({
  fixtureType,
  label,
  color = "#000000",
  intensity = 0,
  enabled = true
}: {
  fixtureType: FixtureType;
  label: string;
  color?: string;
  intensity?: number;
  enabled?: boolean;
}) {
  const glow = enabled ? Math.max(0, Math.min(1, intensity / 100)) : 0;
  return (
    <span
      className={"fixture-icon" + (enabled ? "" : " disabled")}
      style={{
        background: enabled ? color : "#3a3f3a",
        boxShadow: glow > 0 ? `0 0 ${8 + glow * 26}px ${glow * 6}px ${color}` : "none",
        opacity: enabled ? 0.55 + glow * 0.45 : 0.5
      }}
      title={label}
    >
      <i>{TYPE_GLYPH[fixtureType] ?? "◉"}</i>
    </span>
  );
}
