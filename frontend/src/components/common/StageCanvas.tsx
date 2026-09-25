import type { Fixture } from "../../types/Fixture";
import type { FixtureComposeResult } from "../../types/Composition";
import { DARK_STATE } from "../../utils/color";
import { FixtureIcon } from "./FixtureIcon";

/** 二维舞台：按灯具平面坐标摆放，颜色/亮度来自当前播放时刻的合成结果 */
export function StageCanvas({
  fixtures,
  results
}: {
  fixtures: Fixture[];
  results: Record<number, FixtureComposeResult>;
}) {
  return (
    <div className="stage-canvas">
      {fixtures.map((fixture) => {
        const result = results[fixture.id];
        const state = fixture.enabled ? result?.state ?? DARK_STATE : DARK_STATE;
        const label = `${fixture.fixture_code} · 亮度 ${Math.round(state.intensity)}%`;
        return (
          <div
            key={fixture.id}
            className="stage-fixture"
            style={{ left: `${fixture.position_x}%`, top: `${fixture.position_y}%` }}
          >
            <FixtureIcon
              fixtureType={fixture.fixture_type}
              label={label}
              color={state.color}
              intensity={state.intensity}
              enabled={fixture.enabled}
            />
            <span className="stage-fixture-code">{fixture.fixture_code}</span>
          </div>
        );
      })}
    </div>
  );
}
