import { EmptyState } from "../components/common/EmptyState";

export function CuesPage() {
  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">stage-light · 场景编辑</p>
          <h1>场景编辑</h1>
        </div>
      </header>
      <EmptyState title="场景颜色、优先级、淡入与停用状态可在「舞台预览」右侧面板实时调整验证。" />
    </section>
  );
}
