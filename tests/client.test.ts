import { describe, expect, test } from "bun:test";
import type { OpencodeClient } from "@opencode-ai/sdk/client";
import { createOpencodeWebClient, OpencodeClientError, resolveBaseUrl } from "../src/index.ts";

describe("createOpencodeWebClient", () => {
  test("resolves the base URL from an explicit option", () => {
    const client = createOpencodeWebClient({ baseUrl: "http://example.com:1111" });
    expect(resolveBaseUrl({ baseUrl: "http://example.com:1111" })).toBe("http://example.com:1111");
    expect(client.sdk).toBeDefined();
  });

  test("an unreachable server rejects with a clear connection error", async () => {
    const client = createOpencodeWebClient({
      baseUrl: "http://127.0.0.1:54321",
      fetch: async () => {
        throw new TypeError("fetch failed");
      },
    });
    const err = await client.project.list().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(OpencodeClientError);
    expect(err).toMatchObject({ name: "OpencodeClientError" });
    expect((err as OpencodeClientError).message).toBe("Failed to connect to the opencode server (connection error)");
  });

  test("a failing request propagates a typed error with server status and message", async () => {
    const sdk = {
      project: {
        list: async () => ({
          data: undefined,
          error: { name: "BadRequest", data: { message: "nope" } },
          request: {} as Request,
          response: { status: 400 } as Response,
        }),
      },
    } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    const err = await client.project.list().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(OpencodeClientError);
    expect(err).toMatchObject({ message: "nope", status: 400 });
  });
});
