import { useState } from "react";
import type { ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { FixturesPage } from "./pages/FixturesPage";
import { CuesPage } from "./pages/CuesPage";
import { TimelinePage } from "./pages/TimelinePage";
import { PreviewPage } from "./pages/PreviewPage";
import "./styles.css";

const pageMap: Record<string, ComponentType> = {
  "/fixtures": FixturesPage,
  "/cues": CuesPage,
  "/timeline": TimelinePage,
  "/preview": PreviewPage
};

function App() {
  const [active, setActive] = useState<string>("/preview");
  const Current = pageMap[active] ?? PreviewPage;
  return <div className="shell">
    <aside>
      <div className="brand">舞台灯光编排模拟器</div>
      <nav>{routes.map((route) => <button key={route.route} className={active === route.route ? "active" : ""} onClick={() => setActive(route.route)}>{route.name}</button>)}</nav>
    </aside>
    <Current />
  </div>;
}

createRoot(document.getElementById("root")!).render(<App />);
