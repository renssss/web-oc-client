import type {
  CommandListData,
  CommandListResponse,
  ConfigGetData,
  ConfigGetResponse,
  ConfigProvidersData,
  ConfigProvidersResponse,
  ConfigUpdateData,
  ConfigUpdateResponse,
  OpencodeClient,
  ProviderAuthData,
  ProviderAuthResponse,
  ProviderListData,
  ProviderListResponse,
  ProviderOauthAuthorizeData,
  ProviderOauthAuthorizeResponse,
  ProviderOauthCallbackData,
  ProviderOauthCallbackResponse,
  ToolIdsData,
  ToolIdsResponse,
  ToolListData,
  ToolListResponse,
} from "@opencode-ai/sdk/client";
import { unwrap } from "../response.ts";

export interface ConfigFacade {
  get(options?: ConfigGetData["query"]): Promise<ConfigGetResponse>;
  update(body?: ConfigUpdateData["body"], options?: ConfigUpdateData["query"]): Promise<ConfigUpdateResponse>;
  providers(options?: ConfigProvidersData["query"]): Promise<ConfigProvidersResponse>;
}

export interface ToolFacade {
  ids(options?: ToolIdsData["query"]): Promise<ToolIdsResponse>;
  list(options: ToolListData["query"]): Promise<ToolListResponse>;
}

export interface ProviderOauthFacade {
  authorize(id: string, body?: ProviderOauthAuthorizeData["body"], options?: ProviderOauthAuthorizeData["query"]): Promise<ProviderOauthAuthorizeResponse>;
  callback(id: string, body?: ProviderOauthCallbackData["body"], options?: ProviderOauthCallbackData["query"]): Promise<ProviderOauthCallbackResponse>;
}

export interface ProviderFacade {
  list(options?: ProviderListData["query"]): Promise<ProviderListResponse>;
  auth(options?: ProviderAuthData["query"]): Promise<ProviderAuthResponse>;
  oauth: ProviderOauthFacade;
}

export interface CommandFacade {
  list(options?: CommandListData["query"]): Promise<CommandListResponse>;
}

export function createConfigFacade(sdk: OpencodeClient): ConfigFacade {
  return {
    get: (options) => unwrap<ConfigGetResponse>(sdk.config.get({ query: options })),
    update: (body, options) => unwrap<ConfigUpdateResponse>(sdk.config.update({ body, query: options })),
    providers: (options) => unwrap<ConfigProvidersResponse>(sdk.config.providers({ query: options })),
  };
}

export function createToolFacade(sdk: OpencodeClient): ToolFacade {
  return {
    ids: (options) => unwrap<ToolIdsResponse>(sdk.tool.ids({ query: options })),
    list: (options) => unwrap<ToolListResponse>(sdk.tool.list({ query: options })),
  };
}

export function createProviderFacade(sdk: OpencodeClient): ProviderFacade {
  return {
    list: (options) => unwrap<ProviderListResponse>(sdk.provider.list({ query: options })),
    auth: (options) => unwrap<ProviderAuthResponse>(sdk.provider.auth({ query: options })),
    oauth: {
      authorize: (id, body, options) =>
        unwrap<ProviderOauthAuthorizeResponse>(sdk.provider.oauth.authorize({ path: { id }, body, query: options })),
      callback: (id, body, options) =>
        unwrap<ProviderOauthCallbackResponse>(sdk.provider.oauth.callback({ path: { id }, body, query: options })),
    },
  };
}

export function createCommandFacade(sdk: OpencodeClient): CommandFacade {
  return {
    list: (options) => unwrap<CommandListResponse>(sdk.command.list({ query: options })),
  };
}
