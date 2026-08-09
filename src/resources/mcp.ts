import type {
  AuthSetData,
  AuthSetResponse,
  McpAddData,
  McpAddResponse,
  McpAuthAuthenticateData,
  McpAuthAuthenticateResponse,
  McpAuthCallbackData,
  McpAuthCallbackResponse,
  McpAuthRemoveData,
  McpAuthRemoveResponse,
  McpAuthStartData,
  McpAuthStartResponse,
  McpConnectData,
  McpConnectResponse,
  McpDisconnectData,
  McpDisconnectResponse,
  McpStatusData,
  McpStatusResponse,
  OpencodeClient,
} from "@opencode-ai/sdk/client";
import { unwrap } from "../response.ts";

export interface AuthFacade {
  remove(name: string, options?: McpAuthRemoveData["query"]): Promise<McpAuthRemoveResponse>;
  start(name: string, options?: McpAuthStartData["query"]): Promise<McpAuthStartResponse>;
  callback(name: string, body?: McpAuthCallbackData["body"], options?: McpAuthCallbackData["query"]): Promise<McpAuthCallbackResponse>;
  authenticate(name: string, options?: McpAuthAuthenticateData["query"]): Promise<McpAuthAuthenticateResponse>;
  set(id: string, body?: AuthSetData["body"], options?: AuthSetData["query"]): Promise<AuthSetResponse>;
}

export interface McpFacade {
  status(options?: McpStatusData["query"]): Promise<McpStatusResponse>;
  add(body?: McpAddData["body"], options?: McpAddData["query"]): Promise<McpAddResponse>;
  connect(name: string, options?: McpConnectData["query"]): Promise<McpConnectResponse>;
  disconnect(name: string, options?: McpDisconnectData["query"]): Promise<McpDisconnectResponse>;
  auth: AuthFacade;
}

export function createAuthFacade(sdk: OpencodeClient): AuthFacade {
  return {
    remove: (name, options) => unwrap<McpAuthRemoveResponse>(sdk.auth.remove({ path: { name }, query: options })),
    start: (name, options) => unwrap<McpAuthStartResponse>(sdk.auth.start({ path: { name }, query: options })),
    callback: (name, body, options) => unwrap<McpAuthCallbackResponse>(sdk.auth.callback({ path: { name }, body, query: options })),
    authenticate: (name, options) => unwrap<McpAuthAuthenticateResponse>(sdk.auth.authenticate({ path: { name }, query: options })),
    set: (id, body, options) => unwrap<AuthSetResponse>(sdk.auth.set({ path: { id }, body, query: options })),
  };
}

export function createMcpFacade(sdk: OpencodeClient): McpFacade {
  return {
    status: (options) => unwrap<McpStatusResponse>(sdk.mcp.status({ query: options })),
    add: (body, options) => unwrap<McpAddResponse>(sdk.mcp.add({ body, query: options })),
    connect: (name, options) => unwrap<McpConnectResponse>(sdk.mcp.connect({ path: { name }, query: options })),
    disconnect: (name, options) => unwrap<McpDisconnectResponse>(sdk.mcp.disconnect({ path: { name }, query: options })),
    auth: createAuthFacade(sdk),
  };
}
