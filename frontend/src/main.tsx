import { useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { FixturesPage } from "./pages/FixturesPage";
import { CuesPage } from "./pages/CuesPage";
import { TimelinePage } from "./pages/TimelinePage";
import { PreviewPage } from "./pages/PreviewPage";
import "./styles.css";

const PAGE_VIEWS: Record<string, () => ReactNode> = {
  "/fixtures": FixturesPage,
  "/cues": CuesPage,
  "/timeline": TimelinePage,
  "/preview": PreviewPage
};

function App() {
  const [active, setActive] = useState<string>("/preview");
  const current = routes.find((route) => route.route === active) ?? routes[0];
  const View = PAGE_VIEWS[active] ?? PreviewPage;

  return (
    <div className="shell">
      <aside>
        <div className="brand">舞台灯光编排模拟器</div>
        <nav>
          {routes.map((route) => (
            <button
              key={route.route}
              className={active === route.route ? "active" : ""}
              onClick={() => setActive(route.route)}
            >
              {route.name}
            </button>
          ))}
        </nav>
      </aside>
      <main className="content" key={current.route}>
        <View />
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
