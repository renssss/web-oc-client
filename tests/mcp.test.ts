import { describe, expect, test } from "bun:test";
import type { OpencodeClient } from "@opencode-ai/sdk/client";
import { createOpencodeWebClient } from "../src/index.ts";
import { SuccessStub } from "./helpers.ts";

describe("mcp facade", () => {
  test("status delegates", async () => {
    const status = new SuccessStub({ servers: {} });
    const sdk = { mcp: { status: status.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.mcp.status() as Promise<unknown>).resolves.toEqual({ servers: {} });
    expect(status.calls).toEqual([{ query: undefined }]);
  });

  test("add delegates the server config", async () => {
    const add = new SuccessStub({});
    const sdk = { mcp: { add: add.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.mcp.add({ name: "n", config: { type: "local", command: ["deno", "run", "main.ts"] } }) as Promise<unknown>).resolves.toEqual({});
    expect(add.calls).toEqual([
      { body: { name: "n", config: { type: "local", command: ["deno", "run", "main.ts"] } }, query: undefined },
    ]);
  });

  test("connect delegates the server name", async () => {
    const connect = new SuccessStub({});
    const sdk = { mcp: { connect: connect.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.mcp.connect("n") as Promise<unknown>).resolves.toEqual({});
    expect(connect.calls).toEqual([{ path: { name: "n" }, query: undefined }]);
  });

  test("disconnect delegates the server name", async () => {
    const disconnect = new SuccessStub({});
    const sdk = { mcp: { disconnect: disconnect.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.mcp.disconnect("n") as Promise<unknown>).resolves.toEqual({});
    expect(disconnect.calls).toEqual([{ path: { name: "n" }, query: undefined }]);
  });
});

describe("auth facade", () => {
  test("remove delegates the server name", async () => {
    const remove = new SuccessStub({});
    const sdk = { auth: { remove: remove.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.auth.remove("n") as Promise<unknown>).resolves.toEqual({});
    expect(remove.calls).toEqual([{ path: { name: "n" }, query: undefined }]);
  });

  test("start delegates the server name", async () => {
    const start = new SuccessStub({ url: "https://auth.example.com" });
    const sdk = { auth: { start: start.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.auth.start("n") as Promise<unknown>).resolves.toEqual({ url: "https://auth.example.com" });
    expect(start.calls).toEqual([{ path: { name: "n" }, query: undefined }]);
  });

  test("callback delegates code body", async () => {
    const callback = new SuccessStub({});
    const sdk = { auth: { callback: callback.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.auth.callback("n", { code: "abc" }) as Promise<unknown>).resolves.toEqual({});
    expect(callback.calls).toEqual([{ path: { name: "n" }, body: { code: "abc" }, query: undefined }]);
  });

  test("authenticate delegates the server name", async () => {
    const authenticate = new SuccessStub({});
    const sdk = { auth: { authenticate: authenticate.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.auth.authenticate("n") as Promise<unknown>).resolves.toEqual({});
    expect(authenticate.calls).toEqual([{ path: { name: "n" }, query: undefined }]);
  });

  test("set delegates id and auth body", async () => {
    const set = new SuccessStub(true);
    const sdk = { auth: { set: set.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.auth.set("openai", { type: "api", key: "k" }) as Promise<unknown>).resolves.toBe(true);
    expect(set.calls).toEqual([{ path: { id: "openai" }, body: { type: "api", key: "k" }, query: undefined }]);
  });

  test("mcp.auth exposes the same methods", async () => {
    const remove = new SuccessStub({});
    const sdk = { auth: { remove: remove.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.mcp.auth.remove("n") as Promise<unknown>).resolves.toEqual({});
    expect(remove.calls).toEqual([{ path: { name: "n" }, query: undefined }]);
  });
});
