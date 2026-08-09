import type {
  OpencodeClient,
  TuiAppendPromptData,
  TuiAppendPromptResponse,
  TuiClearPromptData,
  TuiClearPromptResponse,
  TuiControlNextData,
  TuiControlNextResponse,
  TuiControlResponseData,
  TuiControlResponseResponse,
  TuiExecuteCommandData,
  TuiExecuteCommandResponse,
  TuiOpenHelpData,
  TuiOpenHelpResponse,
  TuiOpenModelsData,
  TuiOpenModelsResponse,
  TuiOpenSessionsData,
  TuiOpenSessionsResponse,
  TuiOpenThemesData,
  TuiOpenThemesResponse,
  TuiPublishData,
  TuiPublishResponse,
  TuiShowToastData,
  TuiShowToastResponse,
  TuiSubmitPromptData,
  TuiSubmitPromptResponse,
} from "@opencode-ai/sdk/client";
import { unwrap } from "../response.ts";

export interface TuiControlFacade {
  next(options?: TuiControlNextData["query"]): Promise<TuiControlNextResponse>;
  response(body?: TuiControlResponseData["body"], options?: TuiControlResponseData["query"]): Promise<TuiControlResponseResponse>;
}

export interface TuiFacade {
  appendPrompt(body?: TuiAppendPromptData["body"], options?: TuiAppendPromptData["query"]): Promise<TuiAppendPromptResponse>;
  submitPrompt(options?: TuiSubmitPromptData["query"]): Promise<TuiSubmitPromptResponse>;
  clearPrompt(options?: TuiClearPromptData["query"]): Promise<TuiClearPromptResponse>;
  openHelp(options?: TuiOpenHelpData["query"]): Promise<TuiOpenHelpResponse>;
  openSessions(options?: TuiOpenSessionsData["query"]): Promise<TuiOpenSessionsResponse>;
  openThemes(options?: TuiOpenThemesData["query"]): Promise<TuiOpenThemesResponse>;
  openModels(options?: TuiOpenModelsData["query"]): Promise<TuiOpenModelsResponse>;
  executeCommand(body?: TuiExecuteCommandData["body"], options?: TuiExecuteCommandData["query"]): Promise<TuiExecuteCommandResponse>;
  showToast(body?: TuiShowToastData["body"], options?: TuiShowToastData["query"]): Promise<TuiShowToastResponse>;
  publish(body?: TuiPublishData["body"], options?: TuiPublishData["query"]): Promise<TuiPublishResponse>;
  control: TuiControlFacade;
}

export function createTuiFacade(sdk: OpencodeClient): TuiFacade {
  return {
    appendPrompt: (body, options) => unwrap<TuiAppendPromptResponse>(sdk.tui.appendPrompt({ body, query: options })),
    submitPrompt: (options) => unwrap<TuiSubmitPromptResponse>(sdk.tui.submitPrompt({ query: options })),
    clearPrompt: (options) => unwrap<TuiClearPromptResponse>(sdk.tui.clearPrompt({ query: options })),
    openHelp: (options) => unwrap<TuiOpenHelpResponse>(sdk.tui.openHelp({ query: options })),
    openSessions: (options) => unwrap<TuiOpenSessionsResponse>(sdk.tui.openSessions({ query: options })),
    openThemes: (options) => unwrap<TuiOpenThemesResponse>(sdk.tui.openThemes({ query: options })),
    openModels: (options) => unwrap<TuiOpenModelsResponse>(sdk.tui.openModels({ query: options })),
    executeCommand: (body, options) => unwrap<TuiExecuteCommandResponse>(sdk.tui.executeCommand({ body, query: options })),
    showToast: (body, options) => unwrap<TuiShowToastResponse>(sdk.tui.showToast({ body, query: options })),
    publish: (body, options) => unwrap<TuiPublishResponse>(sdk.tui.publish({ body, query: options })),
    control: {
      next: (options) => unwrap<TuiControlNextResponse>(sdk.tui.control.next({ query: options })),
      response: (body, options) => unwrap<TuiControlResponseResponse>(sdk.tui.control.response({ body, query: options })),
    },
  };
}
