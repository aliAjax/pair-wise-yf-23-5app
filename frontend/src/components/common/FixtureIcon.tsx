import type { Fixture } from "../../types/Fixture";
import { toRgbCss, perceivedLuminance } from "../../utils/color";
import type { FixtureColorState } from "../../types/FixtureColorState";

interface FixtureIconProps {
  fixture: Fixture;
  color?: FixtureColorState;
  active?: boolean;
  selected?: boolean;
  winning?: boolean;
  onSelect?: (id: number) => void;
}

const TYPE_GLYPH: Record<string, string> = {
  PAR: "●",
  SPOT: "◆",
  WASH: "■",
  BEAM: "▲",
  STROBE: "✦"
};

/** 舞台平面图上的灯具：按合成颜色发光，停用灯具灰显。 */
export function FixtureIcon({ fixture, color, active = true, selected = false, winning = false, onSelect }: FixtureIconProps) {
  const fill = color ? toRgbCss(color) : "#111";
  const lit = color ? color.dimmer > 0 : false;
  const dark = color ? perceivedLuminance(color) < 0.55 : true;
  const glyph = TYPE_GLYPH[fixture.fixture_type] ?? "●";

  return (
    <button
      type="button"
      className={"fixture" + (selected ? " selected" : "") + (winning ? " winning" : "") + (active ? "" : " disabled-fixture")}
      style={{
        left: `${fixture.position_x}%`,
        top: `${fixture.position_y}%`,
        background: active ? fill : "#2a2a2a",
        color: dark ? "#f5f5f5" : "#151515",
        boxShadow: active && lit ? `0 0 18px 4px ${fill}` : "none"
      }}
      onClick={() => onSelect?.(fixture.id)}
      title={`${fixture.fixture_code} · ${fixture.fixture_type}${active ? "" : "（停用）"}`}
    >
      <span className="fixture-glyph">{glyph}</span>
      <span className="fixture-code">{fixture.fixture_code}</span>
    </button>
  );
}
