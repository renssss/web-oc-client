import { describe, expect, test } from "bun:test";
import type { OpencodeClient } from "@opencode-ai/sdk/client";
import { createOpencodeWebClient } from "../src/index.ts";
import { SuccessStub } from "./helpers.ts";

describe("tui facade", () => {
  test("appendPrompt delegates the text body", async () => {
    const appendPrompt = new SuccessStub(true);
    const sdk = { tui: { appendPrompt: appendPrompt.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.tui.appendPrompt({ text: "hi" }) as Promise<unknown>).resolves.toBe(true);
    expect(appendPrompt.calls).toEqual([{ body: { text: "hi" }, query: undefined }]);
  });

  test("submitPrompt delegates", async () => {
    const submitPrompt = new SuccessStub(true);
    const sdk = { tui: { submitPrompt: submitPrompt.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.tui.submitPrompt() as Promise<unknown>).resolves.toBe(true);
    expect(submitPrompt.calls).toEqual([{ query: undefined }]);
  });

  test("clearPrompt delegates", async () => {
    const clearPrompt = new SuccessStub(true);
    const sdk = { tui: { clearPrompt: clearPrompt.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.tui.clearPrompt() as Promise<unknown>).resolves.toBe(true);
    expect(clearPrompt.calls).toEqual([{ query: undefined }]);
  });

  test("openHelp delegates", async () => {
    const openHelp = new SuccessStub(true);
    const sdk = { tui: { openHelp: openHelp.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.tui.openHelp() as Promise<unknown>).resolves.toBe(true);
    expect(openHelp.calls).toEqual([{ query: undefined }]);
  });

  test("openSessions delegates", async () => {
    const openSessions = new SuccessStub(true);
    const sdk = { tui: { openSessions: openSessions.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.tui.openSessions() as Promise<unknown>).resolves.toBe(true);
    expect(openSessions.calls).toEqual([{ query: undefined }]);
  });

  test("openThemes delegates", async () => {
    const openThemes = new SuccessStub(true);
    const sdk = { tui: { openThemes: openThemes.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.tui.openThemes() as Promise<unknown>).resolves.toBe(true);
    expect(openThemes.calls).toEqual([{ query: undefined }]);
  });

  test("openModels delegates", async () => {
    const openModels = new SuccessStub(true);
    const sdk = { tui: { openModels: openModels.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.tui.openModels() as Promise<unknown>).resolves.toBe(true);
    expect(openModels.calls).toEqual([{ query: undefined }]);
  });

  test("executeCommand delegates the command body", async () => {
    const executeCommand = new SuccessStub(true);
    const sdk = { tui: { executeCommand: executeCommand.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.tui.executeCommand({ command: "agent.cycle" }) as Promise<unknown>).resolves.toBe(true);
    expect(executeCommand.calls).toEqual([{ body: { command: "agent.cycle" }, query: undefined }]);
  });

  test("showToast delegates the toast body", async () => {
    const showToast = new SuccessStub(true);
    const sdk = { tui: { showToast: showToast.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.tui.showToast({ message: "hi", variant: "info" }) as Promise<unknown>).resolves.toBe(true);
    expect(showToast.calls).toEqual([{ body: { message: "hi", variant: "info" }, query: undefined }]);
  });

  test("publish delegates the event body", async () => {
    const publish = new SuccessStub({});
    const sdk = { tui: { publish: publish.fn } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.tui.publish({ type: "tui.prompt.append", properties: { text: "hi" } }) as Promise<unknown>).resolves.toEqual({});
    expect(publish.calls).toEqual([
      { body: { type: "tui.prompt.append", properties: { text: "hi" } }, query: undefined },
    ]);
  });
});

describe("tui.control facade", () => {
  test("next delegates", async () => {
    const next = new SuccessStub({});
    const sdk = { tui: { control: { next: next.fn } } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.tui.control.next() as Promise<unknown>).resolves.toEqual({});
    expect(next.calls).toEqual([{ query: undefined }]);
  });

  test("response delegates the body", async () => {
    const response = new SuccessStub(true);
    const sdk = { tui: { control: { response: response.fn } } } as unknown as OpencodeClient;
    const client = createOpencodeWebClient({ sdk });
    await expect(client.tui.control.response({ answer: "ok" }) as Promise<unknown>).resolves.toBe(true);
    expect(response.calls).toEqual([{ body: { answer: "ok" }, query: undefined }]);
  });
});
