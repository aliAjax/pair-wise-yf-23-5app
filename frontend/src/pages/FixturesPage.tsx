import { EmptyState } from "../components/common/EmptyState";

export function FixturesPage() {
  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">stage-light · 灯具布置</p>
          <h1>灯具布置</h1>
        </div>
      </header>
      <EmptyState title="灯具的停用/启用、位置与 DMX 通道可在「舞台预览」中联动检查；布置编辑页待接入。" />
    </section>
  );
}
