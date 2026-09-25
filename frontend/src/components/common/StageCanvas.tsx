import type { Fixture } from "../../types/Fixture";
import type { CompositeFixtureResult } from "../../types/CompositeResult";
import { FixtureIcon } from "./FixtureIcon";

interface StageCanvasProps {
  fixtures: Fixture[];
  results: CompositeFixtureResult[];
  selectedFixtureId: number | null;
  onSelectFixture: (id: number | null) => void;
}

/** 二维舞台预览：按合成结果给每盏灯上色，停用灯具灰显。 */
export function StageCanvas({ fixtures, results, selectedFixtureId, onSelectFixture }: StageCanvasProps) {
  const resultByFixture = new Map(results.map((result) => [result.fixtureId, result]));

  return (
    <div className="stage-canvas">
      <div className="stage-audience">观众席 ▼</div>
      <div className="stage-plane">
        {fixtures.map((fixture) => {
          const result = resultByFixture.get(fixture.id);
          return (
            <FixtureIcon
              key={fixture.id}
              fixture={fixture}
              color={result?.color}
              active={result?.active ?? false}
              selected={selectedFixtureId === fixture.id}
              winning={selectedFixtureId === fixture.id}
              onSelect={(id) => onSelectFixture(selectedFixtureId === id ? null : id)}
            />
          );
        })}
      </div>
    </div>
  );
}
