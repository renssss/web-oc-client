import { useState } from "react";
import { baseUrl } from "./lib/api.ts";
import { Chat } from "./components/Chat.tsx";
import { Dashboard } from "./components/Dashboard.tsx";

type View = "chat" | "dashboard";

export function App(): React.JSX.Element {
  const [view, setView] = useState<View>("chat");

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <span className="app-logo">◈</span>
          <div>
            <h1>opencode web client</h1>
            <span className="app-subtitle">web-oc-client · {baseUrl}</span>
          </div>
        </div>
        <nav className="tabs">
          <button
            className={view === "chat" ? "tab active" : "tab"}
            onClick={() => setView("chat")}
          >
            Chat
          </button>
          <button
            className={view === "dashboard" ? "tab active" : "tab"}
            onClick={() => setView("dashboard")}
          >
            Dashboard
          </button>
        </nav>
      </header>
      <main className="app-main">
        {view === "chat" ? <Chat /> : <Dashboard />}
      </main>
    </div>
  );
}
