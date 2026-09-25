import type { CompositeFixtureResult } from "../../types/CompositeResult";
import type { FixtureColorState } from "../../types/FixtureColorState";
import { toRgbCss } from "../../utils/color";

interface CompositeResultPanelProps {
  result: CompositeFixtureResult | null;
}

const describeColor = (color: FixtureColorState): string =>
  `R${color.red} G${color.green} B${color.blue}${color.white ? ` W${color.white}` : ""} · 亮度${color.dimmer}`;

/** 单灯合成结果：最终颜色 + 覆盖链路（从先到后，末尾为生效者）。 */
export function CompositeResultPanel({ result }: CompositeResultPanelProps) {
  if (!result) return <p className="muted-text">在舞台上点选一盏灯，查看它在当前播放时刻的覆盖链路。</p>;

  if (!result.active) {
    return (
      <div className="result-panel">
        <h3>灯具已停用</h3>
        <p className="muted-text">停用灯具不参与任何场景合成，始终黑场。</p>
        <div className="final-color"><span className="swatch dark" />黑场（不参与）</div>
      </div>
    );
  }

  return (
    <div className="result-panel">
      <h3>覆盖链路</h3>
      <p className="muted-text">从低到高依次覆盖，末尾为最终生效场景。</p>
      {result.contributors.length === 0 ? (
        <div className="final-color"><span className="swatch dark" />黑场（当前时刻无命中场景）</div>
      ) : (
        <ol className="contributor-list">
          {result.contributors.map((contributor, index) => {
            const last = index === result.contributors.length - 1;
            return (
              <li key={`${contributor.trackId}-${index}`} className={last ? "winner" : ""}>
                <span className="swatch" style={{ background: toRgbCss(contributor.color) }} />
                <div>
                  <strong>
                    {contributor.sceneName}
                    {last ? " ✅ 生效" : ""}
                  </strong>
                  <small>
                    轨道{contributor.trackId} · {contributor.locked ? "🔒锁定" : `图层${contributor.layer}`} · 优先级
                    {contributor.priority} · 淡入{Math.round(contributor.fade * 100)}%
                  </small>
                  <small className="color-values">{describeColor(contributor.color)}</small>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <div className="final-color">
        <span className="swatch" style={{ background: toRgbCss(result.color) }} />
        最终：{describeColor(result.color)}
      </div>
    </div>
  );
}
