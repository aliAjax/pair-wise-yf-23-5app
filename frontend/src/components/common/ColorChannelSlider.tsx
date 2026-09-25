import type { FixtureColorState } from "../../types/FixtureColorState";
import { toRgbCss } from "../../utils/color";

interface ColorChannelSliderProps {
  label?: string;
  value: FixtureColorState;
  onChange?: (next: FixtureColorState) => void;
  readOnly?: boolean;
}

const CHANNELS: Array<{ key: keyof FixtureColorState; text: string }> = [
  { key: "red", text: "R" },
  { key: "green", text: "G" },
  { key: "blue", text: "B" },
  { key: "white", text: "W" },
  { key: "dimmer", text: "亮度" }
];

/** RGBW + 调光通道滑块，场景颜色编辑与结果查看共用。 */
export function ColorChannelSlider({ label = "颜色通道", value, onChange, readOnly = false }: ColorChannelSliderProps) {
  const setChannel = (key: keyof FixtureColorState, raw: number) => {
    onChange?.({ ...value, [key]: raw });
  };

  return (
    <div className="color-channels">
      <div className="color-channels-head">
        <span>{label}</span>
        <span className="swatch" style={{ background: toRgbCss(value) }} />
      </div>
      {CHANNELS.map(({ key, text }) => (
        <label key={key} className="channel-row">
          <span>{text}</span>
          <input
            type="range"
            min={0}
            max={255}
            value={value[key] ?? 0}
            disabled={readOnly}
            onChange={(event) => setChannel(key, Number(event.target.value))}
          />
          <strong>{value[key] ?? 0}</strong>
        </label>
      ))}
    </div>
  );
}
