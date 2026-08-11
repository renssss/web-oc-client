import { useCallback, useEffect, useRef, useState } from "react";
import type { Event, Part, Session } from "@opencode-ai/sdk/client";
import { client } from "../lib/api.ts";

type MessagesEntry = Awaited<ReturnType<typeof client.session.messages>>[number];

interface Thread {
  info?: MessagesEntry["info"];
  parts: Map<string, Part>;
}

function emptyThread(): Thread {
  return { parts: new Map() };
}

function partKey(part: Part): string {
  return part.id;
}

function PartView({ part }: { part: Part }): React.JSX.Element {
  switch (part.type) {
    case "text":
      return <div className="part part-text">{part.text}</div>;
    case "reasoning":
      return <div className="part part-reasoning">💭 {part.text}</div>;
    case "tool":
      return (
        <div className="part part-tool">
          <span className="part-tool-name">{part.tool}</span>
          {"title" in part.state && part.state.title !== undefined && (
            <span className="part-tool-title">{part.state.title}</span>
          )}
          {part.state.status === "pending" && <span className="badge">…</span>}
          {part.state.status === "running" && <span className="badge running">running</span>}
          {part.state.status === "completed" && <span className="badge done">done</span>}
          {part.state.status === "error" && <span className="badge error">error</span>}
        </div>
      );
    case "step-start":
      return <div className="part part-step">▸ step</div>;
    case "step-finish":
      return <div className="part part-step dim">▸ step finished ({part.reason})</div>;
    case "subtask":
      return <div className="part part-step dim">subtask: {part.description}</div>;
    case "agent":
      return <div className="part part-step dim">agent · {part.name}</div>;
    case "retry":
      return <div className="part part-step dim">retrying…</div>;
    case "compaction":
      return <div className="part part-step dim">context compacted</div>;
    default:
      return <div className="part part-step dim">{part.type}</div>;
  }
}

function MessageView({ thread }: { thread: Thread }): React.JSX.Element {
  const info = thread.info;
  const parts = Array.from(thread.parts.values());
  const isAssistant = info?.role === "assistant";

  return (
    <div className={`message ${isAssistant ? "assistant" : "user"}`}>
      <div className="message-meta">
        <span className="message-role">{isAssistant ? "assistant" : "you"}</span>
        {isAssistant && info !== undefined && (
          <span className="message-model">
            {info.providerID}/{info.modelID}
          </span>
        )}
        {isAssistant && info?.error !== undefined && (
          <span className="message-error">{messageOf(info.error)}</span>
        )}
      </div>
      <div className="message-parts">
        {parts.length === 0 && <div className="part part-step dim">…</div>}
        {parts.map((part) => (
          <PartView key={partKey(part)} part={part} />
        ))}
      </div>
    </div>
  );
}

function messageOf(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }
  if (error != null && typeof error === "object" && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (data != null && typeof data === "object" && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string") {
        return message;
      }
    }
  }
  return "session error";
}

function threadKey(thread: Thread): string {
  return thread.info?.id ?? Array.from(thread.parts.values())[0]?.messageID ?? "pending";
}

export function Chat(): React.JSX.Element {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Map<string, Thread>>(new Map());
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const threadsRef = useRef(threads);
  threadsRef.current = threads;
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;
  const busyRef = useRef(busy);
  busyRef.current = busy;
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshSessions = useCallback(async () => {
    const list = await client.session.list();
    list.sort((a, b) => b.time.created - a.time.created);
    setSessions(list);
  }, []);

  const loadThread = useCallback(async (id: string) => {
    const entries = await client.session.messages(id);
    const next = new Map<string, Thread>();
    for (const entry of entries) {
      next.set(entry.info.id, { info: entry.info, parts: new Map(entry.parts.map((p) => [partKey(p), p])) });
    }
    setThreads(next);
  }, []);

  const openSession = useCallback(
    async (id: string) => {
      setSelectedId(id);
      setError(null);
      await loadThread(id);
    },
    [loadThread],
  );

  const createSession = useCallback(async () => {
    try {
      const session = await client.session.create();
      await refreshSessions();
      await openSession(session.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [refreshSessions, openSession]);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (text.length === 0) {
      return;
    }
    setDraft("");
    let id = selectedRef.current;
    try {
      if (id === null) {
        const session = await client.session.create();
        id = session.id;
        setSelectedId(id);
        await refreshSessions();
      }
      setError(null);
      setBusy(true);
      await client.session.promptAsync(id, {
        parts: [{ type: "text", text }],
      });
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [draft, refreshSessions]);

  const abort = useCallback(async () => {
    const id = selectedRef.current;
    if (id === null) {
      return;
    }
    try {
      await client.session.abort(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void refreshSessions();
  }, [refreshSessions]);

  useEffect(() => {
    let disposed = false;
    let stream: Awaited<ReturnType<typeof client.events>> | undefined;
    const dispatch = async (event: Event) => {
      const properties = "properties" in event ? (event.properties as Record<string, unknown>) : undefined;
      const part =
        properties != null && typeof properties.part === "object" && properties.part !== null
          ? (properties.part as { sessionID?: unknown })
          : undefined;
      const sessionID =
        properties && typeof properties.sessionID === "string"
          ? properties.sessionID
          : part != null && typeof part.sessionID === "string"
            ? part.sessionID
            : "info" in event && event.info != null && typeof (event.info as { sessionID?: unknown }).sessionID === "string"
              ? ((event.info as { sessionID: string }).sessionID)
              : undefined;
      if (sessionID === undefined || sessionID !== selectedRef.current) {
        return;
      }
      switch (event.type) {
        case "message.part.updated": {
          const part = event.properties.part;
          const key = partKey(part);
          setThreads((prev) => {
            const next = new Map(prev);
            const thread = next.get(part.messageID) ?? emptyThread();
            const parts = new Map(thread.parts);
            parts.set(key, part);
            next.set(part.messageID, { info: thread.info, parts });
            return next;
          });
          break;
        }
        case "message.part.removed": {
          const { messageID, partID } = event.properties;
          setThreads((prev) => {
            const next = new Map(prev);
            const thread = next.get(messageID);
            if (thread === undefined) {
              return next;
            }
            const parts = new Map(thread.parts);
            parts.delete(partID);
            next.set(messageID, { info: thread.info, parts });
            return next;
          });
          break;
        }
        case "message.updated": {
          const info = event.properties.info;
          setThreads((prev) => {
            const next = new Map(prev);
            const thread = next.get(info.id) ?? emptyThread();
            next.set(info.id, { info, parts: thread.parts });
            return next;
          });
          break;
        }
        case "message.removed": {
          setThreads((prev) => {
            const next = new Map(prev);
            next.delete(event.properties.messageID);
            return next;
          });
          break;
        }
        case "session.status": {
          setBusy(event.properties.status.type !== "idle");
          break;
        }
        case "session.idle":
          setBusy(false);
          break;
        case "session.error":
          setError(messageOf(event.properties.error));
          setBusy(false);
          break;
        case "session.updated":
          void refreshSessions();
          break;
        default:
          break;
      }
    };

    const start = async () => {
      try {
        stream = await client.events();
        for await (const event of stream) {
          if (disposed) {
            break;
          }
          await dispatch(event);
        }
      } catch (err) {
        if (!disposed) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    };
    void start();

    return () => {
      disposed = true;
      stream?.abort();
    };
  }, [refreshSessions]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [threads]);

  const orderedThreads = Array.from(threads.values());

  return (
    <div className="chat-layout">
      <aside className="session-list">
        <button className="new-session" onClick={() => void createSession()}>
          + New session
        </button>
        <div className="session-items">
          {sessions.map((session) => (
            <button
              key={session.id}
              className={session.id === selectedId ? "session-item active" : "session-item"}
              onClick={() => void openSession(session.id)}
              title={session.title}
            >
              <span className="session-title">{session.title || "(untitled)"}</span>
              <span className="session-time">
                {new Date(session.time.created).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </aside>
      <section className="thread">
        {error !== null && <div className="banner error">{error}</div>}
        <div className="thread-scroll">
          {selectedId === null ? (
            <div className="empty">
              <p>No session selected.</p>
              <button onClick={() => void createSession()}>Start a conversation</button>
            </div>
          ) : (
            orderedThreads.map((thread) => <MessageView key={threadKey(thread)} thread={thread} />)
          )}
          <div ref={bottomRef} />
        </div>
        <div className="composer">
          {busy && (
            <button className="abort" onClick={() => void abort()}>
              ⏹ Stop
            </button>
          )}
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Message the agent…"
            rows={3}
            disabled={busy}
          />
          <button className="send" onClick={() => void send()} disabled={busy || draft.trim().length === 0}>
            Send
          </button>
        </div>
      </section>
    </div>
  );
}
