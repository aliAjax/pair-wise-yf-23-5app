import { EmptyState } from "../components/common/EmptyState";

export function TimelinePage() {
  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">stage-light · 时间轴编排</p>
          <h1>时间轴编排</h1>
        </div>
      </header>
      <EmptyState title="轨道图层、锁定与开始时刻可在「舞台预览」时间轴上点选轨道调整，合成即时重算。" />
    </section>
  );
}
