import { useEffect, useState } from "react";
import type { Event } from "@opencode-ai/sdk/client";
import { baseUrl, client } from "../lib/api.ts";

type Config = Awaited<ReturnType<typeof client.config.get>>;
type Project = Awaited<ReturnType<typeof client.project.list>>[number];
type SessionInfo = Awaited<ReturnType<typeof client.session.list>>[number];
type FeedEvent = { id: number; type: string; sessionID?: string; at: Date };

interface DashboardData {
  projects: Project[];
  sessions: SessionInfo[];
  config?: Config;
  configError?: string;
  providers?: string[];
  tools?: string[];
  agents?: string[];
  mcpError?: string;
  ptyCount?: number;
}

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }): React.JSX.Element {
  return (
    <section className={`card ${className ?? ""}`}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export function Dashboard(): React.JSX.Element {
  const [data, setData] = useState<DashboardData>({ projects: [], sessions: [] });
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let disposed = false;
    const load = async () => {
      const [projectsRes, sessionsRes, configRes, providersRes, toolsRes, agentsRes, mcpRes, ptyRes] =
        await Promise.allSettled([
          client.project.list(),
          client.session.list(),
          client.config.get(),
          client.provider.list(),
          client.tool.ids(),
          client.app.agents(),
          client.mcp.status(),
          client.pty.list(),
        ]);
      if (disposed) {
        return;
      }
      const reason = (r: PromiseRejectedResult): string =>
        r.reason instanceof Error ? r.reason.message : String(r.reason);
      const fulfilled = <T,>(r: PromiseSettledResult<T>): T | undefined =>
        r.status === "fulfilled" ? r.value : undefined;
      setData({
        projects: fulfilled(projectsRes) ?? [],
        sessions: fulfilled(sessionsRes) ?? [],
        config: fulfilled(configRes),
        configError: configRes.status === "rejected" ? reason(configRes) : undefined,
        providers: fulfilled(providersRes)?.all.map((p) => p.name),
        tools: fulfilled(toolsRes) ?? [],
        agents: (fulfilled(agentsRes) ?? []).map((a) =>
          typeof a === "string" ? a : (a as { name?: string }).name ?? JSON.stringify(a),
        ),
        ptyCount: fulfilled(ptyRes)?.length,
        mcpError: mcpRes.status === "rejected" ? reason(mcpRes) : undefined,
      });
    };
    void load();

    let stream: Awaited<ReturnType<typeof client.events>> | undefined;
    let nextId = 0;
    const start = async () => {
      try {
        stream = await client.events();
        setConnected(true);
        for await (const event of stream) {
          if (disposed) {
            break;
          }
          const properties = "properties" in event ? (event.properties as Record<string, unknown>) : undefined;
          const sessionID =
            properties && typeof properties.sessionID === "string" ? properties.sessionID : undefined;
          setFeed((prev) => {
            const next = [...prev, { id: nextId++, type: (event as Event).type, sessionID, at: new Date() }];
            return next.slice(-100);
          });
        }
      } catch {
        setConnected(false);
      }
    };
    void start();

    return () => {
      disposed = true;
      stream?.abort();
    };
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <Card title="Server">
          <dl className="kv">
            <dt>baseUrl</dt>
            <dd>{baseUrl}</dd>
            <dt>events</dt>
            <dd>
              <span className={`dot ${connected ? "online" : "offline"}`} />
              {connected ? "connected" : "disconnected"}
            </dd>
          </dl>
        </Card>
        <Card title="Projects">
          {data.projects.length === 0 && <p className="muted">no projects</p>}
          <ul className="plain">
            {data.projects.map((p) => (
              <li key={p.id} className="mono" title={p.worktree}>
                {p.worktree}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Sessions">
          {data.sessions.length === 0 && <p className="muted">no sessions</p>}
          <ul className="plain">
            {data.sessions.slice(0, 10).map((s) => (
              <li key={s.id}>
                <span className="session-title">{s.title || "(untitled)"}</span>
                <span className="session-time">{new Date(s.time.created).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Capabilities">
          <dl className="kv">
            <dt>providers</dt>
            <dd className="mono">{data.providers?.join(", ") || "—"}</dd>
            <dt>tools</dt>
            <dd className="mono">{data.tools?.length ?? 0}</dd>
            <dt>agents</dt>
            <dd className="mono">{data.agents?.join(", ") || "—"}</dd>
            <dt>pty</dt>
            <dd className="mono">{data.ptyCount ?? "—"}</dd>
            <dt>mcp</dt>
            <dd className="mono">{data.mcpError ?? "ok"}</dd>
          </dl>
        </Card>
        <Card title="Config" className="wide">
          {data.config === undefined ? (
            <p className="muted">{data.configError ?? "loading…"}</p>
          ) : (
            <details>
              <summary>raw config</summary>
              <pre className="code">{JSON.stringify(data.config, null, 2)}</pre>
            </details>
          )}
        </Card>
        <Card title="Live events" className="wide">
          {feed.length === 0 ? (
            <p className="muted">waiting for events…</p>
          ) : (
            <ul className="event-feed">
              {feed.slice(-30).reverse().map((e) => (
                <li key={e.id}>
                  <span className="mono type">{e.type}</span>
                  {e.sessionID !== undefined && <span className="session-time mono">{e.sessionID}</span>}
                  <span className="session-time">{e.at.toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
