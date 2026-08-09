import type {
  AppAgentsData,
  AppAgentsResponse,
  AppLogData,
  AppLogResponse,
  FormatterStatusData,
  FormatterStatusResponse,
  LspStatusData,
  LspStatusResponse,
  OpencodeClient,
} from "@opencode-ai/sdk/client";
import { unwrap } from "../response.ts";

export interface AppFacade {
  log(body?: AppLogData["body"], options?: AppLogData["query"]): Promise<AppLogResponse>;
  agents(options?: AppAgentsData["query"]): Promise<AppAgentsResponse>;
}

export interface LspFacade {
  status(options?: LspStatusData["query"]): Promise<LspStatusResponse>;
}

export interface FormatterFacade {
  status(options?: FormatterStatusData["query"]): Promise<FormatterStatusResponse>;
}

export function createAppFacade(sdk: OpencodeClient): AppFacade {
  return {
    log: (body, options) => unwrap<AppLogResponse>(sdk.app.log({ body, query: options })),
    agents: (options) => unwrap<AppAgentsResponse>(sdk.app.agents({ query: options })),
  };
}

export function createLspFacade(sdk: OpencodeClient): LspFacade {
  return {
    status: (options) => unwrap<LspStatusResponse>(sdk.lsp.status({ query: options })),
  };
}

export function createFormatterFacade(sdk: OpencodeClient): FormatterFacade {
  return {
    status: (options) => unwrap<FormatterStatusResponse>(sdk.formatter.status({ query: options })),
  };
}
