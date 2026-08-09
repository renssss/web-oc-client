import { describe, expect, test } from "bun:test";
import type { OpencodeClient } from "@opencode-ai/sdk/client";
import { createOpencodeWebClient, EventStream } from "../src/index.ts";

const connected = { type: "event.server_connected", properties: {} };

function sdkWithSubscribe(subscribe: (options?: unknown) => Promise<unknown>): OpencodeClient {
  return { event: { subscribe } } as unknown as OpencodeClient;
}

describe("event streaming", () => {
  test("delivers events from the SSE stream", async () => {
    const generator = (async function* () {
      yield connected;
      yield { type: "event.session.created", properties: {} };
    })();
    const subscribe = async () => ({ stream: generator });
    const client = createOpencodeWebClient({ sdk: sdkWithSubscribe(subscribe) });
    const stream = await client.events();
    const received: unknown[] = [];
    for await (const event of stream) {
      received.push(event);
    }
    expect(received).toHaveLength(2);
    expect(received[0]).toEqual(connected);
  });

  test("abort() stops the stream and marks it aborted", async () => {
    let yielded = 0;
    const generator = (async function* () {
      while (true) {
        yielded++;
        yield connected;
      }
    })();
    const subscribe = async () => ({ stream: generator });
    const client = createOpencodeWebClient({ sdk: sdkWithSubscribe(subscribe) });
    const stream = await client.events();
    expect((await stream.next()).done).toBe(false);
    expect((await stream.next()).done).toBe(false);
    expect(yielded).toBe(2);
    stream.abort();
    expect(stream.isAborted).toBe(true);
    expect(stream.signal.aborted).toBe(true);
    expect((await stream.next()).done).toBe(true);
    expect(yielded).toBe(2);
  });

  test("return() releases the underlying source", async () => {
    let finalized = false;
    const generator = (async function* () {
      try {
        yield connected;
        yield connected;
      } finally {
        finalized = true;
      }
    })();
    const subscribe = async () => ({ stream: generator });
    const client = createOpencodeWebClient({ sdk: sdkWithSubscribe(subscribe) });
    const stream = await client.subscribe();
    await stream.next();
    await stream.return();
    expect(finalized).toBe(true);
  });

  test("passes retry options, signal, and query through to the SDK", async () => {
    let options: Record<string, unknown> | undefined;
    const generator = (async function* () {})();
    const subscribe = async (opts?: unknown) => {
      options = opts as Record<string, unknown>;
      return { stream: generator };
    };
    const client = createOpencodeWebClient({ sdk: sdkWithSubscribe(subscribe) });
    const onError = () => {};
    const stream = await client.events({ directory: "/w" }, { sseDefaultRetryDelay: 100, sseMaxRetryAttempts: 2, sseMaxRetryDelay: 500, onError });
    expect(options).toMatchObject({
      query: { directory: "/w" },
      sseDefaultRetryDelay: 100,
      sseMaxRetryAttempts: 2,
      sseMaxRetryDelay: 500,
    });
    expect(options?.["onSseError"]).toBeTypeOf("function");
    expect(stream.signal).toBeInstanceOf(AbortSignal);
  });

  test("surfaces a recorded stream error when the stream ends", async () => {
    const stream = new EventStream<unknown>(new AbortController());
    stream.bind((async function* () {})());
    stream.recordError(new Error("stream failed"));
    await expect(stream.next()).rejects.toThrow("stream failed");
  });
});
