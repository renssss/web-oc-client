import type {
  OpencodeClient,
  PostSessionIdPermissionsPermissionIdData,
  PostSessionIdPermissionsPermissionIdResponse,
  SessionAbortData,
  SessionAbortResponse,
  SessionChildrenData,
  SessionChildrenResponse,
  SessionCommandData,
  SessionCommandResponse,
  SessionCreateData,
  SessionCreateResponse,
  SessionDeleteData,
  SessionDeleteResponse,
  SessionDiffData,
  SessionDiffResponse,
  SessionForkData,
  SessionForkResponse,
  SessionGetData,
  SessionGetResponse,
  SessionInitData,
  SessionInitResponse,
  SessionListData,
  SessionListResponse,
  SessionMessageData,
  SessionMessageResponse,
  SessionMessagesData,
  SessionMessagesResponse,
  SessionPromptAsyncData,
  SessionPromptAsyncResponse,
  SessionPromptData,
  SessionPromptResponse,
  SessionRevertData,
  SessionRevertResponse,
  SessionShareData,
  SessionShareResponse,
  SessionShellData,
  SessionShellResponse,
  SessionStatusData,
  SessionStatusResponse,
  SessionSummarizeData,
  SessionSummarizeResponse,
  SessionTodoData,
  SessionTodoResponse,
  SessionUnrevertData,
  SessionUnrevertResponse,
  SessionUpdateData,
  SessionUpdateResponse,
  SessionUnshareData,
  SessionUnshareResponse,
} from "@opencode-ai/sdk/client";
import { unwrap } from "../response.ts";

export interface SessionFacade {
  list(options?: SessionListData["query"]): Promise<SessionListResponse>;
  create(body?: SessionCreateData["body"], options?: SessionCreateData["query"]): Promise<SessionCreateResponse>;
  status(options?: SessionStatusData["query"]): Promise<SessionStatusResponse>;
  get(id: string, options?: SessionGetData["query"]): Promise<SessionGetResponse>;
  update(id: string, body?: SessionUpdateData["body"], options?: SessionUpdateData["query"]): Promise<SessionUpdateResponse>;
  delete(id: string, options?: SessionDeleteData["query"]): Promise<SessionDeleteResponse>;
  children(id: string, options?: SessionChildrenData["query"]): Promise<SessionChildrenResponse>;
  todo(id: string, options?: SessionTodoData["query"]): Promise<SessionTodoResponse>;
  init(id: string, body: SessionInitData["body"], options?: SessionInitData["query"]): Promise<SessionInitResponse>;
  fork(id: string, body?: SessionForkData["body"], options?: SessionForkData["query"]): Promise<SessionForkResponse>;
  abort(id: string, options?: SessionAbortData["query"]): Promise<SessionAbortResponse>;
  share(id: string, options?: SessionShareData["query"]): Promise<SessionShareResponse>;
  unshare(id: string, options?: SessionUnshareData["query"]): Promise<SessionUnshareResponse>;
  diff(id: string, options?: SessionDiffData["query"]): Promise<SessionDiffResponse>;
  summarize(id: string, body: SessionSummarizeData["body"], options?: SessionSummarizeData["query"]): Promise<SessionSummarizeResponse>;
  messages(id: string, options?: SessionMessagesData["query"]): Promise<SessionMessagesResponse>;
  message(id: string, messageID: string, options?: SessionMessageData["query"]): Promise<SessionMessageResponse>;
  prompt(id: string, body: SessionPromptData["body"], options?: SessionPromptData["query"]): Promise<SessionPromptResponse>;
  promptAsync(id: string, body: SessionPromptAsyncData["body"], options?: SessionPromptAsyncData["query"]): Promise<SessionPromptAsyncResponse>;
  command(id: string, body: SessionCommandData["body"], options?: SessionCommandData["query"]): Promise<SessionCommandResponse>;
  shell(id: string, body: SessionShellData["body"], options?: SessionShellData["query"]): Promise<SessionShellResponse>;
  revert(id: string, body: SessionRevertData["body"], options?: SessionRevertData["query"]): Promise<SessionRevertResponse>;
  unrevert(id: string, options?: SessionUnrevertData["query"]): Promise<SessionUnrevertResponse>;
  permission(
    id: string,
    permissionID: string,
    response: NonNullable<PostSessionIdPermissionsPermissionIdData["body"]>["response"],
    options?: PostSessionIdPermissionsPermissionIdData["query"],
  ): Promise<PostSessionIdPermissionsPermissionIdResponse>;
}

export function createSessionFacade(sdk: OpencodeClient): SessionFacade {
  return {
    list: (options) => unwrap<SessionListResponse>(sdk.session.list({ query: options })),
    create: (body, options) => unwrap<SessionCreateResponse>(sdk.session.create({ body, query: options })),
    status: (options) => unwrap<SessionStatusResponse>(sdk.session.status({ query: options })),
    get: (id, options) => unwrap<SessionGetResponse>(sdk.session.get({ path: { id }, query: options })),
    update: (id, body, options) => unwrap<SessionUpdateResponse>(sdk.session.update({ path: { id }, body, query: options })),
    delete: (id, options) => unwrap<SessionDeleteResponse>(sdk.session.delete({ path: { id }, query: options })),
    children: (id, options) => unwrap<SessionChildrenResponse>(sdk.session.children({ path: { id }, query: options })),
    todo: (id, options) => unwrap<SessionTodoResponse>(sdk.session.todo({ path: { id }, query: options })),
    init: (id, body, options) => unwrap<SessionInitResponse>(sdk.session.init({ path: { id }, body, query: options })),
    fork: (id, body, options) => unwrap<SessionForkResponse>(sdk.session.fork({ path: { id }, body, query: options })),
    abort: (id, options) => unwrap<SessionAbortResponse>(sdk.session.abort({ path: { id }, query: options })),
    share: (id, options) => unwrap<SessionShareResponse>(sdk.session.share({ path: { id }, query: options })),
    unshare: (id, options) => unwrap<SessionUnshareResponse>(sdk.session.unshare({ path: { id }, query: options })),
    diff: (id, options) => unwrap<SessionDiffResponse>(sdk.session.diff({ path: { id }, query: options })),
    summarize: (id, body, options) => unwrap<SessionSummarizeResponse>(sdk.session.summarize({ path: { id }, body, query: options })),
    messages: (id, options) => unwrap<SessionMessagesResponse>(sdk.session.messages({ path: { id }, query: options })),
    message: (id, messageID, options) => unwrap<SessionMessageResponse>(sdk.session.message({ path: { id, messageID }, query: options })),
    prompt: (id, body, options) => unwrap<SessionPromptResponse>(sdk.session.prompt({ path: { id }, body, query: options })),
    promptAsync: (id, body, options) => unwrap<SessionPromptAsyncResponse>(sdk.session.promptAsync({ path: { id }, body, query: options })),
    command: (id, body, options) => unwrap<SessionCommandResponse>(sdk.session.command({ path: { id }, body, query: options })),
    shell: (id, body, options) => unwrap<SessionShellResponse>(sdk.session.shell({ path: { id }, body, query: options })),
    revert: (id, body, options) => unwrap<SessionRevertResponse>(sdk.session.revert({ path: { id }, body, query: options })),
    unrevert: (id, options) => unwrap<SessionUnrevertResponse>(sdk.session.unrevert({ path: { id }, query: options })),
    permission: (id, permissionID, response, options) =>
      unwrap<PostSessionIdPermissionsPermissionIdResponse>(
        sdk.postSessionIdPermissionsPermissionId({ path: { id, permissionID }, body: { response }, query: options }),
      ),
  };
}
