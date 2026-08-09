import { describe, expect, test } from "bun:test";
import type { OpencodeClient } from "@opencode-ai/sdk/client";
import { createOpencodeWebClient } from "../src/index.ts";
import { SuccessStub } from "./helpers.ts";

function makeClient(stubs: Record<string, SuccessStub>): ReturnType<typeof createOpencodeWebClient> {
  const pty: Record<string, (options?: unknown) => Promise<unknown>> = {};
  for (const [name, stub] of Object.entries(stubs)) {
    pty[name] = stub.fn;
  }
  const sdk = { pty } as unknown as OpencodeClient;
  return createOpencodeWebClient({ sdk });
}

describe("pty facade", () => {
  test("list delegates", async () => {
    const list = new SuccessStub([]);
    const client = makeClient({ list });
    await expect(client.pty.list() as Promise<unknown>).resolves.toEqual([]);
    expect(list.calls).toEqual([{ query: undefined }]);
  });

  test("create delegates the PTY body", async () => {
    const create = new SuccessStub({ id: "p1" });
    const client = makeClient({ create });
    await expect(client.pty.create({ command: "bash" }) as Promise<unknown>).resolves.toEqual({ id: "p1" });
    expect(create.calls).toEqual([{ body: { command: "bash" }, query: undefined }]);
  });

  test("remove delegates the id", async () => {
    const remove = new SuccessStub(true);
    const client = makeClient({ remove });
    await expect(client.pty.remove("p1") as Promise<unknown>).resolves.toBe(true);
    expect(remove.calls).toEqual([{ path: { id: "p1" }, query: undefined }]);
  });

  test("get delegates the id", async () => {
    const get = new SuccessStub({ id: "p1" });
    const client = makeClient({ get });
    await expect(client.pty.get("p1") as Promise<unknown>).resolves.toEqual({ id: "p1" });
    expect(get.calls).toEqual([{ path: { id: "p1" }, query: undefined }]);
  });

  test("update delegates body and path", async () => {
    const update = new SuccessStub({ id: "p1", title: "t" });
    const client = makeClient({ update });
    await expect(client.pty.update("p1", { title: "t" }) as Promise<unknown>).resolves.toEqual({ id: "p1", title: "t" });
    expect(update.calls).toEqual([{ path: { id: "p1" }, body: { title: "t" }, query: undefined }]);
  });

  test("connect delegates the id", async () => {
    const connect = new SuccessStub({ stream: "pty://p1" });
    const client = makeClient({ connect });
    await expect(client.pty.connect("p1") as Promise<unknown>).resolves.toEqual({ stream: "pty://p1" });
    expect(connect.calls).toEqual([{ path: { id: "p1" }, query: undefined }]);
  });
});
