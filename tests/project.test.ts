import { describe, expect, test } from "bun:test";
import type { OpencodeClient } from "@opencode-ai/sdk/client";
import { createOpencodeWebClient } from "../src/index.ts";
import { SuccessStub } from "./helpers.ts";

describe("project facade", () => {
  test("list delegates", async () => {
    const list = new SuccessStub([{ directory: "/w" }]);
    const sdk = { project: { list: list.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.project.list() as Promise<unknown>).resolves.toEqual([{ directory: "/w" }]);
    expect(list.calls).toEqual([{ query: undefined }]);
  });

  test("current delegates", async () => {
    const current = new SuccessStub({ directory: "/w" });
    const sdk = { project: { current: current.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.project.current() as Promise<unknown>).resolves.toEqual({ directory: "/w" });
    expect(current.calls).toEqual([{ query: undefined }]);
  });
});

describe("path facade", () => {
  test("get delegates", async () => {
    const get = new SuccessStub("/w");
    const sdk = { path: { get: get.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.path.get() as Promise<unknown>).resolves.toBe("/w");
    expect(get.calls).toEqual([{ query: undefined }]);
  });
});

describe("vcs facade", () => {
  test("get delegates", async () => {
    const get = new SuccessStub({ branch: "main" });
    const sdk = { vcs: { get: get.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.vcs.get() as Promise<unknown>).resolves.toEqual({ branch: "main" });
    expect(get.calls).toEqual([{ query: undefined }]);
  });
});

describe("instance facade", () => {
  test("dispose delegates", async () => {
    const dispose = new SuccessStub(true);
    const sdk = { instance: { dispose: dispose.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.instance.dispose() as Promise<unknown>).resolves.toBe(true);
    expect(dispose.calls).toEqual([{ query: undefined }]);
  });
});

describe("file facade", () => {
  test("list delegates the path", async () => {
    const list = new SuccessStub([{ path: "/w/src" }]);
    const sdk = { file: { list: list.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.file.list("/w/src") as Promise<unknown>).resolves.toEqual([{ path: "/w/src" }]);
    expect(list.calls).toEqual([{ query: { path: "/w/src" } }]);
  });

  test("read delegates the path", async () => {
    const read = new SuccessStub({ content: "x" });
    const sdk = { file: { read: read.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.file.read("/w/a.ts", { directory: "/w" }) as Promise<unknown>).resolves.toEqual({ content: "x" });
    expect(read.calls).toEqual([{ query: { path: "/w/a.ts", directory: "/w" } }]);
  });

  test("status delegates", async () => {
    const status = new SuccessStub([{ path: "/w/a.ts" }]);
    const sdk = { file: { status: status.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.file.status() as Promise<unknown>).resolves.toEqual([{ path: "/w/a.ts" }]);
    expect(status.calls).toEqual([{ query: undefined }]);
  });
});

describe("find facade", () => {
  test("text delegates the pattern", async () => {
    const text = new SuccessStub([{ path: "/w/a.ts", line: 1 }]);
    const sdk = { find: { text: text.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.find.text("hello", { directory: "/w" }) as Promise<unknown>).resolves.toEqual([{ path: "/w/a.ts", line: 1 }]);
    expect(text.calls).toEqual([{ query: { pattern: "hello", directory: "/w" } }]);
  });

  test("files delegates the query", async () => {
    const files = new SuccessStub([{ path: "/w/a.ts" }]);
    const sdk = { find: { files: files.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.find.files("a.ts") as Promise<unknown>).resolves.toEqual([{ path: "/w/a.ts" }]);
    expect(files.calls).toEqual([{ query: { query: "a.ts" } }]);
  });

  test("symbols delegates the query", async () => {
    const symbols = new SuccessStub([{ name: "Foo" }]);
    const sdk = { find: { symbols: symbols.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.find.symbols("Foo") as Promise<unknown>).resolves.toEqual([{ name: "Foo" }]);
    expect(symbols.calls).toEqual([{ query: { query: "Foo" } }]);
  });
});
