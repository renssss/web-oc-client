import { describe, expect, test } from "bun:test";
import type { OpencodeClient } from "@opencode-ai/sdk/client";
import { createOpencodeWebClient } from "../src/index.ts";
import { SuccessStub } from "./helpers.ts";

describe("config facade", () => {
  test("get delegates", async () => {
    const get = new SuccessStub({ theme: "dark" });
    const sdk = { config: { get: get.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.config.get() as Promise<unknown>).resolves.toEqual({ theme: "dark" });
    expect(get.calls).toEqual([{ query: undefined }]);
  });

  test("update delegates the config body", async () => {
    const update = new SuccessStub({ theme: "light" });
    const sdk = { config: { update: update.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.config.update({ theme: "light" }) as Promise<unknown>).resolves.toEqual({ theme: "light" });
    expect(update.calls).toEqual([{ body: { theme: "light" }, query: undefined }]);
  });

  test("providers delegates", async () => {
    const providers = new SuccessStub(["openai"]);
    const sdk = { config: { providers: providers.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.config.providers() as Promise<unknown>).resolves.toEqual(["openai"]);
    expect(providers.calls).toEqual([{ query: undefined }]);
  });
});

describe("tool facade", () => {
  test("ids delegates", async () => {
    const ids = new SuccessStub(["bash", "edit"]);
    const sdk = { tool: { ids: ids.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.tool.ids() as Promise<unknown>).resolves.toEqual(["bash", "edit"]);
    expect(ids.calls).toEqual([{ query: undefined }]);
  });

  test("list delegates provider/model query", async () => {
    const list = new SuccessStub([{ name: "bash" }]);
    const sdk = { tool: { list: list.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.tool.list({ provider: "openai", model: "gpt" }) as Promise<unknown>).resolves.toEqual([{ name: "bash" }]);
    expect(list.calls).toEqual([{ query: { provider: "openai", model: "gpt" } }]);
  });
});

describe("provider facade", () => {
  test("list delegates", async () => {
    const list = new SuccessStub({ all: [] });
    const sdk = { provider: { list: list.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.provider.list() as Promise<unknown>).resolves.toEqual({ all: [] });
    expect(list.calls).toEqual([{ query: undefined }]);
  });

  test("auth delegates", async () => {
    const auth = new SuccessStub({ openai: [] });
    const sdk = { provider: { auth: auth.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.provider.auth() as Promise<unknown>).resolves.toEqual({ openai: [] });
    expect(auth.calls).toEqual([{ query: undefined }]);
  });

  test("oauth.authorize delegates", async () => {
    const authorize = new SuccessStub({ url: "https://auth.example.com" });
    const sdk = { provider: { oauth: { authorize: authorize.fn } } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.provider.oauth.authorize("openai", { method: 0 }) as Promise<unknown>).resolves.toEqual({ url: "https://auth.example.com" });
    expect(authorize.calls).toEqual([{ path: { id: "openai" }, body: { method: 0 }, query: undefined }]);
  });

  test("oauth.callback delegates", async () => {
    const callback = new SuccessStub({ ok: true });
    const sdk = { provider: { oauth: { callback: callback.fn } } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.provider.oauth.callback("openai", { method: 0, code: "abc" }) as Promise<unknown>).resolves.toEqual({ ok: true });
    expect(callback.calls).toEqual([{ path: { id: "openai" }, body: { method: 0, code: "abc" }, query: undefined }]);
  });
});

describe("command facade", () => {
  test("list delegates", async () => {
    const list = new SuccessStub([{ name: "init" }]);
    const sdk = { command: { list: list.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.command.list() as Promise<unknown>).resolves.toEqual([{ name: "init" }]);
    expect(list.calls).toEqual([{ query: undefined }]);
  });
});
