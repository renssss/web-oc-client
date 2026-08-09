import { createOpencodeClient, type Event, type OpencodeClient } from "@opencode-ai/sdk/client";
import { EventStream, type StreamOptions } from "./events.ts";
import { createAppFacade, createFormatterFacade, createLspFacade, type AppFacade, type FormatterFacade, type LspFacade } from "./resources/app.ts";
import { createCommandFacade, createConfigFacade, createProviderFacade, createToolFacade, type CommandFacade, type ConfigFacade, type ProviderFacade, type ToolFacade } from "./resources/config.ts";
import { createEventFacade, type EventFacade, type EventSubscribeOptions } from "./resources/event.ts";
import { createAuthFacade, createMcpFacade, type AuthFacade, type McpFacade } from "./resources/mcp.ts";
import { createFileFacade, createFindFacade, createInstanceFacade, createPathFacade, createProjectFacade, createVcsFacade, type FileFacade, type FindFacade, type InstanceFacade, type PathFacade, type ProjectFacade, type VcsFacade } from "./resources/project.ts";
import { createPtyFacade, type PtyFacade } from "./resources/pty.ts";
import { createSessionFacade, type SessionFacade } from "./resources/session.ts";
import { createTuiFacade, type TuiFacade } from "./resources/tui.ts";

export const DEFAULT_BASE_URL = "http://localhost:54321";

export interface OpenCodeWebClientOptions {
  baseUrl?: string;
  directory?: string;
  fetch?: (request: Request) => Promise<Response>;
  sdk?: OpencodeClient;
}

export interface OpenCodeWebClient {
  readonly app: AppFacade;
  readonly auth: AuthFacade;
  readonly command: CommandFacade;
  readonly config: ConfigFacade;
  readonly event: EventFacade;
  readonly file: FileFacade;
  readonly find: FindFacade;
  readonly formatter: FormatterFacade;
  readonly instance: InstanceFacade;
  readonly lsp: LspFacade;
  readonly mcp: McpFacade;
  readonly path: PathFacade;
  readonly project: ProjectFacade;
  readonly provider: ProviderFacade;
  readonly pty: PtyFacade;
  readonly session: SessionFacade;
  readonly tool: ToolFacade;
  readonly tui: TuiFacade;
  readonly vcs: VcsFacade;
  readonly sdk: OpencodeClient;
  events(options?: EventSubscribeOptions, stream?: StreamOptions): Promise<EventStream<Event>>;
  subscribe(options?: EventSubscribeOptions, stream?: StreamOptions): Promise<EventStream<Event>>;
}

function envBaseUrl(): string | undefined {
  const globalProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  const value = globalProcess?.env?.OPENCODE_BASE_URL;
  return value !== undefined && value.length > 0 ? value : undefined;
}

export function resolveBaseUrl(options?: { baseUrl?: string }): string {
  return options?.baseUrl ?? envBaseUrl() ?? DEFAULT_BASE_URL;
}

export function createOpencodeWebClient(options: OpenCodeWebClientOptions = {}): OpenCodeWebClient {
  const sdk =
    options.sdk ??
    createOpencodeClient({
      baseUrl: resolveBaseUrl(options),
      directory: options.directory,
      fetch: options.fetch,
    });
  const event = createEventFacade(sdk);
  return {
    app: createAppFacade(sdk),
    auth: createAuthFacade(sdk),
    command: createCommandFacade(sdk),
    config: createConfigFacade(sdk),
    event,
    file: createFileFacade(sdk),
    find: createFindFacade(sdk),
    formatter: createFormatterFacade(sdk),
    instance: createInstanceFacade(sdk),
    lsp: createLspFacade(sdk),
    mcp: createMcpFacade(sdk),
    path: createPathFacade(sdk),
    project: createProjectFacade(sdk),
    provider: createProviderFacade(sdk),
    pty: createPtyFacade(sdk),
    session: createSessionFacade(sdk),
    tool: createToolFacade(sdk),
    tui: createTuiFacade(sdk),
    vcs: createVcsFacade(sdk),
    sdk,
    events: (eventOptions, streamOptions) => event.subscribe(eventOptions, streamOptions),
    subscribe: (eventOptions, streamOptions) => event.subscribe(eventOptions, streamOptions),
  };
}
