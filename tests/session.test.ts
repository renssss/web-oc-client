import { describe, expect, test } from "bun:test";
import type { OpencodeClient } from "@opencode-ai/sdk/client";
import { createOpencodeWebClient, OpencodeClientError } from "../src/index.ts";
import { ErrorStub, SuccessStub } from "./helpers.ts";

function makeClient(stubs: Record<string, SuccessStub | ErrorStub>): ReturnType<typeof createOpencodeWebClient> {
  const session: Record<string, (options?: unknown) => Promise<unknown>> = {};
  for (const [name, stub] of Object.entries(stubs)) {
    session[name] = stub.fn;
  }
  const sdk = { session } as unknown as OpencodeClient;
  return createOpencodeWebClient({ sdk });
}

describe("session facade", () => {
  test("list delegates and unwraps the data", async () => {
    const list = new SuccessStub([{ id: "s1" }]);
    const client = makeClient({ list });
    await expect(client.session.list({ directory: "/w" }) as Promise<unknown>).resolves.toEqual([{ id: "s1" }]);
    expect(list.calls).toEqual([{ query: { directory: "/w" } }]);
  });

  test("create delegates body and query", async () => {
    const create = new SuccessStub({ id: "s2" });
    const client = makeClient({ create });
    await expect(client.session.create({ parentID: "s1", title: "t" }, { directory: "/w" }) as Promise<unknown>).resolves.toEqual({ id: "s2" });
    expect(create.calls).toEqual([{ body: { parentID: "s1", title: "t" }, query: { directory: "/w" } }]);
  });

  test("status delegates", async () => {
    const status = new SuccessStub({ s1: "active" });
    const client = makeClient({ status });
    await expect(client.session.status({ directory: "/w" }) as Promise<unknown>).resolves.toEqual({ s1: "active" });
    expect(status.calls).toEqual([{ query: { directory: "/w" } }]);
  });

  test("get delegates the session id", async () => {
    const get = new SuccessStub({ id: "s1" });
    const client = makeClient({ get });
    await expect(client.session.get("s1") as Promise<unknown>).resolves.toEqual({ id: "s1" });
    expect(get.calls).toEqual([{ path: { id: "s1" }, query: undefined }]);
  });

  test("update delegates body and path", async () => {
    const update = new SuccessStub({ id: "s1", title: "x" });
    const client = makeClient({ update });
    await expect(client.session.update("s1", { title: "x" }) as Promise<unknown>).resolves.toEqual({ id: "s1", title: "x" });
    expect(update.calls).toEqual([{ path: { id: "s1" }, body: { title: "x" }, query: undefined }]);
  });

  test("delete delegates", async () => {
    const del = new SuccessStub(true);
    const client = makeClient({ delete: del });
    await expect(client.session.delete("s1") as Promise<unknown>).resolves.toBe(true);
    expect(del.calls).toEqual([{ path: { id: "s1" }, query: undefined }]);
  });

  test("children delegates", async () => {
    const children = new SuccessStub([]);
    const client = makeClient({ children });
    await expect(client.session.children("s1") as Promise<unknown>).resolves.toEqual([]);
    expect(children.calls).toEqual([{ path: { id: "s1" }, query: undefined }]);
  });

  test("todo delegates", async () => {
    const todo = new SuccessStub({ todos: [] });
    const client = makeClient({ todo });
    await expect(client.session.todo("s1") as Promise<unknown>).resolves.toEqual({ todos: [] });
    expect(todo.calls).toEqual([{ path: { id: "s1" }, query: undefined }]);
  });

  test("init delegates the AGENTS.md analysis body", async () => {
    const init = new SuccessStub({ ok: true });
    const client = makeClient({ init });
    await expect(client.session.init("s1", { modelID: "m", providerID: "p", messageID: "msg" }) as Promise<unknown>).resolves.toEqual({ ok: true });
    expect(init.calls).toEqual([{ path: { id: "s1" }, body: { modelID: "m", providerID: "p", messageID: "msg" }, query: undefined }]);
  });

  test("fork delegates the fork point", async () => {
    const fork = new SuccessStub({ id: "s2" });
    const client = makeClient({ fork });
    await expect(client.session.fork("s1", { messageID: "msg" }) as Promise<unknown>).resolves.toEqual({ id: "s2" });
    expect(fork.calls).toEqual([{ path: { id: "s1" }, body: { messageID: "msg" }, query: undefined }]);
  });

  test("abort delegates", async () => {
    const abort = new SuccessStub({ ok: true });
    const client = makeClient({ abort });
    await expect(client.session.abort("s1") as Promise<unknown>).resolves.toEqual({ ok: true });
    expect(abort.calls).toEqual([{ path: { id: "s1" }, query: undefined }]);
  });

  test("share delegates", async () => {
    const share = new SuccessStub({ url: "https://opencode.ai/s/1" });
    const client = makeClient({ share });
    await expect(client.session.share("s1") as Promise<unknown>).resolves.toEqual({ url: "https://opencode.ai/s/1" });
    expect(share.calls).toEqual([{ path: { id: "s1" }, query: undefined }]);
  });

  test("unshare delegates", async () => {
    const unshare = new SuccessStub(true);
    const client = makeClient({ unshare });
    await expect(client.session.unshare("s1") as Promise<unknown>).resolves.toBe(true);
    expect(unshare.calls).toEqual([{ path: { id: "s1" }, query: undefined }]);
  });

  test("diff delegates with query params", async () => {
    const diff = new SuccessStub({ changes: [] });
    const client = makeClient({ diff });
    await expect(client.session.diff("s1", { messageID: "msg" }) as Promise<unknown>).resolves.toEqual({ changes: [] });
    expect(diff.calls).toEqual([{ path: { id: "s1" }, query: { messageID: "msg" } }]);
  });

  test("summarize delegates the model body", async () => {
    const summarize = new SuccessStub({ summary: "..." });
    const client = makeClient({ summarize });
    await expect(client.session.summarize("s1", { providerID: "p", modelID: "m" }) as Promise<unknown>).resolves.toEqual({ summary: "..." });
    expect(summarize.calls).toEqual([{ path: { id: "s1" }, body: { providerID: "p", modelID: "m" }, query: undefined }]);
  });

  test("messages delegates with limit", async () => {
    const messages = new SuccessStub([]);
    const client = makeClient({ messages });
    await expect(client.session.messages("s1", { limit: 5 }) as Promise<unknown>).resolves.toEqual([]);
    expect(messages.calls).toEqual([{ path: { id: "s1" }, query: { limit: 5 } }]);
  });

  test("message delegates id and messageID", async () => {
    const message = new SuccessStub({ info: { id: "m1" } });
    const client = makeClient({ message });
    await expect(client.session.message("s1", "m1") as Promise<unknown>).resolves.toEqual({ info: { id: "m1" } });
    expect(message.calls).toEqual([{ path: { id: "s1", messageID: "m1" }, query: undefined }]);
  });

  test("prompt delegates the chat params body", async () => {
    const prompt = new SuccessStub({ info: { role: "assistant" }, parts: [] });
    const client = makeClient({ prompt });
    await expect(client.session.prompt("s1", { parts: [] }) as Promise<unknown>).resolves.toEqual({ info: { role: "assistant" }, parts: [] });
    expect(prompt.calls).toEqual([{ path: { id: "s1" }, body: { parts: [] }, query: undefined }]);
  });

  test("promptAsync delegates", async () => {
    const promptAsync = new SuccessStub({ ok: true });
    const client = makeClient({ promptAsync });
    await expect(client.session.promptAsync("s1", { parts: [] }) as Promise<unknown>).resolves.toEqual({ ok: true });
    expect(promptAsync.calls).toEqual([{ path: { id: "s1" }, body: { parts: [] }, query: undefined }]);
  });

  test("command delegates", async () => {
    const command = new SuccessStub({});
    const client = makeClient({ command });
    await expect(client.session.command("s1", { command: "c", arguments: "a" }) as Promise<unknown>).resolves.toEqual({});
    expect(command.calls).toEqual([{ path: { id: "s1" }, body: { command: "c", arguments: "a" }, query: undefined }]);
  });

  test("shell delegates", async () => {
    const shell = new SuccessStub({ output: "ok" });
    const client = makeClient({ shell });
    await expect(client.session.shell("s1", { agent: "primary", command: "ls" }) as Promise<unknown>).resolves.toEqual({ output: "ok" });
    expect(shell.calls).toEqual([{ path: { id: "s1" }, body: { agent: "primary", command: "ls" }, query: undefined }]);
  });

  test("revert delegates", async () => {
    const revert = new SuccessStub({ ok: true });
    const client = makeClient({ revert });
    await expect(client.session.revert("s1", { messageID: "m1" }) as Promise<unknown>).resolves.toEqual({ ok: true });
    expect(revert.calls).toEqual([{ path: { id: "s1" }, body: { messageID: "m1" }, query: undefined }]);
  });

  test("unrevert delegates", async () => {
    const unrevert = new SuccessStub({ ok: true });
    const client = makeClient({ unrevert });
    await expect(client.session.unrevert("s1") as Promise<unknown>).resolves.toEqual({ ok: true });
    expect(unrevert.calls).toEqual([{ path: { id: "s1" }, query: undefined }]);
  });

  test("permission responds via the permission endpoint", async () => {
    const permission = new SuccessStub(true);
    const sdk = {
      postSessionIdPermissionsPermissionId: permission.fn,
    } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.session.permission("s1", "perm1", "once") as Promise<unknown>).resolves.toBe(true);
    expect(permission.calls).toEqual([{ path: { id: "s1", permissionID: "perm1" }, body: { response: "once" }, query: undefined }]);
  });

  test("rejects with a typed error carrying the server status and message", async () => {
    const get = new ErrorStub({ name: "NotFoundError", data: { message: "missing" } }, 404);
    const client = makeClient({ get });
    const err = await client.session.get("nope").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(OpencodeClientError);
    expect(err).toMatchObject({ message: "missing", status: 404 });
  });
});
