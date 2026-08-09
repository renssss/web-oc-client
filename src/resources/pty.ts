import type {
  OpencodeClient,
  PtyConnectData,
  PtyConnectResponse,
  PtyCreateData,
  PtyCreateResponse,
  PtyGetData,
  PtyGetResponse,
  PtyListData,
  PtyListResponse,
  PtyRemoveData,
  PtyRemoveResponse,
  PtyUpdateData,
  PtyUpdateResponse,
} from "@opencode-ai/sdk/client";
import { unwrap } from "../response.ts";

export interface PtyFacade {
  list(options?: PtyListData["query"]): Promise<PtyListResponse>;
  create(body?: PtyCreateData["body"], options?: PtyCreateData["query"]): Promise<PtyCreateResponse>;
  remove(id: string, options?: PtyRemoveData["query"]): Promise<PtyRemoveResponse>;
  get(id: string, options?: PtyGetData["query"]): Promise<PtyGetResponse>;
  update(id: string, body?: PtyUpdateData["body"], options?: PtyUpdateData["query"]): Promise<PtyUpdateResponse>;
  connect(id: string, options?: PtyConnectData["query"]): Promise<PtyConnectResponse>;
}

export function createPtyFacade(sdk: OpencodeClient): PtyFacade {
  return {
    list: (options) => unwrap<PtyListResponse>(sdk.pty.list({ query: options })),
    create: (body, options) => unwrap<PtyCreateResponse>(sdk.pty.create({ body, query: options })),
    remove: (id, options) => unwrap<PtyRemoveResponse>(sdk.pty.remove({ path: { id }, query: options })),
    get: (id, options) => unwrap<PtyGetResponse>(sdk.pty.get({ path: { id }, query: options })),
    update: (id, body, options) => unwrap<PtyUpdateResponse>(sdk.pty.update({ path: { id }, body, query: options })),
    connect: (id, options) => unwrap<PtyConnectResponse>(sdk.pty.connect({ path: { id }, query: options })),
  };
}
