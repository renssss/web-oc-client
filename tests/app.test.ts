import { describe, expect, test } from "bun:test";
import type { OpencodeClient } from "@opencode-ai/sdk/client";
import { createOpencodeWebClient } from "../src/index.ts";
import { SuccessStub } from "./helpers.ts";

describe("app facade", () => {
  test("log delegates the entry body", async () => {
    const log = new SuccessStub({ ok: true });
    const sdk = { app: { log: log.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.app.log({ service: "web", level: "info", message: "hi" }) as Promise<unknown>).resolves.toEqual({ ok: true });
    expect(log.calls).toEqual([{ body: { service: "web", level: "info", message: "hi" }, query: undefined }]);
  });

  test("agents delegates", async () => {
    const agents = new SuccessStub([{ name: "primary" }]);
    const sdk = { app: { agents: agents.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.app.agents() as Promise<unknown>).resolves.toEqual([{ name: "primary" }]);
    expect(agents.calls).toEqual([{ query: undefined }]);
  });
});

describe("lsp facade", () => {
  test("status delegates", async () => {
    const status = new SuccessStub([{ servers: [] }]);
    const sdk = { lsp: { status: status.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.lsp.status() as Promise<unknown>).resolves.toEqual([{ servers: [] }]);
    expect(status.calls).toEqual([{ query: undefined }]);
  });
});

describe("formatter facade", () => {
  test("status delegates", async () => {
    const status = new SuccessStub([{ name: "prettier" }]);
    const sdk = { formatter: { status: status.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.formatter.status() as Promise<unknown>).resolves.toEqual([{ name: "prettier" }]);
    expect(status.calls).toEqual([{ query: undefined }]);
  });
});
